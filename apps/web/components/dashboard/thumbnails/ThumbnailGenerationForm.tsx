"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, CheckCircle2, ExternalLink, Download, Image as ImageIcon, Upload as UploadIcon } from "lucide-react"
import { GenerationProgress, type GenerationProgressStep } from "@/components/dashboard/common/GenerationProgress"
import { MultiStepFormLayout, type FormStep } from "@/components/dashboard/common/MultiStepFormLayout"
import { ThumbnailOutput } from "./ThumbnailOutput"
import ThumbnailStep1 from "./ThumbnailStep1"
import ThumbnailStep2 from "./ThumbnailStep2"
import ThumbnailStep3 from "./ThumbnailStep3"
import type { ThumbnailJob, ThumbnailRatio } from "@/hooks/useThumbnailGeneration"
import { downloadFile } from "@/lib/download"

const THUMBNAIL_STEPS: GenerationProgressStep[] = [
    { label: "Queued", icon: Loader2, threshold: 0 },
    { label: "Preparing", icon: Sparkles, threshold: 10 },
    { label: "Creating", icon: ImageIcon, threshold: 30 },
    { label: "Saving", icon: UploadIcon, threshold: 80 },
    { label: "Done", icon: CheckCircle2, threshold: 100 },
]

const STEPS: FormStep[] = [
    { id: 1, label: "Creative Direction", description: "Topic & mood" },
    { id: 2, label: "Style & Ratio", description: "Format & video" },
    { id: 3, label: "References", description: "Images & generate" },
    { id: 4, label: "Results", description: "View & download" },
]

interface ThumbnailGenerationFormProps {
    prompt: string; setPrompt: (v: string) => void
    context: string; setContext: (v: string) => void
    ratio: ThumbnailRatio; setRatio: (v: ThumbnailRatio) => void
    videoLink: string; setVideoLink: (v: string) => void
    referenceImage: File | null; setReferenceImage: (v: File | null) => void
    faceImage: File | null; setFaceImage: (v: File | null) => void
    isGenerating: boolean
    progress: number
    statusMessage: string
    generatedImages: string[]
    creditsConsumed: number
    thumbnailJobId: string | null
    onGenerate: () => void
    onRegenerate: () => void
    onUsePreset: (prompt: string) => void
}

export default function ThumbnailGenerationForm(props: ThumbnailGenerationFormProps) {
    const [step, setStep] = useState(1)
    const [promptError, setPromptError] = useState<string | null>(null)

    const hasOutput = props.generatedImages.length > 0

    useEffect(() => {
        if (props.isGenerating && step !== 4) setStep(4)
    }, [props.isGenerating, step])

    const handleNext = () => {
        if (step === 1 && (!props.prompt.trim() || props.prompt.trim().length < 3)) {
            setPromptError("Prompt must be at least 3 characters")
            return
        }
        setPromptError(null)
        setStep(step + 1)
    }

    const handleGenerate = () => {
        if (!props.prompt.trim()) {
            setStep(1)
            setPromptError("Prompt is required")
            return
        }
        props.onGenerate()
    }

    const canNavigateTo = (targetStep: number) => {
        if (targetStep < step) return true
        if (targetStep === 4 && hasOutput) return true
        return false
    }


    const previewJob: ThumbnailJob = {
        id: props.thumbnailJobId ?? "",
        user_id: "",
        prompt: props.prompt,
        status: "completed",
        ratio: props.ratio,
        generate_count: props.generatedImages.length,
        image_urls: props.generatedImages,
        reference_image_url: null,
        face_image_url: null,
        video_link: props.videoLink || null,
        video_frame_url: null,
        error_message: null,
        credits_consumed: props.creditsConsumed,
        job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    const renderStep = () => {
        switch (step) {
            case 1: return (
                <ThumbnailStep1
                    prompt={props.prompt} setPrompt={props.setPrompt}
                    context={props.context} setContext={props.setContext}
                    promptError={promptError}
                    onUsePreset={props.onUsePreset}
                />
            )
            case 2: return (
                <ThumbnailStep2
                    ratio={props.ratio} setRatio={props.setRatio}
                    videoLink={props.videoLink} setVideoLink={props.setVideoLink}
                />
            )
            case 3: return (
                <ThumbnailStep3
                    referenceImage={props.referenceImage} setReferenceImage={props.setReferenceImage}
                    faceImage={props.faceImage} setFaceImage={props.setFaceImage}
                />
            )
            case 4: return props.isGenerating ? (
                <GenerationProgress progress={props.progress} statusMessage={props.statusMessage} steps={THUMBNAIL_STEPS} compact />
            ) : (
                <ThumbnailOutput
                    job={previewJob}
                    onDownload={(url, i) => downloadFile(url, `thumbnail_${i + 1}.png`)}
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
            generateLabel="Generate Thumbnails"
            hideFooter={step === 4 && props.isGenerating}
            onBack={() => setStep(step - 1)}
            onNext={handleNext}
            onGenerate={handleGenerate}
            onRegenerate={props.onRegenerate}
            sidebarActions={
                <>
                    {props.thumbnailJobId && (
                        <Link href={`/dashboard/thumbnails/${props.thumbnailJobId}`} className="block">
                            <Button variant="outline" className="w-full justify-start rounded-xl font-semibold border-slate-200 dark:border-slate-700 hover:border-brand-primary/50 hover:bg-brand-primary/5">
                                <ExternalLink className="h-4 w-4 mr-2 text-brand-primary" /> View Details
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="outline"
                        className="w-full justify-start rounded-xl font-semibold border-slate-200 dark:border-slate-700"
                        onClick={() => props.generatedImages.forEach((url, i) => downloadFile(url, `thumbnail_${i + 1}.png`))}
                    >
                        <Download className="h-4 w-4 mr-2" /> Download All
                    </Button>
                </>
            }
        >
            {renderStep()}
        </MultiStepFormLayout>
    )
}
