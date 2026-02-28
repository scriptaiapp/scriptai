"use client"

import { useState, useEffect } from "react"
import { MultiStepFormLayout, type FormStep } from "@/components/dashboard/common/MultiStepFormLayout"


import RSFormStep1 from "./RSFormStep1"
import RSFormStep2 from "./RSFormStep2"
import IdeationProgress from "./IdeationProgress"

interface ResearchFormProps {
    context: string
    setContext: (v: string) => void
    nicheFocus: string
    setNicheFocus: (v: string) => void
    ideaCount: number
    setIdeaCount: (v: number) => void
    autoMode: boolean
    setAutoMode: (v: boolean) => void
    isGenerating: boolean
    onGenerate: () => void
    progress: number
    statusMessage: string
    generatedResult: any
    credits: number
}

const STEPS: FormStep[] = [
    { id: 1, label: "Core Strategy", description: "Auto Mode & Niche" },
    { id: 2, label: "Refinement", description: "Context & Quantity" },
    { id: 3, label: "Review", description: "Generate Ideas" },
]

export function ResearchForm({
    context, setContext,
    nicheFocus, setNicheFocus,
    ideaCount, setIdeaCount,
    autoMode, setAutoMode,
    isGenerating, onGenerate,
    progress, statusMessage, generatedResult,
    credits
}: ResearchFormProps) {
    const [step, setStep] = useState(1)
    const [nicheError, setNicheError] = useState<string | null>(null)

    const hasOutput = !!generatedResult

    useEffect(() => {
        if (isGenerating && step !== 3) setStep(3)
    }, [isGenerating, step])

    const handleNext = () => {
        if (step === 1 && !autoMode && !nicheFocus.trim()) {
            setNicheError("Niche Focus is required when Auto Mode is off.")
            return
        }
        setNicheError(null)
        setStep(step + 1)
    }

    const handleGenerate = () => {
        if (!autoMode && !nicheFocus.trim()) {
            setStep(1)
            setNicheError("Niche Focus is required when Auto Mode is off.")
            return
        }
        onGenerate()
    }

    const canNavigateTo = (targetStep: number) => {
        if (targetStep < step) return true
        if (targetStep === 3 && hasOutput) return true
        return false
    }

    const renderStep = () => {
        switch (step) {
            case 1: return (
                <RSFormStep1
                    autoMode={autoMode} setAutoMode={setAutoMode}
                    nicheFocus={nicheFocus} setNicheFocus={setNicheFocus}
                    nicheError={nicheError}
                />
            )
            case 2: return (
                <RSFormStep2
                    context={context} setContext={setContext}
                    ideaCount={ideaCount} setIdeaCount={setIdeaCount}
                />
            )
            case 3: return isGenerating ? (
                <IdeationProgress progress={progress} statusMessage={statusMessage} />
            ) : null
        }
    }

    return (
        <div className="relative">
            <MultiStepFormLayout
                steps={STEPS}
                currentStep={step}
                onStepClick={setStep}
                canNavigateTo={canNavigateTo}
                hasOutput={hasOutput}
                isGenerating={isGenerating}
                generateLabel="Generate Ideas"
                hideFooter={step === 3 && (isGenerating || generatedResult)}
                onBack={() => setStep(step - 1)}
                onNext={handleNext}
                onGenerate={handleGenerate}
                onRegenerate={() => { }}
                stretchContent={!isGenerating && !generatedResult}
                sidebarBottom={
                    !isGenerating && !generatedResult && step < 3 ? (
                        <div className="flex items-center gap-3 w-full">
                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/50">
                                <span className="text-amber-600 dark:text-amber-400 text-base font-black">
                                    C
                                </span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Available Credits
                                </p>
                                <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">
                                    {credits}{" "}
                                    <span className="text-xs font-semibold text-slate-500 ml-1 tracking-normal">
                                        (min. 2 per run)
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : undefined
                }
            >
                {renderStep()}
            </MultiStepFormLayout>
        </div>
    )
}
