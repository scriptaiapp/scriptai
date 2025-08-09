"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, Mail, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import logo from "@/public/dark-logo.png";

export default function ForgotPasswordPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const redirectTo = `${window.location.origin}/reset-password`

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Check your email",
        description: "A password reset link has been sent.",
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">

      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-8 justify-center gap-4 flex">
            <Link href="/">
              <Image src={logo} alt="Script AI" width={80} height={80} />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            {success ? "Check your inbox for the reset link." : "No worries, we'll send you reset instructions."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="flex flex-col items-center space-y-4 rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-800/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-green-900 dark:text-green-200">Email Sent Successfully</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  We've sent an email to <strong>{email}</strong> with instructions to reset your password.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-x-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold  bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Reset Link"
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