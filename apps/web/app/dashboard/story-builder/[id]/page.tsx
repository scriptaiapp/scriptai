"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  ArrowLeft, Trash2, RefreshCw, Plus, CreditCard,
  Film, Clock, Clapperboard, Users, GraduationCap, Palette,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { StoryBuilderResults } from "@/components/dashboard/story-builder/StoryBuilderResults"
import { ScriptLoaderSkeleton } from "@/components/dashboard/scripts/skeleton/scriptLoaderSkeleton"
import { InfoItem } from "@/components/dashboard/scripts/InfoItem"
import { api } from "@/lib/api-client"
import {
  CONTENT_TYPE_LABELS,
  VIDEO_DURATION_LABELS,
  STORY_MODE_LABELS,
  AUDIENCE_LEVEL_LABELS,
} from "@repo/validation"
import type { StoryBuilderJob } from "@/hooks/useStoryBuilder"

export default function StoryBuilderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [job, setJob] = useState<StoryBuilderJob | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingJob, setIsLoadingJob] = useState(true)

  const jobId = params.id as string

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return
      setIsLoadingJob(true)
      try {
        const data = await api.get<StoryBuilderJob>(`/api/v1/story-builder/${jobId}`, { requireAuth: true })
        setJob(data)
      } catch (error: unknown) {
        toast.error("Error loading blueprint", {
          description: error instanceof Error ? error.message : "Failed to fetch blueprint details.",
        })
        router.push("/dashboard/story-builder")
      } finally {
        setIsLoadingJob(false)
      }
    }
    fetchJob()
  }, [jobId, router])

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/api/v1/story-builder/${jobId}`, { requireAuth: true })
      toast.success("Blueprint deleted!")
      router.push("/dashboard/story-builder")
    } catch (error: unknown) {
      toast.error("Error deleting blueprint", {
        description: error instanceof Error ? error.message : "Failed to delete.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingJob) return <ScriptLoaderSkeleton />
  if (!job) return null

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/story-builder")}
            className="rounded-xl"
            aria-label="Back to blueprints"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blueprint Details</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">View your story blueprint</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {job.credits_consumed > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <CreditCard className="h-4 w-4" />
              <span>{job.credits_consumed} credit{job.credits_consumed > 1 ? "s" : ""} used</span>
            </div>
          )}
          <Link href="/dashboard/story-builder/new">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Blueprint
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="line-clamp-2">{job.video_topic}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(job.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        disabled={loading}
                        title="Delete blueprint"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this story blueprint.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/story-builder/new")}
                    title="Create new blueprint"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {job.result && (
            <StoryBuilderResults
              result={job.result}
              onRegenerate={() => router.push("/dashboard/story-builder/new")}
              isGenerating={false}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generation Details</CardTitle>
              <CardDescription>Parameters used for this blueprint.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <InfoItem icon={Film} label="Content Type">
                  {CONTENT_TYPE_LABELS[job.content_type] || job.content_type}
                </InfoItem>
                <InfoItem icon={Clapperboard} label="Story Mode">
                  {STORY_MODE_LABELS[job.story_mode] || job.story_mode}
                </InfoItem>
                <InfoItem icon={Clock} label="Duration">
                  {VIDEO_DURATION_LABELS[job.video_duration]}
                </InfoItem>
                <InfoItem icon={GraduationCap} label="Audience Level">
                  {AUDIENCE_LEVEL_LABELS[job.audience_level] || job.audience_level}
                </InfoItem>
                {job.target_audience && (
                  <InfoItem icon={Users} label="Target Audience">
                    {job.target_audience}
                  </InfoItem>
                )}
                {job.tone && (
                  <InfoItem icon={Palette} label="Tone">
                    {job.tone}
                  </InfoItem>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
