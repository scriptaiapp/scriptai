"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { Eye, EyeOff, Sparkles } from "lucide-react"
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const credentials = [
  { id: "email", name: "Email", type: "email", placeholder: "Enter your email" },
  { id: "password", name: "Password", type: "password", placeholder: "Enter your email" },
]

export default function LoginPage() {
  const [details, setDetails] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { supabase, user } = useSupabase()
  // const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace("/dashboard")
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    const { email, password } = details
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success("You have been successfully logged in.")
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (user) {
    return null
  }

  return (
    <section>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-slate-50 dark:bg-zinc-900">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Image src={logo} alt="Script AI" width={100} height={100} />
            </div>
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {credentials.map((option, key) => {
                return <div key={key} className="space-y-2">
                  <Label htmlFor={option.id}>{option.name}</Label>
                  <div className="relative">
                    <Input
                      id={option.id}
                      type={option.type == "password" ? (visible ? "" : "password") : option.type}
                      placeholder={option.placeholder}
                      value={details[option.id] || ''}
                      onChange={e => setDetails({ ...details, [String(option.id)]: e.target.value })}
                      required
                    />
                    {option?.type === "password" && <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>}
                  </div>
                </div>
              })}

              <Button type="submit" className="w-full bg-slate-900 dark:text-white hover:bg-slate-800" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              <Link
                href="/forgot-password"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </section>
  )
}
