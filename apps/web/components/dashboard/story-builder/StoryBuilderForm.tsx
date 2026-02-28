"use client"

import { useState, useEffect } from "react"
import { MultiStepFormLayout, type FormStep } from "@/components/dashboard/common/MultiStepFormLayout"
import { GenerationProgress, type GenerationProgressStep } from "@/components/dashboard/common/GenerationProgress"
import { Loader2, Sparkles, BookOpen, Repeat, CheckCircle2 } from "lucide-react"

import SBFormStep1 from "./SBFormStep1"
import SBFormStep2 from "./SBFormStep2"
import SBFormStep3 from "./SBFormStep3"
import { StoryBuilderResults } from "./StoryBuilderResults"

import {
  type VideoDuration,
  type ContentType,
  type StoryMode,
  type AudienceLevel,
} from "@repo/validation"
import type { IdeationJob } from "@repo/validation"

interface StoryBuilderFormProps {
  videoTopic: string
  setVideoTopic: (v: string) => void
  targetAudience: string
  setTargetAudience: (v: string) => void
  audienceLevel: AudienceLevel
  setAudienceLevel: (v: AudienceLevel) => void
  videoDuration: VideoDuration
  setVideoDuration: (v: VideoDuration) => void
  contentType: ContentType
  setContentType: (v: ContentType) => void
  storyMode: StoryMode
  setStoryMode: (v: StoryMode) => void
  tone: string
  setTone: (v: string) => void
  additionalContext: string
  setAdditionalContext: (v: string) => void
  personalized: boolean
  setPersonalized: (v: boolean) => void
  aiTrained: boolean
  isGenerating: boolean
  onGenerate: () => void
  onRegenerate: () => void
  ideationJobs: IdeationJob[]
  isLoadingIdeations: boolean
  onSelectIdea: (ideationId: string, ideaIndex: number, ideaTitle: string) => void
  selectedIdeationId?: string
  selectedIdeaIndex?: number
  progress: number
  statusMessage: string
  generatedResult: any
}

const SB_STEPS: GenerationProgressStep[] = [
  { label: "Queued", icon: Loader2, threshold: 0 },
  { label: "Profile", icon: Sparkles, threshold: 15 },
  { label: "Structuring", icon: BookOpen, threshold: 45 },
  { label: "Mapping Tension", icon: Repeat, threshold: 80 },
  { label: "Done", icon: CheckCircle2, threshold: 100 },
]

const STEPS: FormStep[] = [
  { id: 1, label: "Core Idea", description: "Topic & format" },
  { id: 2, label: "Audience & Duration", description: "Targeting & length" },
  { id: 3, label: "Style & Tone", description: "Context & personalization" },
  { id: 4, label: "Review", description: "View blueprint" },
]

export function StoryBuilderForm({
  videoTopic, setVideoTopic,
  targetAudience, setTargetAudience,
  audienceLevel, setAudienceLevel,
  videoDuration, setVideoDuration,
  contentType, setContentType,
  storyMode, setStoryMode,
  tone, setTone,
  additionalContext, setAdditionalContext,
  personalized, setPersonalized,
  aiTrained, isGenerating, onGenerate, onRegenerate,
  ideationJobs, isLoadingIdeations, onSelectIdea,
  selectedIdeationId, selectedIdeaIndex,
  progress, statusMessage, generatedResult
}: StoryBuilderFormProps) {
  const [step, setStep] = useState(1)
  const [topicError, setTopicError] = useState<string | null>(null)

  const hasOutput = !!generatedResult

  useEffect(() => {
    if (isGenerating && step !== 4) setStep(4)
  }, [isGenerating, step])

  const handleNext = () => {
    if (step === 1 && !videoTopic.trim()) {
      setTopicError("A core video topic is required to proceed.")
      return
    }
    setTopicError(null)
    setStep(step + 1)
  }

  const handleGenerate = () => {
    if (!videoTopic.trim()) {
      setStep(1)
      setTopicError("A core video topic is required to proceed.")
      return
    }
    onGenerate()
  }

  const canNavigateTo = (targetStep: number) => {
    if (targetStep < step) return true
    if (targetStep === 4 && hasOutput) return true
    return false
  }

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <SBFormStep1
          videoTopic={videoTopic} setVideoTopic={setVideoTopic}
          contentType={contentType} setContentType={setContentType}
          storyMode={storyMode} setStoryMode={setStoryMode}
          ideationJobs={ideationJobs} isLoadingIdeations={isLoadingIdeations} onSelectIdea={onSelectIdea}
          selectedIdeationId={selectedIdeationId} selectedIdeaIndex={selectedIdeaIndex}
          topicError={topicError}
        />
      )
      case 2: return (
        <SBFormStep2
          videoDuration={videoDuration} setVideoDuration={setVideoDuration}
          audienceLevel={audienceLevel} setAudienceLevel={setAudienceLevel}
          targetAudience={targetAudience} setTargetAudience={setTargetAudience}
        />
      )
      case 3: return (
        <SBFormStep3
          tone={tone} setTone={setTone}
          additionalContext={additionalContext} setAdditionalContext={setAdditionalContext}
          personalized={personalized} setPersonalized={setPersonalized}
          aiTrained={aiTrained}
        />
      )
      case 4: return isGenerating ? (
        <GenerationProgress progress={progress} statusMessage={statusMessage} steps={SB_STEPS} compact />
      ) : generatedResult ? (
        <StoryBuilderResults
          result={generatedResult}
          isGenerating={isGenerating}
          onRegenerate={onRegenerate}
        />
      ) : null
    }
  }

  return (
    <MultiStepFormLayout
      steps={STEPS}
      currentStep={step}
      onStepClick={setStep}
      canNavigateTo={canNavigateTo}
      hasOutput={hasOutput}
      isGenerating={isGenerating}
      generateLabel={personalized && aiTrained ? "Generate Blueprint" : "Generate Blueprint"}
      hideFooter={step === 4 && (isGenerating || generatedResult)}
      onBack={() => setStep(step - 1)}
      onNext={handleNext}
      onGenerate={handleGenerate}
      onRegenerate={onRegenerate}
    >
      {renderStep()}
    </MultiStepFormLayout>
  )
}
