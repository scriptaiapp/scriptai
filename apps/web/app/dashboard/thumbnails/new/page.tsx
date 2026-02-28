"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useThumbnailGeneration } from "@/hooks/useThumbnailGeneration"
import { useSupabase } from "@/components/supabase-provider"
import ThumbnailGenerationForm from "@/components/dashboard/thumbnails/ThumbnailGenerationForm"
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewThumbnailPage() {
  const router = useRouter()
  const { profile, profileLoading } = useSupabase()
  const hook = useThumbnailGeneration()

  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-[600px] rounded-[2rem] mt-6" />
      </div>
    )
  }

  const showTrainingOverlay = !profile?.youtube_connected || !profile?.ai_trained

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/thumbnails")}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Thumbnail</h1>
            <p className="text-sm text-slate-500">Generate AI-powered thumbnails personalized to your channel style.</p>
          </div>
        </div>
      </div>

      {showTrainingOverlay ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AITrainingRequired />
        </motion.div>
      ) : (
        <ThumbnailGenerationForm
          prompt={hook.prompt} setPrompt={hook.setPrompt}
          context={hook.context} setContext={hook.setContext}
          ratio={hook.ratio} setRatio={hook.setRatio}
          videoLink={hook.videoLink} setVideoLink={hook.setVideoLink}
          referenceImage={hook.referenceImage} setReferenceImage={hook.setReferenceImage}
          faceImage={hook.faceImage} setFaceImage={hook.setFaceImage}
          isGenerating={hook.isGenerating}
          progress={hook.progress}
          statusMessage={hook.statusMessage}
          generatedImages={hook.generatedImages}
          creditsConsumed={hook.creditsConsumed}
          thumbnailJobId={null}
          onGenerate={hook.handleGenerate}
          onRegenerate={hook.handleRegenerate}
          onUsePreset={hook.handleUsePreset}
        />
      )}
    </div>
  )
}
