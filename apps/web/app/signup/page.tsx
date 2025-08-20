"use client";
import React, { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion, AnimatePresence } from "motion/react";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Eye, EyeOff, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSupabase } from "@/components/supabase-provider";
import { registerUserSchema } from "@repo/validation";
import logo from "@/public/dark-logo.png";
import * as z from "zod";

type FormData = z.infer<typeof registerUserSchema> & { confirmPassword?: string };
type FormErrors = Partial<Record<keyof FormData, string>>;

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

export default function MultiStepSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, user } = useSupabase();

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralInfo, setReferralInfo] = useState<{ referrerName: string; credits: number } | null>(null);

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Extract referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      // In a real app, you might want to validate the referral code here
      // For now, we'll just set it
    }
  }, [searchParams]);

  const handleNext = async () => {
    setErrors({});
    let schemaToValidate;
    if (step === 1) {
      schemaToValidate = (registerUserSchema._def.schema as z.ZodObject<any>).pick({ name: true, email: true });
    } else {
      // No validation needed to move from step 2 to 3 in this setup
      setStep(step + 1);
      return;
    }

    try {
      schemaToValidate.parse(details);
      setStep(step + 1);
    } catch (error) {
      if (isZodError(error)) {
        const fieldErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormData;
          if (path) {
            fieldErrors[path] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Validation failed", {
          description: "Please check your input and try again.",
        });
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    setLoading(true);
    try {
      registerUserSchema.parse(details);

      const { data, error } = await supabase.auth.signUp({
        email: details.email!,
        password: details.password!,
        options: {
          data: {
            full_name: details.name, // Using a single name field
          },
        }
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        // If there's a referral code, track the referral
        if (referralCode && details.email) {
          try {
            const response = await fetch("/api/track-referral", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                referralCode,
                userEmail: details.email,
              }),
            });

            if (response.ok) {
              toast.success("Referral tracked!", {
                description: "You've been referred to Script AI! Welcome!",
              });
            }
          } catch (referralError) {
            console.error("Error tracking referral:", referralError);
            // Don't fail the signup if referral tracking fails
          }
        }

        toast.success("Account created!", { description: "Please check your email to verify your account." });
        router.push("/login");
      }
    } catch (error: any) {
      if (isZodError(error)) {
        const fieldErrors: FormErrors = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof FormData;
          if (path) {
            fieldErrors[path] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Signup Failed", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (user) return null;

  return (
    <AuroraBackground>
      <div className="relative grid min-h-screen w-full grid-cols-1 items-start justify-center gap-8 px-4 pt-16 md:grid-cols-2 md:items-center md:px-8 md:pt-0 lg:px-16">

        <motion.div initial={{ opacity: 0.0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }} className="hidden flex-col justify-center gap-4 md:flex">
          <Link href="/">
            <Image src={logo} alt="Script AI" width={80} height={80} className="mb-4" />
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">Start Building Smarter, Faster.</h1>
          <p className="max-w-md text-lg text-slate-600">Join the revolution in automated scripting. Create your free account to get started.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0.0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }} className="flex w-full justify-center md:justify-end">
          <Card className="w-full max-w-md bg-white/30 dark:bg-black/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl h-full bg-clip-padding backdrop-filter bg-opacity-20">
            <CardHeader className="space-y-4 pt-8">
              <div className="flex justify-center md:hidden"><Image src={logo} alt="Script AI" width={60} height={60} /></div>
              <CardTitle className="text-2xl text-center text-slate-900 dark:text-white">Create an account</CardTitle>
              
              {/* Referral Banner */}
              {referralCode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 rounded-lg"
                >
                  <Gift className="h-5 w-5 text-purple-600" />
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    You've been referred to Script AI! 🎉
                  </p>
                </motion.div>
              )}

              {/* Progress bar is now only shown for the multi-step form */}
              {step > 0 && (
                <div className="px-6">
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">Step {step} of {totalSteps}</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="overflow-hidden min-h-[280px]">
              {/* Google Sign-in button and divider */}
              <div className="space-y-4">
                <Button variant="outline" className="w-full bg-white/50 hover:bg-white/70" onClick={handleGoogleSignup} type="button">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </Button>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-slate-500 dark:text-slate-400">Or continue with email</span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={step} variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {step === 1 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name" className="dark:text-slate-200">Name</Label>
                          <Input id="name" placeholder="Enter your name" value={details.name || ""} onChange={(e) => setDetails({ ...details, name: e.target.value })} required className="bg-white/30 dark:bg-black/30 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                          {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="dark:text-slate-200">Email</Label>
                          <Input id="email" type="email" placeholder="name@company.com" value={details.email || ""} onChange={(e) => setDetails({ ...details, email: e.target.value })} required className="bg-white/30 dark:bg-black/30 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                          {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input id="password" type={visible ? "text" : "password"} placeholder="••••••••" value={details.password || ""} onChange={(e) => setDetails({ ...details, password: e.target.value })} required className="bg-white/30 dark:bg-black/30 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                          </div>
                          {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input id="confirmPassword" type={visible ? "text" : "password"} placeholder="••••••••" value={details.confirmPassword || ""} onChange={(e) => setDetails({ ...details, confirmPassword: e.target.value })} required className="bg-white/30 dark:bg-black/30 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                          {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>}
                        </div>
                      </>
                    )}

                    <div className="flex justify-between gap-4 pt-4">
                      {step > 1 && (<Button type="button" variant="outline" onClick={handleBack} className="w-full bg-white/50 hover:bg-white/70">Back</Button>)}
                      {step < totalSteps && (<Button type="button" onClick={handleNext} className="w-full  bg-slate-900 text-white hover:bg-slate-800 shadow-md">Next</Button>)}
                      {step === totalSteps && (<Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-md" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</Button>)}
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pb-8">
              <div className="text-sm text-center dark:text-slate-300">Already have an account?{" "}<Link href="/login" className="font-medium text-purple-600 hover:underline dark:text-purple-400">Sign In</Link></div>
            </CardFooter>
          </Card>
        </motion.div>

      </div>
    </AuroraBackground>
  );
}