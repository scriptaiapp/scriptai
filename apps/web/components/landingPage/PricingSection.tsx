"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "../ui/button"
import { WobbleCard } from "../ui/wobble-card"
import { motion } from "motion/react"
import { useSupabase } from "../supabase-provider"

export default function PricingSection({ hideHeader = false }: { hideHeader?: boolean }) {
    const { user } = useSupabase()
    const comingSoon = new Set(["Course Builder", "Audio dubbing", "Video Generation"])
    const baseFeatures = {
        starter: [
            "No credit card required",
            "Monthly 500 free credits",
            "AI model training",
            "Ideation",
            "Script generation",
            "Subtitle generation",
            "Story Builder",
            "Thumbnail generation",
            "Course Builder",
        ],
        creatorPlusExtras: [
            "Everything in Starter",
            "5k credits/month",
            "Audio dubbing",
            "Video Generation",
            "Community Access",
        ],
        enterpriseExtras: [
            "Everything in Creator+",
            "100k credits/month",
            "Advance analytics",
            "Team collaboration",
            "Priority access to new features",
        ],
    }

    const newPlans = [
        {
            id: "starter",
            name: "Starter",
            price_monthly: 0,
            credits_monthly: 500,
            features: baseFeatures.starter.map((f) => ({ feature: f })),
        },
        {
            id: "pro",
            name: "Creator+",
            price_monthly: 20,
            credits_monthly: 5000,
            features: baseFeatures.creatorPlusExtras.map((f) => ({ feature: f })),
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price_monthly: 499,
            credits_monthly: 100000,
            features: baseFeatures.enterpriseExtras.map((f) => ({ feature: f })),
        },
    ]


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
    }
    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } },
    }

    return (
        <div className="container px-4 sm:px-6 lg:px-8">
            {!hideHeader && (
                <motion.div
                    className="flex flex-col items-center text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 lg:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50">
                        Pricing
                    </h2>
                    <p className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-prose text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400">
                        Choose the plan that works best for your content creation needs.
                    </p>
                </motion.div>
            )}

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {newPlans.map((plan) => {
                    const isPopular = plan.name === "Creator+"
                    const buttonLabel = "Get Started"

                    return (
                        <motion.div key={plan.id} variants={itemVariants}>
                        <WobbleCard
                            className={cn(
                                "flex flex-col p-6 sm:p-8 md:p-10 relative",
                                isPopular
                                    ? "bg-slate-50 dark:bg-slate-700"
                                    : "bg-white dark:bg-slate-800",
                                "border border-slate-200 dark:border-slate-700 rounded-lg shadow-md",
                                "hover:shadow-purple-500/10 dark:hover:shadow-purple-400/5 transition-shadow"
                            )}
                        >
                            {isPopular && (
                                <div className="absolute top-0 right-0 mr-3 sm:mr-4 bg-purple-600 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                                    POPULAR
                                </div>
                            )}

                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
                                {plan.name}
                            </h3>

                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-slate-50">
                                ${plan.price_monthly}
                                <span className="text-sm sm:text-base font-normal text-slate-600 dark:text-slate-400">
                                    /mo
                                </span>
                            </div>

                            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                                {plan.name === "Enterprise"
                                    ? "For professional YouTubers and teams."
                                    : plan.name === "Creator+"
                                        ? "For serious content creators."
                                        : "Perfect for trying out Creator AI."}
                            </p>

                            <ul className="space-y-2 mb-4 sm:mb-6 flex-1">
                                {plan.features.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start text-sm sm:text-base text-slate-600 dark:text-slate-400"
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
                                        {f.feature}
                                        {comingSoon.has(f.feature) && (
                                            <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                                                Coming soon
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                className={cn(
                                    "w-full text-sm sm:text-base",
                                    isPopular
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "border-slate-300 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700"
                                )}
                                variant={isPopular ? "default" : "outline"}
                            >
                                <Link href={
                                    user
                                        ? `/dashboard/settings?tab=billing&plan=${plan.id}`
                                        : `/login?redirectTo=${encodeURIComponent(`/dashboard/settings?tab=billing&plan=${plan.id}`)}`
                                }>
                                    {buttonLabel}
                                </Link>
                            </Button>
                        </WobbleCard>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}
