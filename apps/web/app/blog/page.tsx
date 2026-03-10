"use client"

import React, { useEffect } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import LandingPageNavbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"
import { SparklesCore } from "@/components/ui/sparkles"
import { ArrowRight, Calendar, Clock, User } from "lucide-react"

const posts = [
  {
    title: "How to Write YouTube Scripts That Keep Viewers Watching",
    excerpt:
      "Learn the proven script structure that top YouTubers use to hook viewers in the first 10 seconds and keep them watching until the end.",
    category: "Script Writing",
    author: "Creator AI Team",
    date: "Mar 5, 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    title: "5 Thumbnail Mistakes That Are Killing Your Click-Through Rate",
    excerpt:
      "Your video could be amazing, but if your thumbnail doesn't grab attention, nobody will click. Here are the 5 most common mistakes and how to fix them.",
    category: "Thumbnails",
    author: "Creator AI Team",
    date: "Feb 28, 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    title: "The Creator's Guide to Finding Trending Video Topics",
    excerpt:
      "Stop guessing what your audience wants. Here's a step-by-step guide to finding trending topics in your niche using data and AI.",
    category: "Video Ideas",
    author: "Creator AI Team",
    date: "Feb 20, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    title: "Why Subtitles Can Boost Your YouTube Views by 40%",
    excerpt:
      "Adding subtitles isn't just about accessibility — it's a growth strategy. Here's the data behind why subtitles matter more than you think.",
    category: "Subtitles",
    author: "Creator AI Team",
    date: "Feb 14, 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    title: "How AI Is Changing Content Creation for YouTubers",
    excerpt:
      "AI tools are no longer a novelty — they're becoming essential for creators who want to stay competitive. Here's what's changing and how to adapt.",
    category: "AI & Creators",
    author: "Creator AI Team",
    date: "Feb 7, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    title: "Story Structure 101: Plan Videos That People Actually Finish",
    excerpt:
      "Great videos aren't accidents. They follow a structure. Learn how to plan your video story so viewers stay engaged from start to finish.",
    category: "Story Building",
    author: "Creator AI Team",
    date: "Jan 30, 2026",
    readTime: "5 min read",
    featured: false,
  },
]

export default function BlogPage() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true })
    return () => lenis.destroy()
  }, [])

  const featured = posts.find((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <div className="flex flex-col min-h-screen">
      <LandingPageNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full pt-32 pb-16 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 -z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-purple-100/40 rounded-full blur-3xl" />
            <SparklesCore
              background="transparent"
              minSize={0.2}
              maxSize={0.8}
              className="absolute inset-0 w-full h-full z-0"
              particleColor="#a855f7"
              particleDensity={15}
            />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
                Creator AI{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Blog
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto">
                Tips, guides, and insights to help you create better content and grow your channel.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Post */}
        {featured && (
          <section className="py-12 bg-white">
            <div className="container max-w-5xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-slate-50 p-8 md:p-12 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer"
              >
                <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full mb-4">
                  Featured
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-slate-600 text-lg mb-6 max-w-3xl">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {featured.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {featured.readTime}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    {featured.category}
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section className="py-16 bg-slate-50">
          <div className="container max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-slate-900">Latest Posts</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer"
                >
                  <span className="inline-block w-fit text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full mb-4">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 bg-white">
          <div className="container max-w-2xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Stay in the Loop
              </h2>
              <p className="text-slate-600 mb-8">
                Get the latest tips, product updates, and creator insights delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 max-w-xs rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
