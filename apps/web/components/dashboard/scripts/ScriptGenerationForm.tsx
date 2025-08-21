"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"

import ScriptGenerationStepper from "./ScriptGenerationStepper"
import FormStep1 from "./FormStep1"
import FormStep2 from "./FormStep2"
import FormStep3 from "./FormStep3"

// Define a type for the form data to pass to the parent
export type ScriptFormData = {
    prompt: string
    context: string
    tone: string
    includeStorytelling: boolean
    references: string
    language: string
}

interface ScriptGenerationFormProps {
    loading: boolean
    onGenerate: (formData: ScriptFormData) => void
}

// Animation variants for the steps
const formStepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
}

export default function ScriptGenerationForm({
    loading,
    onGenerate,
}: ScriptGenerationFormProps) {
    // State for form inputs
    const [prompt, setPrompt] = useState("")
    const [context, setContext] = useState("")
    const [tone, setTone] = useState("conversational")
    const [includeStorytelling, setIncludeStorytelling] = useState(false)
    const [references, setReferences] = useState("")
    const [language, setLanguage] = useState("english")

    // State for UI flow
    const [step, setStep] = useState(1)
    const [promptError, setPromptError] = useState<string | null>(null)

    const handleNext = () => {
        if (step === 1 && !prompt) {
            setPromptError("Prompt is required")
            return
        }
        setPromptError(null)
        setStep(step + 1)
    }

    const handleGenerate = () => {
        if (!prompt) {
            setStep(1) // Go back to step 1 if prompt is missing
            setPromptError("Prompt is required")
            return
        }
        onGenerate({
            prompt,
            context,
            tone,
            includeStorytelling,
            references,
            language,
        })
    }

    const steps = [
        { id: 1, name: "Core Idea" },
        { id: 2, name: "Style & Tone" },
        { id: 3, name: "Sources & Generate" },
    ]

    return (
        <div className="relative space-y-6">
            <ScriptGenerationStepper steps={steps} currentStep={step} />

            <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 p-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-purple-800 dark:text-purple-200">
                    Generating a script will cost{" "}
                    <span className="font-semibold">1 credit</span>.
                </p>
            </div>

            <div className="relative h-[450px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={formStepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-6 absolute w-full"
                    >
                        {step === 1 && (
                            <FormStep1
                                prompt={prompt}
                                setPrompt={setPrompt}
                                context={context}
                                setContext={setContext}
                                promptError={promptError}
                            />
                        )}
                        {step === 2 && (
                            <FormStep2
                                tone={tone}
                                setTone={setTone}
                                language={language}
                                setLanguage={setLanguage}
                                includeStorytelling={includeStorytelling}
                                setIncludeStorytelling={setIncludeStorytelling}
                            />
                        )}
                        {step === 3 && (
                            <FormStep3
                                references={references}
                                setReferences={setReferences}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1 || loading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {step < 3 ? (
                    <Button
                        onClick={handleNext}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                        disabled={loading}
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerate}
                        className="bg-slate-900 hover:bg-slate-800 text-white min-w-[180px]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            "✨ Generate Script"
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}