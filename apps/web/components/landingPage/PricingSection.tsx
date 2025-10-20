"use client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "../ui/button"
import { WobbleCard } from "../ui/wobble-card"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useSupabase } from "../supabase-provider"
import { Skeleton } from "../ui/skeleton"
import { Features, Plans } from "@/types/plans"
import { capitalize } from "@/helpers/capitalize"
import { useSettings } from "@/hooks/useSettings"

export default function PricingSection() {
    const { loadingBilling, billingDetails, fetchSubscriptionDetails } = useSettings()
    const [loading, setLoading] = useState(false)
    const { user, supabase, fetchPlan, plans, planLoading } = useSupabase();

    const pathname = usePathname()
    const router = useRouter()

    const pro__plan = process.env.NEXT_PUBLIC_PRO_PRICE
    const enterprice_plan = process.env.NEXT_PUBLIC__ENTERPRICE_PLAN


    useEffect(() => {
        if(user) {
            fetchPlan()
            fetchSubscriptionDetails(user?.id)
        }
    }, [])

    const handleStripeCheckout = async (plan_id: string, sub_type: string) => {
        if (loading) return
        setLoading(true)
        try {
            const response = await fetch('/api/stripe/create-subscription', {
                method: "POST",
                body: JSON.stringify({ plan_id, sub_type })
            })

            const data = await response.json()
            if (!response.ok) {
                toast.error(data.error || "Something went wrong")
                return
            }
            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            toast.error("Failed to send issue report", {
                description: error?.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false)
        }
    }

    const handlePricingRoute = (plan_id: string, sub_type: string) => {
        if (user) {
            handleStripeCheckout(plan_id, sub_type)
        } else {
            router.push("/login")
        }
    }
    const pricing = [
        {
            price: 0,
            heading: "Free",
            confess: "Get Started",
            description: "Perfect for trying out Script AI.",
            features: ["10 free credits per month", "Personalized AI training", "Tone selection"]
        },
        {
            price: 19,
            heading: "Pro",
            isPopular: true,
            confess: "Get Started",
            description: "For serious content creators.",
            features: ["300 credits", "Custom fine tuned model", "All script customization options", "Thumbnail & title generation", "Course module creaton"],
            stripe_pricing: pro__plan,
            credit_to_be_added: 300
        },
        {
            price: 49,
            heading: "Enterprise",
            confess: "Contact Sales",
            description: "For professional YouTubers and teams.",
            features: ["Everything in Pro", "Team collaboration", "Advanced analytics", "Priority support", "Custom integrations"],
            stripe_pricing: enterprice_plan
        },
    ]

    return (
        <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 lg:mb-16">
                {
                    pathname === "/" ? <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50">
                        Pricing
                    </h2> : <h2 className="mt-10 text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50">
                        Recommended plan for you
                    </h2>
                }
                <p className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-prose text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400">
                    Choose the plan that works best for your content creation needs.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
                {plans && plans.map((option:Plans, key) => (
                    <WobbleCard
                        key={key}
                        className={cn(
                            "flex flex-col p-6 sm:p-8 md:p-10 relative",
                            option?.name === "Pro" ? "bg-slate-50 dark:bg-slate-700" : "bg-white dark:bg-slate-800",
                            "border border-slate-200 dark:border-slate-700 rounded-lg shadow-md"
                        )}
                    >
                        {option?.name === "Pro" && (
                            <div className="absolute top-0 right-0 mr-3 sm:mr-4 bg-slate-700 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                                POPULAR
                            </div>
                        )}
                        {
                            planLoading || loadingBilling ? <Skeleton className="h-4 w-32 mb-2" /> : <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
                                {option.name}
                            </h3>
                        }
                        {
                            planLoading || loadingBilling ? <Skeleton className="h-3 w-40 mb-4" /> : <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-slate-50">
                                ${option.price_monthly}
                                <span className="text-sm sm:text-base font-normal text-slate-600 dark:text-slate-400">
                                    /mo
                                </span>
                            </div>
                        }
                        {
                            planLoading || loadingBilling ? <Skeleton className="h-3 w-40 mb-6" /> :  <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                                {option.name === "Enterprise"
                                    ? "For professional YouTubers and teams."
                                    : option.name === "Pro"
                                        ? "For serious content creators."
                                        : "Perfect for trying out Script AI."}
                            </p>
                        }
                        {
                            planLoading || loadingBilling ? <>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-3 w-40 mb-64" /></> : <ul className="space-y-2 mb-4 sm:mb-6 flex-1">
                                {option.features.map((f: Features, featureKey) => (
                                    <li
                                        key={featureKey}
                                        className="flex items-center text-sm sm:text-base text-slate-600 dark:text-slate-400"
                                    >
                                        <svg
                                            className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                       {f.feature}  {f.limit !== "unlimited" && (
                                            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                                                ({f.limit})
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        }

                        {
                            planLoading || loadingBilling ? <Skeleton className="h-8 w-full rounded-md " /> : <Button
                                disabled={loading || option.id === billingDetails?.plan_id}
                                onClick={() => option.name === "Starter" ? router.push("/dashboard") : option.name === "Pro" ? handlePricingRoute( option.id,option.name): router.push("/sales") }
                                className={cn(
                                    "w-full text-sm sm:text-base",
                                    option?.name === "Pro"
                                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                                        : "border-slate-300 dark:border-slate-600"
                                )}
                                variant={option?.name === "Pro" ? "default" : "outline"}
                            >
                                <p>{option.name === "Enterprise" ? "Contact Sales" : "Get Started"}</p>
                            </Button>
                        }

                    </WobbleCard>
                )
                )}
            </div>
        </div>
    )
}
