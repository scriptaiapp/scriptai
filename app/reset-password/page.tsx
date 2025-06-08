"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import AuthHeader from "@/components/auth-header"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidLink, setIsValidLink] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Check if URL has valid query parameters for password reset
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const type = queryParams.get("type")
    const accessToken = queryParams.get("token")

    if (type === "recovery" && accessToken) {
      setIsValidLink(true)
    } else {
      setIsValidLink(false)
      toast({
        title: "Invalid password reset link",
        description: "Please use the link sent to your email.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 pt-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>Create a new password for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-md flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isValidLink && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-md flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Invalid password reset link. Please use the link sent to your email.</span>
              </div>
            )}

            {success ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-md flex flex-col items-center gap-2 text-center">
                <CheckCircle className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Password reset successful!</h3>
                <p className="text-sm">Your password has been successfully updated.</p>
                <p className="text-sm mt-2">You'll be redirected to login shortly...</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate}>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        disabled={loading || !isValidLink}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading || !isValidLink}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        disabled={loading || !isValidLink}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading || !isValidLink}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={loading || !isValidLink}
                  >
                    {loading ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push("/login")}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
