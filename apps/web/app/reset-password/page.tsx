"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OTPInput } from "@/components/ui/otp-input"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { forgotPasswordSchema } from "@repo/validation"
import { api, ApiClientError } from "@/lib/api-client"

import Link from "next/link"
import logo from "@/public/dark-logo.png";
import Image from "next/image";

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type FormData = {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
};
type FormErrors = Partial<Record<"newPassword" | "confirmNewPassword", string>>;

function isZodError(error: unknown): error is z.ZodError {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'ZodError' &&
    'errors' in error &&
    Array.isArray((error as any).errors)
  );
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const emailFromQuery = searchParams?.get('email') || ""

  const [formData, setFormData] = useState<FormData>({
    email: emailFromQuery,
    otp: "",
    newPassword: "",
    confirmNewPassword: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [success, setSuccess] = useState(false)
  const [visible, setVisible] = useState(false)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)

  const verifyOtp = async () => {
    setLoading(true)
    try {
      const response = await api.post<{ valid: boolean; message?: string }>(
        '/api/v1/auth/verify-otp',
        { email: formData.email.toLowerCase().trim(), otp: formData.otp },
        { requireAuth: false }
      )

      if (!response.valid) {
        setOtpVerified(false)
        setOtpAttempts(prev => prev + 1)
        toast.error(response.message || "Invalid OTP code")
      } else {
        setOtpVerified(true)
        setOtpAttempts(0)
        toast.success("OTP verified! Please enter your new password.")
      }
    } catch (error: unknown) {
      setOtpVerified(false)
      setOtpAttempts(prev => prev + 1)
      if (error instanceof ApiClientError) {
        toast.error(error.message || "Failed to verify OTP")
      } else {
        toast.error("Failed to verify OTP. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleOtpChange = useCallback((otpValue: string) => {
    setFormData(prev => ({ ...prev, otp: otpValue }))
    if (otpValue.length < 6) {
      setOtpVerified(false)
    }
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!otpVerified) {
      if (formData.otp.length !== 6) {
        toast.error("Please enter the 6-digit OTP code")
        return
      }

      await verifyOtp()
      return
    }

    try {
      // Validate passwords only (OTP handled by server)
      const validatedPasswords = passwordSchema.parse({
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      })
      setLoading(true)

      await api.post<{ message: string }>(
        '/api/v1/auth/reset-password',
        {
          email: formData.email.toLowerCase().trim(),
          otp: formData.otp,
          newPassword: validatedPasswords.newPassword,
          confirmNewPassword: validatedPasswords.confirmNewPassword,
        },
        { requireAuth: false }
      )

      setSuccess(true)
      toast.success("Password reset successful! Redirecting to login...")
    } catch (error: unknown) {
      if (isZodError(error)) {
        const fieldErrors: FormErrors = {}
        error.errors.forEach(err => {
          if (err.path[0] === "newPassword" || err.path[0] === "confirmNewPassword") {
            fieldErrors[err.path[0] as keyof FormErrors] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error(error.errors[0]?.message || "Validation failed")
      } else if (error instanceof ApiClientError) {
        const errorMsg = error.message || "Failed to reset password"

        if (errorMsg.includes("OTP") || errorMsg.includes("expired")) {
          setOtpVerified(false)
        } else if (error.errors && error.errors.length > 0) {
          const fieldErrors: FormErrors = {}
          error.errors.forEach(err => {
            if (err.path && (err.path === "newPassword" || err.path === "confirmNewPassword")) {
              fieldErrors[err.path as keyof FormErrors] = err.message
            }
          })
          setErrors(fieldErrors)
        }

        toast.error(errorMsg)
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const requestNewOtp = async () => {
    if (!formData.email) {
      toast.error("Email is required")
      return
    }

    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before requesting a new OTP`)
      return
    }

    setLoading(true)
    setOtpVerified(false)
    setOtpAttempts(0)

    try {
      const validatedData = forgotPasswordSchema.parse({ email: formData.email })
      await api.post<{ message: string }>(
        '/api/v1/auth/forgot-password',
        { email: validatedData.email.toLowerCase().trim() },
        { requireAuth: false }
      )

      setResendCooldown(60)
      const cooldownInterval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      toast.success("New OTP sent! Please check your email.")
    } catch (error: unknown) {
      if (isZodError(error)) {
        toast.error(error.errors[0]?.message || "Invalid email")
      } else if (error instanceof ApiClientError) {
        toast.error(error.message || "Failed to send OTP")
      } else {
        toast.error("Failed to send OTP. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // --- The JSX remains unchanged as it's already well-structured. ---
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="mb-8">
      </div>
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-6 justify-center relative gap-4 flex">
            <Link href="/login" className="w-full text-zinc-600 hover:text-zinc-800 absolute top-0 left-0">
              <ArrowLeft className="mr-2 h-6 w-8" />
            </Link>
            <Link href="/">
              <Image src={logo} alt="Script AI" width={100} height={1000} />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter the OTP code you received in your email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {otpVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-md flex items-start gap-2 text-sm h-full w-full">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>
                OTP verified! You can now reset your password.
              </span>
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center space-y-4 rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-800/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-green-900 dark:text-green-200">Password Reset Successful!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">You will be redirected to the login page shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  placeholder="name@example.com"
                  value={formData.email}
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>

              {/* OTP Input */}
              <div className="space-y-2 flex flex-col items-center">

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Enter the 6-digit code sent to your email
                </p>

                <OTPInput
                  value={formData.otp}
                  onChange={handleOtpChange}
                  length={6}
                  disabled={loading || otpVerified}
                  autoFocus={!!formData.email && !otpVerified}
                />
                {!otpVerified && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={requestNewOtp}
                      disabled={loading || resendCooldown > 0}
                      className="h-auto p-0 text-xs"
                    >
                      {resendCooldown > 0
                        ? `Request new OTP (${resendCooldown}s)`
                        : otpAttempts === 0
                          ? "Didn't receive code? Resend OTP"
                          : "Request new OTP"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Password Inputs - Only show after OTP verification */}
              {otpVerified && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={visible ? "text" : "password"}
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        disabled={loading || !otpVerified}
                        className={errors.newPassword ? "border-destructive" : ""}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setVisible(!visible)}
                      >
                        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      disabled={loading || !otpVerified}
                      className={errors.confirmNewPassword ? "border-destructive" : ""}
                      required
                    />
                    {errors.confirmNewPassword && (
                      <p className="text-sm text-destructive">{errors.confirmNewPassword}</p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full text-base font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                disabled={loading || (!otpVerified && formData.otp.length !== 6)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : !otpVerified ? (
                  "Verify OTP"
                ) : (
                  "Reset Password"
                )}
              </Button>


            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col md:flex-row md:justify-between md:gap-4">

        </CardFooter>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
