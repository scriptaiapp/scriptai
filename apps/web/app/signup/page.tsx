"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { z, ZodError } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { registerUserSchema } from "@repo/validation"

import logo from "@/public/dark-logo.png"
import Navbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"

// IMPROVEMENT: More descriptive constant name and corrected placeholders.
const formFields = [
  { id: "email" as const, name: "Email", type: "email", placeholder: "Enter your email" },
  { id: "password" as const, name: "Password", type: "password", placeholder: "Enter your password" },
  { id: "confirmPassword" as const, name: "Confirm Password", type: "password", placeholder: "Confirm your password" },
]

// IMPROVEMENT: Define types for form data and errors for better type safety.
type FormData = z.infer<typeof registerUserSchema>
console.log(FormData)
type FormErrors = Partial<Record<keyof FormData, string>>

export default function SignupPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()

  // Initializing state with a more specific type.
  const [details, setDetails] = useState<FormData>({ email: "", password: "", confirmPassword: "" })
  // State to hold and display validation errors.
  const [errors, setErrors] = useState<FormErrors>({})
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    // Clear previous errors on a new submission attempt.
    setErrors({})
    setLoading(true)

    try {
      // Validate form data using the Zod schema first.
      registerUserSchema.parse(details)

      const { data, error } = await supabase.auth.signUp({
        email: details.email,
        password: details.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        toast.success("Account created!", { description: "Please check your email to verify your account." })
        // Use Next.js router for client-side navigation instead of a full page reload.
        router.push("/login")
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Map Zod errors to our state format
        const fieldErrors: FormErrors = {}
        error.errors.forEach(err => {
          const path = err.path[0] as keyof FormData
          if (path) {
            fieldErrors[path] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        // Handle Supabase auth errors or other unexpected errors
        toast.error("Signup Failed", {
          description: error.message || "An unexpected error occurred. Please try again.",
        })
      }
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
        throw error
      }
    } catch (error: any) {
      toast.error("Google Signup Failed", {
        description: error.message || "Could not sign up with Google. Please try again.",
      })
    }
  }

  // Prevents a flash of the signup form while redirecting a logged-in user.
  if (user) {
    return null
  }

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
                {/* SVG paths remain unchanged */}
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
              {formFields.map(field => {
                // Determine if this is a password field that can be toggled
                const isTogglablePassword = field.id === "password" || field.id === "confirmPassword"

                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.name}</Label>
                    <div className="relative">
                      <Input
                        id={field.id}
                        // Correctly sets type to "text" when visible.
                        type={isTogglablePassword ? (visible ? "text" : "password") : field.type}
                        placeholder={field.placeholder}
                        value={details[field.id]}
                        onChange={e => setDetails({ ...details, [field.id]: e.target.value })}
                        required
                        // Visually indicate which field has an error.
                        className={errors[field.id] ? "border-destructive" : ""}
                      />
                      {isTogglablePassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setVisible(!visible)}
                        >
                          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                    {/* Display validation error message if it exists. */}
                    {errors[field.id] && (
                      <p className="text-sm text-destructive mt-1">{errors[field.id]}</p>
                    )}
                  </div>
                )
              })}
              <Button type="submit" className="w-full bg-slate-900 dark:text-white hover:bg-slate-800" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-center block">
            <span>Already have an account? </span>
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