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
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import Navbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"

const credentials = [
  { id: "email", name: "Email", type: "email", placeholder: "Enter your email" },
  { id: "password", name: "Password", type: "password", placeholder: "Enter your email" },
  { id: "confirmPassword", name: "Confirm Password", type: "password", placeholder: "Confirm your password" },
]

export default function SignupPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()

  const [details, setDetails] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace("/dashboard")
  }, [user, router])

  const handleSignup = async (e: React.FormEvent) => {
    const { email, password, confirmPassword } = details
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Wrong Credentials!")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        toast.success("Account created!", { description: "Please check your email to verify your account." })
        setTimeout(() => {
          window.location.href = "/login"
        }, 3000)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (user) return null

  return (
    <section>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 mt-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Image src={logo} alt="Script AI" width={100} height={100} />
            </div>
            <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignup} type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
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

            <form onSubmit={handleSignup} className="space-y-4">
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
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-center">
            <p>Already have an account?&nbsp;</p>
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </section>
  )
}
