"use client"

import { motion } from "motion/react"
import {
  Video,
  PenTool,
  Zap,
  Globe,
  BookOpen,
  Gift,
  ImageIcon,
  MessageSquare,
  Lightbulb,
  Clapperboard,
  FileText,
} from "lucide-react"
import FeatureCard from "../feature-card"

const features = [
  {
    title: "AI Studio",
    icon: Video,
    description:
      "Upload 3-5 YouTube videos to train AI on your unique style, tone, vocabulary, and pacing. Powers all personalized outputs.",
  },
  {
    title: "Ideation",
    icon: Lightbulb,
    description:
      "AI-powered video idea generation with trend intelligence. Analyzes your channel DNA and niche gaps for high-potential ideas.",
  },
  {
    title: "Script Generation",
    icon: PenTool,
    description:
      "Generate scripts in your voice with simple prompts. Add tone, context, and language options for tailored content.",
  },
  {
    title: "Story Builder",
    icon: Clapperboard,
    description:
      "Create structured story blueprints with hooks, escalation, and retention scoring. Perfect for video planning.",
  },
  {
    title: "AI Thumbnails",
    icon: ImageIcon,
    description:
      "Generate eye-catching thumbnails that drive clicks. Upload a frame or describe your vision.",
  },
  {
    title: "Subtitle Generator",
    icon: MessageSquare,
    description:
      "Upload video and auto-generate accurate subtitles. Export for accessibility and SEO.",
  },
  {
    title: "Customizable Context",
    icon: Zap,
    description:
      "Add specific context via text fields or dropdowns for more relevant scripts and content.",
  },
  {
    title: "Multi-Language",
    icon: Globe,
    description:
      "Generate scripts in multiple languages to reach a global audience.",
  },
  {
    title: "Referral Program",
    icon: Gift,
    description:
      "Earn free credits for premium features by referring other creators.",
  },
  {
    title: "Course Builder",
    icon: BookOpen,
    description:
      "Break down complex topics into structured courses. Coming soon.",
  },
  {
    title: "Audio Dubbing",
    icon: FileText,
    description:
      "Dub audio in multiple languages with voice cloning. Coming soon.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function FeatureSection() {
  return (
    <div className="container px-4 md:px-6">
      <motion.div
        className="flex flex-col items-center text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
          Powerful Features for Content Creators
        </h2>
        <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
          Everything you need to create engaging YouTube content faster—from ideas to scripts, thumbnails, and subtitles.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ type: "spring", stiffness: 100, damping: 14 }}
            >
              <FeatureCard
                title={feature.title}
                icon={<Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                description={feature.description}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
