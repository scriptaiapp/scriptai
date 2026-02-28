"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import { Plus, Search } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { ContentCard } from "@/components/dashboard/common/ContentCard"
import ContentCardSkeleton from "@/components/dashboard/common/skeleton/ContentCardSkeleton"
import { EmptySvg } from "@/components/dashboard/common/EmptySvg"
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired"
import { api } from "@/lib/api-client"
import { downloadBlob } from "@/lib/download"
import type { StoryBuilderJob } from "@/hooks/useStoryBuilder"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const emptyStateVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
}

export default function StoryBuildersPage() {
  const { profile, profileLoading } = useSupabase()
  const [jobs, setJobs] = useState<StoryBuilderJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const data = await api.get<StoryBuilderJob[]>('/api/v1/story-builder', { requireAuth: true })
        // only show completed or generic ones, or maybe just show all because they might be processing
        setJobs(data)
      } catch (error) {
        toast.error("Failed to load story builders")
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    try {
      await api.delete(`/api/v1/story-builder/${jobToDelete}`, { requireAuth: true })
      setJobs(jobs.filter(j => j.id !== jobToDelete))
      toast.success("Story builder deleted", { description: "Your story builder has been deleted successfully." })
    } catch {
      toast.error("Error deleting story builder", { description: "Could not delete the story builder. Please try again." })
    }
    setJobToDelete(null)
  }

  const handleExportJob = async (id: string) => {
    if (!id) return
    try {
      const blob = await api.get<Blob>(`/api/v1/story-builder/${id}/export`, {
        requireAuth: true,
        responseType: "blob",
      })
      downloadBlob(blob, `story-builder-${id}.pdf`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error("Error exporting story builder", { description: message })
    }
  }

  if (profileLoading || loading) {
    return <ContentCardSkeleton />
  }

  const showTrainingOverlay = !profile?.youtube_connected || !profile?.ai_trained

  const filteredJobs = jobs.filter(j =>
    j.video_topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      className="container py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Story Builders</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all your generated story blueprints
          </p>
        </div>
        {!showTrainingOverlay && (
          <Link href="/dashboard/story-builder/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white transition-all hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10">
              <Plus className="mr-2 h-4 w-4" />
              New Story Builder
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder="Search story builders..."
            className="pl-10 focus-visible:ring-2 focus-visible:ring-purple-500/80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showTrainingOverlay ? (
          <motion.div
            key="training-required"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AITrainingRequired />
          </motion.div>
        ) : filteredJobs.length > 0 ? (
          <motion.div
            key="storybuilder-list"
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredJobs.map(job => (
              <ContentCard
                key={job.id}
                id={job.id}
                title={job.video_topic}
                created_at={job.created_at}
                onDelete={handleDeleteJob}
                setToDelete={setJobToDelete}
                onExport={handleExportJob}
                type="story-builder"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center py-16">
              <div className="flex flex-col items-center">
                <EmptySvg className="h-32 w-auto mb-6 text-slate-300 dark:text-slate-700" />
                <h3 className="font-semibold text-xl text-slate-800 dark:text-slate-200 mb-2">
                  Start your first blueprint
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `We couldn't find a story builder matching "${searchQuery}".`
                    : "Structure your story efficiently. Create a new Story Builder to begin."}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/story-builder/new">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white transition-all">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Story Builder
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
