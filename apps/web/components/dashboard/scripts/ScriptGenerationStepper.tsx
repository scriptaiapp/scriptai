"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"
import React from "react"

interface Step {
    id: number
    name: string
}

interface ScriptGenerationStepperProps {
    steps: Step[]
    currentStep: number
}

export default function ScriptGenerationStepper({ steps, currentStep }: ScriptGenerationStepperProps) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-10 px-4">
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id
                    const isActive = currentStep === step.id
                    const isLast = index === steps.length - 1

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Node */}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.15 : 1,
                                        backgroundColor: isCompleted || isActive ? "#347AF9" : "var(--bg-empty)",
                                    }}
                                    className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-[3px] transition-all duration-300 shadow-sm
                    ${isActive
                                            ? "border-[#347AF9]/30 bg-[#347AF9] text-white ring-4 ring-[#347AF9]/10"
                                            : isCompleted
                                                ? "border-[#347AF9] bg-[#347AF9] text-white"
                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400"
                                        }
                  `}
                                    style={{ '--bg-empty': 'transparent' } as any}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5 text-white stroke-[3px]" />
                                    ) : (
                                        <span className={`font-bold text-sm ${isActive ? "text-white" : ""}`}>
                                            {step.id}
                                        </span>
                                    )}
                                </motion.div>

                                {/* Step Label */}
                                <span className={`absolute -bottom-7 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${isActive ? "text-[#347AF9]" : isCompleted ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
                                    }`}
                                >
                                    {step.name}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                                <div className="flex-1 h-1.5 mx-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-[#347AF9]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: isCompleted ? "100%" : "0%" }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}