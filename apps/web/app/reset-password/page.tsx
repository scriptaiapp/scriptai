"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z, ZodError } from "zod"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { resetPasswordSchema } from "@repo/validation"

import Link from "next/link"
import logo from "@/public/dark-logo.png";
import Image from "next/image";

type FormData = z.infer<typeof resetPasswordSchema>
type FormErrors = Partial<Record<keyof FormData, string>>


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

export default function ResetPasswordPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [formData, setFormData] = useState<FormData>({ newPassword: "", confirmNewPassword: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [canUpdatePassword, setCanUpdatePassword] = useState(false)
  const [visible, setVisible] = useState(false)


  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session)
      if (event === "SIGNED_IN") {
        setCanUpdatePassword(true)
      } else if (event === "PASSWORD_RECOVERY") {
        setCanUpdatePassword(true)
      }
    })

    const timer = setTimeout(() => {
      if (!canUpdatePassword) {
        toast.error("Invalid or Expired Link", {
          description: "The password reset link is invalid or has expired. Please request a new one.",
        })
      }
    }, 5000) // 5-second timeout

    // Cleanup the listener and the timer on component unmount.
    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
    // The dependency array is updated to reflect the variables used inside.
  }, [supabase, canUpdatePassword])


  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login")
      }, 3000)
      return () => clearTimeout(timer) // Cleanup the timer on component unmount
    }
  }, [success, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({}) // Clear previous errors

    try {
      resetPasswordSchema.parse(formData)
      setLoading(true)

      const { error } = await supabase.auth.updateUser({ password: formData.newPassword })
      if (error) throw error

      setSuccess(true)
      toast.success("Password Updated!", {
        description: "Your password has been successfully reset.",
      })
    } catch (error: any) {
      if (isZodError(error)) {
        const newErrors: FormErrors = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        toast.error("Password Update Failed", {
          description: error.message,
        })
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
          <div className="mb-8 justify-center gap-4 flex">
            <Link href="/">
              <Image src={logo} alt="Script AI" width={80} height={80} />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Create a new, strong password for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canUpdatePassword && !success && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>
                Verifying your reset link. If this message persists, the link may be invalid or expired.
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
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={visible ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={loading || !canUpdatePassword}
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
                  disabled={loading || !canUpdatePassword}
                  className={errors.confirmNewPassword ? "border-destructive" : ""}
                  required
                />
                {errors.confirmNewPassword && (
                  <p className="text-sm text-destructive">{errors.confirmNewPassword}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold  bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                disabled={loading || !canUpdatePassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full text-slate-600" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}