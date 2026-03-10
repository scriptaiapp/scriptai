"use client"

import { motion } from "motion/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "How does AI training work?",
    a: "Connect your YouTube channel and upload 3-5 of your best videos. Our AI analyzes your unique style, tone, vocabulary, and pacing to create a personalized model. Once trained, all generated content—scripts, ideas, thumbnails—will sound and look like you.",
  },
  {
    q: "What can I create with Creator AI?",
    a: "You get access to Ideation (trend-based video ideas), Script Generation (personalized scripts), Story Builder (structured blueprints with retention scoring), AI Thumbnails, and Subtitle Generation. Course Builder, Audio Dubbing, and Video Generation are coming soon.",
  },
  {
    q: "How do credits work?",
    a: "Credits power AI operations like script generation, ideation, and thumbnails. The Starter plan includes 500 free credits monthly. Creator+ offers 5,000 credits/month. Each operation consumes credits based on complexity.",
  },
  {
    q: "Do I need to connect my YouTube channel?",
    a: "Yes, for the best experience. Connecting YouTube lets our AI learn your voice and style from your existing videos. Ideation, Scripts, Story Builder, and Thumbnails all benefit from a trained model.",
  },
  {
    q: "Can I export my content?",
    a: "Yes. Scripts, ideation results (PDF), subtitles, and thumbnails can be exported. Story blueprints are viewable in-dashboard with full structure and retention scores.",
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
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
            Everything you need to know about Creator AI.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <AccordionItem
                  value={`item-${i}`}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5 font-semibold text-slate-900 dark:text-slate-100">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
