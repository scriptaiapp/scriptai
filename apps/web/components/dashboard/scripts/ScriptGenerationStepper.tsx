"use client"

import { motion } from "motion/react"

interface StepperProps {
    steps: { id: number; name: string }[]
    currentStep: number
}

export default function ScriptGenerationStepper({
    steps,
    currentStep,
}: StepperProps) {
    return (
        <div className="flex items-center justify-between px-2">
            {steps.map((s, index) => (
                <motion.div
                    key={s.id}
                    className="flex items-center"
                >
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            animate={currentStep >= s.id ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${currentStep >= s.id
                                    ? "bg-purple-600 dark:bg-purple-500"
                                    : "bg-slate-300 dark:bg-slate-700"
                                }`}
                        >
                            {currentStep > s.id ? "✓" : s.id}
                        </motion.div>
                        <p
                            className={`mt-2 text-sm font-medium transition-colors ${currentStep >= s.id
                                    ? "text-slate-800 dark:text-slate-200"
                                    : "text-slate-400"
                                }`}
                        >
                            {s.name}
                        </p>
                    </div>
                    {index < steps.length - 1 && (
                        <motion.div
                            className="flex-1 h-1 mx-2 rounded-full"
                            initial={{ backgroundColor: "#e2e8f0" }} // light grey
                            animate={
                                currentStep > s.id
                                    ? { backgroundColor: "#8b5cf6" } // purple
                                    : { backgroundColor: "#e2e8f0" }
                            }
                            transition={{ duration: 0.3 }}
                        />
                    )}
                </motion.div>
            ))}
        </div>
    )
}