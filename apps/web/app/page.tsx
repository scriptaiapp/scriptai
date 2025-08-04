"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import LandingPageNavbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"
import { SparklesCore } from "@/components/ui/sparkles";
import { MButton } from "@/components/ui/moving-border";
import { motion } from "motion/react"
import ProblemSection from "@/components/landingPage/ProblemSection"
import SolutionCard from "@/components/landingPage/SolutionSection"
import { BackgroundBeams } from "@/components/ui/background-beams"
import HowItWorks from "@/components/landingPage/HowItWorks"
import PricingSection from "@/components/landingPage/PricingSection"
import FeatureSection from "@/components/landingPage/FeatureSection"
import { FlipWords } from "@/components/ui/flip-words"
import dynamic from 'next/dynamic';
//DYNAMIC IMPORT
const LandingPageSVG = dynamic(
  () => import('@/components/landingPage/LandingPageSVG'),
  { ssr: false }
);

export default function Home() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Refined item animation with a spring effect
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };


  const words = ["Scripts", "Thumbnails", "Subtitles", "Ideas"];
  return (
    <div className="flex flex-col min-h-screen ">
      <LandingPageNavbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 overflow-hidden">
          {/* Background visuals */}
          <div aria-hidden="true" className="absolute inset-0 -z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-purple-100/40 rounded-full blur-3xl" />
            <SparklesCore
              background="transparent"
              minSize={0.2}
              maxSize={0.8}
              className="absolute inset-0 w-full h-full z-0"
              particleColor="#a855f7"
              particleDensity={35}
            />
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            {/* Left Column */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-1 mb-4 rounded-full text-sm font-medium bg-white/60 ring-1 ring-slate-900/10 backdrop-blur-md"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Built for Creators</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
              >
                Script AI: Your AI<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Content Assistant
                </span>
              </motion.h1>

              {/* FlipWords line */}
              <motion.div
                variants={itemVariants}
                className="mt-4 text-lg md:text-xl text-slate-700"
              >
                Generate AI-powered <FlipWords words={words} className="text-purple-600" /> that sound like you.
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="mt-6 flex flex-col sm:flex-row items-center gap-4"
              >
                <Link href="/signup">
                  <MButton
                    size="lg"
                    className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                    borderClassName="border border-purple-500/60"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </MButton>
                </Link>
                <Button variant="outline">See How It Works</Button>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="mt-4 text-sm text-slate-600"
              >
                Already have an account?{" "}
                <Link href="/login" className="text-purple-600 hover:underline">
                  Log in
                </Link>
              </motion.p>
            </motion.div>


            {/* Right Column */}
            <div className="hidden md:flex w-full h-full items-center justify-center">
              <LandingPageSVG />
            </div>
          </div>
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