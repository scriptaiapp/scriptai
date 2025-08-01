"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Video, PenTool, Zap, Globe, BookOpen, Gift, ImageIcon, FileText } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import LandingPageNavbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"
import { Spotlight } from "@/components/ui/Spotlight"
import { SparklesCore } from "@/components/ui/sparkles";
import { MButton } from "@/components/ui/moving-border";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { motion } from "motion/react"
import ProblemSection from "@/components/landingPage/ProblemSection"
import SolutionCard from "@/components/landingPage/SolutionSection"
import { BackgroundBeams } from "@/components/ui/background-beams"
import HowItWorks from "@/components/landingPage/HowItWorks"
import PricingSection from "@/components/landingPage/PricingSection"
import FeatureSection from "@/components/landingPage/FeatureSection"



export default function Home() {
  return (
    <div className="flex flex-col min-h-screen ">
      <LandingPageNavbar />
      <main className="flex-1">
        {/* Hero Section */}

        <section className="relative isolate bg-gradient-to-b from-white to-slate-50 py-24 md:py-32 overflow-hidden">
          <Spotlight className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-40" fill="white" />
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-[80rem] h-[80rem] bg-gradient-radial from-purple-300/20 via-pink-300/10 to-transparent opacity-50 blur-3xl pointer-events-none"
          />
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            className="absolute bottom-0 left-0 w-full h-[100px] z-0"
            particleColor="#a855f7"
            particleDensity={180}
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
            className="relative z-10 container px-4 md:px-6 text-center"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full text-sm font-medium bg-white/60 ring-1 ring-slate-300 shadow-md backdrop-blur-md animate-float"
            >
              <Sparkles className="w-4 h-4 text-purple-500" aria-hidden="true" />
              <span>Built for Creators</span>
            </motion.div>
            <motion.h1
              className="mb-2 text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
            >
              Script AI: Your Personal{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                YouTube Assistant
              </span>
            </motion.h1>
            <motion.div
              className="mb-6 text-2xl font-medium text-slate-700"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <TextGenerateEffect words="Create. Edit. Publish. Scale." />
            </motion.div>
            <motion.p
              className="mt-2 max-w-2xl mx-auto text-lg md:text-xl text-slate-600"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Train AI with your past videos, and generate high-converting scripts, thumbnails, and subtitles — in your voice, at scale.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/signup">
                <MButton
                  size="lg"
                  className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                  borderClassName="border border-purple-500/60"
                  aria-label="Get started with Script AI for free"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </MButton>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-slate-300" aria-label="Learn how Script AI works">
                  See How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* problem faced */}
        <section className="bg-white py-24">
          <ProblemSection />
        </section>


        {/* solution section */}
        <section id="solutions" className="py-20 bg-slate-50 dark:bg-slate-900">
          <SolutionCard />
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-slate-800">
          <FeatureSection />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
          <HowItWorks />
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-800">
          <PricingSection />
        </section>

        {/* CTA Section */}
        <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
          <BackgroundBeams className="absolute inset-0 z-0" />

          <div className="relative z-10 container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Transform Your Content Creation?
              </h2>
              <p className="max-w-[700px] text-slate-300 md:text-lg">
                Join thousands of YouTubers who are saving time and creating better content with Script AI.
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

            </div>
          </div>

          {/*SVG Wave Divider at bottom */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" fillOpacity="0.05" d="M0,0 C480,120 960,0 1440,120 L1440,0 L0,0 Z" />
          </svg>
        </section>
      </main>
      <Footer />
    </div >
  )
}