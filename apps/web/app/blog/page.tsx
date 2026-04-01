"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import LandingPageNavbar from "@/components/landingPage/LandingPageNavbar"
import Footer from "@/components/footer"
import { SparklesCore } from "@repo/ui/sparkles"
import { ArrowRight, Calendar, Clock, User } from "lucide-react"
import { blogPosts } from "@/lib/blog-data"
import { toast } from "sonner"

export default function BlogPage() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true })
    return () => lenis.destroy()
  }, [])

  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail || subscribing) return
    setSubscribing(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      if (!res.ok) throw new Error("Failed to subscribe")
      toast.success("Subscribed!", {
        description: "You'll receive the latest updates in your inbox.",
      })
      setNewsletterEmail("")
    } catch {
      toast.error("Failed to subscribe", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setSubscribing(false)
    }
  }

  const featured = blogPosts.find((p) => p.featured)
  const rest = blogPosts.filter((p) => !p.featured)

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
              <Link href={`/blog/${featured.slug}`}>
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
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
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
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 group-hover:gap-2.5 transition-all">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.div>
              </Link>
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
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer h-full"
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
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
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
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 max-w-xs rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {subscribing ? "Subscribing..." : "Subscribe"}
                  {!subscribing && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
