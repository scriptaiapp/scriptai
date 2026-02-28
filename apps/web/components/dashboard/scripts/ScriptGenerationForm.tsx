"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, CheckCircle2, ExternalLink, PenTool, Upload } from "lucide-react"
import { toast } from "sonner"
import { updateScript } from "@/lib/api/getScripts"
import { api } from "@/lib/api-client"
import { downloadBlob } from "@/lib/download"
import { GenerationProgress, type GenerationProgressStep } from "@/components/dashboard/common/GenerationProgress"
import { MultiStepFormLayout, type FormStep } from "@/components/dashboard/common/MultiStepFormLayout"

import FormStep1 from "./FormStep1"
import FormStep2 from "./FormStep2"
import FormStep3 from "./FormStep3"
import ReviewStep from "./ReviewStep"

const SCRIPT_STEPS: GenerationProgressStep[] = [
  { label: "Queued", icon: Loader2, threshold: 0 },
  { label: "Preparing", icon: Sparkles, threshold: 10 },
  { label: "Writing", icon: PenTool, threshold: 30 },
  { label: "Saving", icon: Upload, threshold: 80 },
  { label: "Done", icon: CheckCircle2, threshold: 100 },
]

const STEPS: FormStep[] = [
  { id: 1, label: "Core Idea", description: "Topic & context" },
  { id: 2, label: "Style & Tone", description: "Voice & format" },
  { id: 3, label: "Sources", description: "References & files" },
  { id: 4, label: "Review", description: "Edit & refine" },
]

interface ScriptGenerationFormProps {
  prompt: string; setPrompt: (v: string) => void
  context: string; setContext: (v: string) => void
  tone: string; setTone: (v: string) => void
  language: string; setLanguage: (v: string) => void
  duration: string; setDuration: (v: string) => void
  customDuration: string; setCustomDuration: (v: string) => void
  includeStorytelling: boolean; setIncludeStorytelling: (v: boolean) => void
  includeTimestamps: boolean; setIncludeTimestamps: (v: boolean) => void
  references: string[]; setReferences: (v: string[]) => void
  files: File[]; setFiles: React.Dispatch<React.SetStateAction<File[]>>
  isGenerating: boolean
  onGenerate: () => void
  onRegenerate: () => void
  progress: number
  statusMessage: string
  generatedScript: string
  setGeneratedScript: (s: string) => void
  generatedTitle: string
  setGeneratedTitle: (s: string) => void
  creditsConsumed: number
  scriptId: string | null
}

export default function ScriptGenerationForm(props: ScriptGenerationFormProps) {
  const [step, setStep] = useState(1)
  const [promptError, setPromptError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const hasOutput = !!props.generatedScript

  useEffect(() => {
    if (props.isGenerating && step !== 4) setStep(4)
  }, [props.isGenerating, step])

  const handleNext = () => {
    if (step === 1 && !props.prompt.trim()) {
      setPromptError("A core prompt is required to proceed.")
      return
    }
    setPromptError(null)
    setStep(step + 1)
  }

  const handleGenerate = () => {
    if (!props.prompt.trim()) {
      setStep(1)
      setPromptError("A core prompt is required to proceed.")
      return
    }
    props.onGenerate()
  }

  const handleSave = async () => {
    if (!props.scriptId || !props.generatedTitle || !props.generatedScript) return
    setIsSaving(true)
    try {
      const result = await updateScript(props.scriptId, { title: props.generatedTitle, content: props.generatedScript })
      if (!result) throw new Error("Save failed")
      toast.success("Script saved!")
    } catch {
      toast.error("Failed to save script")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    if (!props.scriptId) return
    try {
      const blob = await api.get<Blob>(`/api/v1/script/${props.scriptId}/export`, {
        requireAuth: true,
        responseType: "blob",
      })
      downloadBlob(blob, `${props.generatedTitle || "script"}.pdf`)
      toast.success("PDF exported!")
    } catch {
      toast.error("Failed to export PDF")
    }
  }

  const canNavigateTo = (targetStep: number) => {
    if (targetStep < step) return true
    if (targetStep === 4 && hasOutput) return true
    return false
  }

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <FormStep1
          prompt={props.prompt} setPrompt={props.setPrompt}
          context={props.context} setContext={props.setContext}
          promptError={promptError}
        />
      )
      case 2: return (
        <FormStep2
          tone={props.tone} setTone={props.setTone}
          language={props.language} setLanguage={props.setLanguage}
          includeStorytelling={props.includeStorytelling} setIncludeStorytelling={props.setIncludeStorytelling}
          customDuration={props.customDuration} setCustomDuration={props.setCustomDuration}
          duration={props.duration} setDuration={props.setDuration}
          includeTimestamps={props.includeTimestamps} setIncludeTimestamps={props.setIncludeTimestamps}
        />
      )
      case 3: return (
        <FormStep3
          references={props.references} setReferences={props.setReferences}
          files={props.files} setFiles={props.setFiles}
        />
      )
      case 4: return props.isGenerating ? (
        <GenerationProgress progress={props.progress} statusMessage={props.statusMessage} steps={SCRIPT_STEPS} compact />
      ) : (
        <ReviewStep
          title={props.generatedTitle} setTitle={props.setGeneratedTitle}
          content={props.generatedScript} setContent={props.setGeneratedScript}
          scriptId={props.scriptId}
          creditsConsumed={props.creditsConsumed}
          isSaving={isSaving}
          onSave={handleSave}
          onExport={handleExport}
        />
      )
    }
  }

  return (
    <MultiStepFormLayout
      steps={STEPS}
      currentStep={step}
      onStepClick={setStep}
      canNavigateTo={canNavigateTo}
      hasOutput={hasOutput}
      isGenerating={props.isGenerating}
      generateLabel="Generate Script"
      hideFooter={step === 4 && props.isGenerating}
      onBack={() => setStep(step - 1)}
      onNext={handleNext}
      onGenerate={handleGenerate}
      onRegenerate={props.onRegenerate}
      sidebarActions={props.scriptId ? (
        <Link href={`/dashboard/scripts/${props.scriptId}`} className="block">
          <Button variant="outline" className="w-full justify-start rounded-xl font-semibold border-slate-200 dark:border-slate-700 hover:border-brand-primary/50 hover:bg-brand-primary/5">
            <ExternalLink className="h-4 w-4 mr-2 text-brand-primary" /> Open Full Editor
          </Button>
        </Link>
      ) : undefined}
    >
      {renderStep()}
    </MultiStepFormLayout>
  )
}
