"use client"

import { Loader2, Sparkles, BookOpen, BarChart3, PenTool, CheckCircle2 } from "lucide-react"
import { GenerationProgress, type GenerationProgressStep } from "@/components/dashboard/common/GenerationProgress"

const STORY_STEPS: GenerationProgressStep[] = [
    { label: "Queued", icon: Loader2, threshold: 0 },
    { label: "Profile", icon: Sparkles, threshold: 10 },
    { label: "Blueprint", icon: BookOpen, threshold: 20 },
    { label: "Scoring", icon: BarChart3, threshold: 75 },
    { label: "Saving", icon: PenTool, threshold: 85 },
    { label: "Done", icon: CheckCircle2, threshold: 100 },
]

interface StoryBuilderProgressProps {
    progress: number
    statusMessage: string
    compact?: boolean
}

export function StoryBuilderProgress({ progress, statusMessage, compact }: StoryBuilderProgressProps) {
    return (
        <GenerationProgress
            progress={progress}
            statusMessage={statusMessage}
            title="Generating Story Blueprint"
            steps={STORY_STEPS}
            icon={BookOpen}
            hint="This may take 1-3 minutes depending on complexity"
            compact={compact}
        />
    )
}
