"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useScriptGeneration } from "@/hooks/useScriptGeneration"
import { useSupabase } from "@/components/supabase-provider"
import ScriptGenerationForm from "@/components/dashboard/scripts/ScriptGenerationForm"
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewScriptPage() {
  const router = useRouter()
  const { profile, profileLoading } = useSupabase()
  const hook = useScriptGeneration()

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
            onClick={() => router.push("/dashboard/scripts")}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Script</h1>
            <p className="text-sm text-slate-500">Generate an AI-powered script personalized to your style.</p>
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
        <ScriptGenerationForm
          prompt={hook.prompt} setPrompt={hook.setPrompt}
          context={hook.context} setContext={hook.setContext}
          tone={hook.tone} setTone={hook.setTone}
          language={hook.language} setLanguage={hook.setLanguage}
          duration={hook.duration} setDuration={hook.setDuration}
          customDuration={hook.customDuration} setCustomDuration={hook.setCustomDuration}
          includeStorytelling={hook.includeStorytelling} setIncludeStorytelling={hook.setIncludeStorytelling}
          includeTimestamps={hook.includeTimestamps} setIncludeTimestamps={hook.setIncludeTimestamps}
          references={hook.references} setReferences={hook.setReferences}
          files={hook.files} setFiles={hook.setFiles}
          isGenerating={hook.isGenerating}
          onGenerate={hook.handleGenerate}
          onRegenerate={hook.handleRegenerate}
          progress={hook.progress}
          statusMessage={hook.statusMessage}
          generatedScript={hook.generatedScript}
          setGeneratedScript={hook.setGeneratedScript}
          generatedTitle={hook.generatedTitle}
          setGeneratedTitle={hook.setGeneratedTitle}
          creditsConsumed={hook.creditsConsumed}
          scriptId={hook.scriptJobId}
        />
      )}
    </div>
  )
}
