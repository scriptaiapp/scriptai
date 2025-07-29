import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Video, PenTool, Zap, Globe, BookOpen, Gift, ImageIcon, FileText } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"


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



export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>Personalized AI for YouTubers</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">
                Your Personal AI Youtube Assistant
              </h1>
              <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-xl">
                Train AI on your content, generate personalized scripts, and streamline your YouTube workflow with
                powerful AI tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 min-[400px]:gap-6">
                <Link href="/signup">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline">
                    See How It Works
                  </Button>
                </Link>
              </div>
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
