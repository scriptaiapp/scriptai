"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Video, PenTool, Zap, Globe, BookOpen, Gift, ImageIcon, FileText, CheckCircle, Target, TrendingUp, Clock, AlertCircle } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import LandingPageNavbar from "@/components/LandingPageNavbar"
import Footer from "@/components/footer"
import { Spotlight } from "@/components/ui/Spotlight"
import { SparklesCore } from "@/components/ui/sparkles";
import { MButton } from "@/components/ui/moving-border";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Timeline } from "@/components/ui/timeline"
import ProblemSection from "@/components/ProblemSection"
import SolutionCard from "@/components/SolutionSection"
const problems = [
  {
    title: "Writer's Block Nightmare",
    description: "Staring at a blank screen for hours, struggling to come up with fresh, engaging content ideas that resonate with your audience.",
    icon: AlertCircle,
    color: "text-red-500"
  },
  {
    title: "Inconsistent Content Quality",
    description: "Your content quality varies drastically - some videos perform amazingly while others barely get any views or engagement.",
    icon: TrendingUp,
    color: "text-orange-500"
  },
  {
    title: "Time-Consuming Script Writing",
    description: "Spending 3-5 hours writing a single script when you could be filming, editing, or engaging with your community instead.",
    icon: Clock,
    color: "text-yellow-500"
  },
  {
    title: "Generic AI Tools",
    description: "Current AI tools generate generic content that doesn't match your unique voice, style, or brand personality.",
    icon: Target,
    color: "text-blue-500"
  }
]

const solutions = [
  {
    title: "AI Learns Your Voice",
    description: "Upload 3-5 videos and watch our AI master your unique style, tone, vocabulary, and pacing patterns.",
    icon: Video,
    gradient: "from-purple-100 to-pink-100"
  },
  {
    title: "Instant Script Generation",
    description: "Generate personalized scripts in minutes, not hours. Focus on what you do best - creating amazing content.",
    icon: Zap,
    gradient: "from-blue-100 to-cyan-100"
  },
  {
    title: "Consistent Quality",
    description: "Every script maintains your brand voice and quality standards, ensuring consistent audience engagement.",
    icon: CheckCircle,
    gradient: "from-green-100 to-emerald-100"
  },
  {
    title: "Complete Workflow",
    description: "From scripts to thumbnails to subtitles - everything you need in one powerful, integrated platform.",
    icon: Target,
    gradient: "from-orange-100 to-red-100"
  }
]

const features = [
  { title: "Personalized AI Training", icon: Video, description: "Upload your videos to train the AI on your unique style, tone, and content preferences." },
  { title: "Script Generation", icon: PenTool, description: "Generate tailored scripts with simple prompts that match your personal style." },
  { title: "Customizable Context", icon: Zap, description: "Add specific context to your scripts via text fields or dropdowns for more relevant content." },
  { title: "Language Expansion", icon: Globe, description: "Generate scripts in multiple languages to reach a global audience." },
  { title: "Tutorial Course Module", icon: BookOpen, description: "Break down complex topics into structured course modules with suggested video counts and topics." },
  { title: "Referral Program", icon: Gift, description: "Earn free credits for premium features by referring other creators to Script AI." },
  { title: "AI Thumbnail Generator", icon: ImageIcon, description: "Create eye-catching thumbnails that drive clicks and views." },
  { title: "Subtitle Generator", icon: FileText, description: "Automatically generate accurate subtitles for your videos to improve accessibility." },
]

const chapters = [
  { title: "Train Your AI", description: "Upload 3-5 of your videos to train the AI on your unique style, vocabulary, and pacing." },
  { title: "Generate Scripts", description: "Input a simple prompt, select your tone, and add context to generate a personalized script." },
  { title: "Create & Share", description: "Use additional tools to generate thumbnails, titles, and subtitles, then export and create your video." },
]

const pricing = [
  {
    price: 0,
    heading: "Free",
    confess: "Get Started",
    description: "Perfect for trying out Script AI.",
    features: ["3 scripts per month", "Basic script generation", "Tone selection"]
  },
  {
    price: 19,
    heading: "Pro",
    isPopular: true,
    confess: "Get Started",
    description: "For serious content creators.",
    features: ["Unlimited scripts", "Personalized AI training", "All script customization options", "Thumbnail & title generation", "Course module creaton"]
  },
  {
    price: 49,
    heading: "Enterprise",
    confess: "Contact Sales",
    description: "For professional YouTubers and teams.",
    features: ["Everything in Pro", "Team collaboration", "Advanced analytics", "Priority support", "Custom integrations"]
  },
]


const entries = problems.map((p) => ({
  title: p.title,
  content: (
    <div className="flex items-start gap-4">
      <div className={cn("flex-shrink-0 p-2 rounded-md border bg-white dark:bg-slate-900 shadow-sm", p.color)}>
        <p.icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{p.description}</p>
    </div>
  ),
}))



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
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
            variants={{ hidden: {}, visible: {} }}
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
        <ProblemSection />


        {/* solution section */}
        <section id="solutions" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
                Solutions for Your Content Creation Challenges
              </h2>
              <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
                Script AI addresses your pain points with powerful, tailored solutions to streamline your workflow.
              </p>
            </div>

            {/* Add spacing here */}
            <div className="mt-16">
              <SolutionCard />
            </div>
          </div>
        </section>



        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-slate-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
                Powerful Features for Content Creators
              </h2>
              <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
                Everything you need to create engaging YouTube content faster and easier than ever before.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {features.map((feature, key) => {
                const Icon = feature.icon
                return <FeatureCard key={key} title={feature.title} icon={<Icon className="h-6 w-6 text-slate-500" />} description={feature.description} />
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">How Script AI Works</h2>
              <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
                A simple process to create personalized content for your YouTube channel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {chapters.map((chapter, index) => {
                return <div key={index} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-50">{chapter.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {chapter.description}
                  </p>
                </div>
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white dark:bg-slate-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
                Simple, Transparent Pricing
              </h2>
              <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
                Choose the plan that works best for your content creation needs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {pricing.map((option, key) => {
                return (
                  <div key={key} className={`flex flex-col p-6 ${option?.isPopular ? "bg-slate-50" : "bg-white"} dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm ${option.isPopular && "relative"}`}>
                    {option?.isPopular && <div className="absolute top-0 right-0 -mt-4 mr-4 bg-slate-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      POPULAR
                    </div>}
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-50">{option.heading}</h3>
                    <div className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-50">${option.price}</div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{option.description}</p>
                    <ul className="space-y-2 mb-6 flex-1">
                      {option.features.map((feature, key) => {
                        return <li key={key} className="flex items-center text-slate-600 dark:text-slate-400">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {feature}
                        </li>
                      })}
                    </ul>
                    <Link href="/signup">
                      <Button className={`w-full ${option.isPopular && "bg-slate-900 hover:bg-slate-800 text-white"}`} variant="outline">
                        {option.confess}
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Content Creation?</h2>
              <p className="max-w-[700px] text-slate-300 md:text-lg">
                Join thousands of YouTubers who are saving time and creating better content with Script AI.
              </p>
              <Link href="/signup">
                <Button size="lg" className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}