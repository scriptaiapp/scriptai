"use client"

import React, { useEffect } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import LandingPageNavbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"
import PricingSection from "@/components/landingPage/PricingSection"
import FAQSection from "@/components/landingPage/FAQSection"
import { SparklesCore } from "@/components/ui/sparkles"
import { MButton } from "@/components/ui/moving-border"
import { ArrowRight, Check } from "lucide-react"

const comparisons = [
  { feature: "AI Model Training", starter: true, creator: true, enterprise: true },
  { feature: "Script Generation", starter: true, creator: true, enterprise: true },
  { feature: "Video Ideas (Ideation)", starter: true, creator: true, enterprise: true },
  { feature: "Thumbnail Generation", starter: true, creator: true, enterprise: true },
  { feature: "Subtitle Generation", starter: true, creator: true, enterprise: true },
  { feature: "Story Builder", starter: true, creator: true, enterprise: true },
  { feature: "Referral Program", starter: true, creator: true, enterprise: true },
  { feature: "Monthly Credits", starter: "500", creator: "5,000", enterprise: "100,000" },
  { feature: "Audio Dubbing", starter: false, creator: true, enterprise: true },
  { feature: "Video Generation", starter: false, creator: true, enterprise: true },
  { feature: "Community Access", starter: false, creator: true, enterprise: true },
  { feature: "Advanced Analytics", starter: false, creator: false, enterprise: true },
  { feature: "Team Collaboration", starter: false, creator: false, enterprise: true },
  { feature: "Priority Support", starter: false, creator: false, enterprise: true },
]

export default function PricingPage() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true })
    return () => lenis.destroy()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <LandingPageNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full pt-32 pb-8 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 -z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-purple-100/40 rounded-full blur-3xl" />
            <SparklesCore
              background="transparent"
              minSize={0.2}
              maxSize={0.8}
              className="absolute inset-0 w-full h-full z-0"
              particleColor="#a855f7"
              particleDensity={20}
            />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
                Simple, Transparent{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Pricing
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto">
                Start for free. Upgrade when you need more. No hidden fees, no surprises.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 bg-slate-50">
          <PricingSection />
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-white">
          <div className="container max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Compare Plans
              </h2>
              <p className="text-slate-600 text-lg">
                See exactly what you get with each plan.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="overflow-x-auto"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-slate-600 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 text-slate-800 font-semibold">Starter</th>
                    <th className="text-center py-4 px-4 text-purple-600 font-semibold">Creator+</th>
                    <th className="text-center py-4 px-4 text-slate-800 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-sm text-slate-700">{row.feature}</td>
                      {[row.starter, row.creator, row.enterprise].map((val, j) => (
                        <td key={j} className="text-center py-3.5 px-4">
                          {val === true ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : val === false ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <span className="text-sm font-medium text-slate-700">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        <FAQSection />

        {/* CTA */}
        <section className="py-20 bg-slate-900 text-white">
          <motion.div
            className="container px-6 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Free, Upgrade Anytime
            </h2>
            <p className="max-w-[600px] mx-auto text-slate-300 md:text-lg mb-8">
              No credit card required. Get 500 free credits every month and access to all core features.
            </p>
            <Link href="/signup">
              <MButton
                size="lg"
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:brightness-110 text-white shadow-md transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </MButton>
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
