"use client"
import { cn } from "@/lib/utils"
import { Link } from "lucide-react"
import { Button } from "../ui/button"
import { WobbleCard } from "../ui/wobble-card"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export default function PricingSection() {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState<boolean>(false)

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
            features: ["300 credits", "Custom fine tuned model", "All script customization options", "Thumbnail & title generation", "Course module creaton"]
        },
        {
            price: 49,
            heading: "Enterprise",
            confess: "Contact Sales",
            description: "For professional YouTubers and teams.",
            features: ["Everything in Pro", "Team collaboration", "Advanced analytics", "Priority support", "Custom integrations"]
        },
    ]

    const handlePlan = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        console.log("clicked")
        // if (loading) return
        setLoading(true)
        try {
            const response = await fetch("/api/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: "price_1SH1sSALTcE9tQgYn5aBB7NT", customerEmail: "test@gmail.com" })
            })
            if (!response.ok) throw new Error("Failed to generate referral code")
            const data = await response.json()
            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            toast.error("Error generating referral code", { description: error.message })
        } finally {
            setLoading(false)
        }
    }

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
                {pricing.map((option, key) => (
                    <WobbleCard
                        key={key}
                        className={cn(
                            "flex flex-col p-6 sm:p-8 md:p-10 relative",
                            option.isPopular ? "bg-slate-50 dark:bg-slate-700" : "bg-white dark:bg-slate-800",
                            "border border-slate-200 dark:border-slate-700 rounded-lg shadow-md"
                        )}
                    >
                        {option?.isPopular && (
                            <div className="absolute top-0 right-0 mr-3 sm:mr-4 bg-slate-700 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                                POPULAR
                            </div>
                        )}
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
                            {option.heading}
                        </h3>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-slate-50">
                            ${option.price}
                            <span className="text-sm sm:text-base font-normal text-slate-600 dark:text-slate-400">
                                /mo
                            </span>
                        </div>
                        {pathname !== "/" && <Button onClick={handlePlan} disabled={loading} className={cn("rounded-full my-4 cursor-pointer", option?.isPopular && "bg-slate-900 text-white hover:text-slate-900")}>{loading ? "Hold in": `Get ${option.heading}`}</Button>}
                        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                            {option.description}
                        </p>
                        <ul className="space-y-2 mb-4 sm:mb-6 flex-1">
                            {option.features.map((feature, featureKey) => (
                                <li
                                    key={featureKey}
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
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup">
                            <Button
                                className={cn(
                                    "w-full text-sm sm:text-base",
                                    option.isPopular
                                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                                        : "border-slate-300 dark:border-slate-600"
                                )}
                                variant={option.isPopular ? "default" : "outline"}
                            >
                                {option.confess}
                            </Button>
                        </Link>
                    </WobbleCard>
                ))}
            </div>
        </div>
    )
}