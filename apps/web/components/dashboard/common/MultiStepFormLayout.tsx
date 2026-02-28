"use client"

import { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2, Sparkles, RefreshCw } from "lucide-react"

export interface FormStep {
    id: number
    label: string
    description: string
}

interface MultiStepFormLayoutProps {
    steps: FormStep[]
    currentStep: number
    onStepClick: (step: number) => void
    canNavigateTo: (step: number) => boolean
    hasOutput: boolean
    isGenerating: boolean
    /** Content rendered inside the animated step panel */
    children: ReactNode
    /** Optional sidebar actions shown below the step nav when on the last step with output */
    sidebarActions?: ReactNode
    /** Optional sidebar content shown unconditionally below the nav steps */
    sidebarBottom?: ReactNode
    /** Hides the footer entirely (e.g. while generating on the last step) */
    hideFooter?: boolean
    /** Label for the generate button on step 3 */
    generateLabel?: string
    onBack: () => void
    onNext: () => void
    onGenerate: () => void
    onRegenerate: () => void
    /** Stretch content panel height when not on results step */
    stretchContent?: boolean
}

const stepVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
}

export function MultiStepFormLayout({
    steps,
    currentStep,
    onStepClick,
    canNavigateTo,
    hasOutput,
    isGenerating,
    children,
    sidebarActions,
    sidebarBottom,
    hideFooter,
    generateLabel = "Generate",
    onBack,
    onNext,
    onGenerate,
    onRegenerate,
    stretchContent = true,
}: MultiStepFormLayoutProps) {
    const isLastStep = currentStep === steps.length
    const isOnResults = isLastStep && hasOutput

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left — Vertical Step Nav */}
            <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-4">
                <div className="bg-white dark:bg-[#0E1338] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Steps</p>
                    {steps.map((s) => {
                        const isDone = s.id < currentStep || (s.id === steps.length && hasOutput && !isGenerating)
                        const isActive = s.id === currentStep
                        const canClick = canNavigateTo(s.id)
                        return (
                            <button
                                key={s.id}
                                onClick={() => { if (canClick) onStepClick(s.id) }}
                                disabled={!canClick && !isActive}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${isActive
                                    ? "bg-brand-primary/10 border border-brand-primary/20"
                                    : isDone
                                        ? "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                        : "opacity-40 cursor-not-allowed"
                                    }`}
                            >
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${isActive
                                    ? "bg-brand-primary text-white"
                                    : isDone
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    }`}>
                                    {isDone && !isActive ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold leading-tight ${isActive ? "text-brand-primary" : "text-slate-700 dark:text-slate-200"}`}>
                                        {s.label}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>


                {isOnResults && !isGenerating && sidebarActions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#0E1338] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 space-y-3"
                    >
                        {sidebarActions}
                    </motion.div>
                )}


                {sidebarBottom && (
                    <div className="bg-transparent lg:bg-white dark:bg-[#0E1338] lg:rounded-[1.5rem] lg:border border-slate-100 dark:border-slate-800 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-5 mt-4">
                        {sidebarBottom}
                    </div>
                )}
            </div>

            {/* Right — Content Panel */}
            <div className="lg:col-span-9">
                <div className="bg-white dark:bg-[#0E1338] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col">

                    {/* Step Content */}
                    <div className={`relative ${stretchContent && !(isOnResults) ? "min-h-[480px]" : ""} p-8 sm:p-10`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="w-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Action Bar */}
                    {!hideFooter && (
                        <div className="bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 px-8 sm:px-10 py-5 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                disabled={currentStep === 1 || isGenerating}
                                className={`text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center ${currentStep === 1 ? "invisible" : ""}`}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            {isOnResults ? (
                                <Button
                                    onClick={onRegenerate}
                                    disabled={isGenerating}
                                    className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-md hover:shadow-lg shrink-0 rounded-xl"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                                </Button>
                            ) : currentStep < steps.length - 1 ? (
                                // Steps 1 and 2 → Continue
                                <Button
                                    onClick={onNext}
                                    disabled={isGenerating}
                                    className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl"
                                >
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : currentStep === steps.length - 1 ? (
                                // Last input step (step 3) → Generate
                                <Button
                                    onClick={onGenerate}
                                    disabled={isGenerating}
                                    className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl"
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-4 w-4" /> {generateLabel}</>
                                    )}
                                </Button>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
