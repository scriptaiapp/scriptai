"use client"

import Footer from "@/components/footer"
import LandingPageNavbar from "@/components/landingPage/LandingPageNavbar"
import { SparklesCore } from "@/components/ui/sparkles"
import { motion } from "motion/react"

export default function AboutPage() {
  return (
    <div>
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-gray-50 text-gray-800">
        <LandingPageNavbar />

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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">About Script AI</h1>
          <p className="text-lg md:text-xl text-gray-600">
            Empowering creators, researchers, and storytellers to turn ideas into impactful scripts and insights — instantly.
          </p>
        </motion.div>

        {/* Who We Are */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-700 leading-relaxed">
            Script AI is an AI-powered platform built to help writers, content creators, and researchers bring their ideas to life faster.
            Whether you’re drafting a YouTube script, podcast outline, film scene, or research paper, Script AI blends creative intelligence
            with structured insight to help you go from concept to completion in minutes.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            Our mission is simple:{" "}
            <span className="font-semibold">
              to empower anyone with an idea to create impactful content — without friction or creative block.
            </span>{" "}
            We’re redefining how people write, research, and tell stories by making AI a true creative partner, not just a writing assistant.
          </p>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-semibold mb-4">What We Do</h2>
          <ul className="space-y-4 text-gray-700 list-disc pl-6">
            <li>
              <strong>Smart Script Generation:</strong> Generate YouTube scripts, podcasts, or film scenes tailored to your tone and audience.
            </li>
            <li>
              <strong>AI-Powered Research Assistance:</strong> Summarize, expand, and structure research topics with verified insights.
            </li>
            <li>
              <strong>Dynamic Collaboration:</strong> Edit, refine, and co-create with real-time AI feedback.
            </li>
            <li>
              <strong>Insights & Metrics:</strong> Track your creative growth — scripts generated, topics explored, and more.
            </li>
          </ul>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            We envision a world where{" "}
            <span className="font-semibold">AI creativity feels natural, personal, and human.</span> Script AI isn’t just about automation —
            it’s about amplifying creativity and giving users more time to focus on what truly matters: their ideas, stories, and impact.
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Script AI began with a simple frustration:{" "}
            <em>“Why does turning an idea into a finished script take so long?”</em> From that question came a journey to build a platform that
            bridges creativity and AI — one that adapts to your unique workflow, learns from your preferences, and evolves with your content
            style. Today, thousands of users rely on Script AI to brainstorm, draft, and polish their ideas — all powered by next-generation AI.
          </p>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-semibold mb-4">Our Core Values</h2>
          <ul className="space-y-3 text-gray-700 list-disc pl-6">
            <li>
              <strong>Creativity:</strong> Empower imagination through intelligent tools.
            </li>
            <li>
              <strong>Transparency:</strong> Build trust through ethical AI and clear results.
            </li>
            <li>
              <strong>Simplicity:</strong> Make advanced technology easy and accessible to everyone.
            </li>
            <li>
              <strong>Growth:</strong> Evolve with our users’ needs and feedback.
            </li>
          </ul>
        </motion.div>

        {/* Join Us */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-semibold mb-4">Join Us</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We’re just getting started. <span className="font-semibold">Script AI</span> is growing fast —
            and we’re always looking for new ways to make creative AI smarter, faster,
            and more collaborative.
          </p>
          <p className="text-lg font-medium text-indigo-600 mb-8">
            Create smarter. Research faster. Write better — with Script AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/scriptaiapp/scriptai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              🌐 View Our Open Source Codebase
            </a>
            <a
              href="https://discord.gg/k9sZcq2gNG"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors duration-200"
            >
              💬 Join Our Discord Community
            </a>
          </div>
        </motion.div>
      </section>
      <div className="my-4" />
      <Footer />
    </div>
  )
}
