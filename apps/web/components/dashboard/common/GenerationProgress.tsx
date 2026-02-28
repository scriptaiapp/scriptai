"use client"

import React from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, CheckCircle2, Loader2, Sparkles, Upload, type LucideIcon } from "lucide-react"

export interface GenerationProgressStep {
  label: string
  icon: LucideIcon
  threshold: number
}

interface GenerationProgressProps {
  progress: number
  statusMessage: string
  title?: string
  steps?: GenerationProgressStep[]
  icon?: LucideIcon
  hint?: string
  compact?: boolean
}

const DEFAULT_STEPS: GenerationProgressStep[] = [
  { label: "Queued", icon: Loader2, threshold: 0 },
  { label: "Preparing", icon: Sparkles, threshold: 10 },
  { label: "Generating", icon: Bot, threshold: 30 },
  { label: "Saving", icon: Upload, threshold: 80 },
  { label: "Done", icon: CheckCircle2, threshold: 100 },
]

export function GenerationProgress({
  progress,
  statusMessage,
  title = "Generation in Progress",
  steps = DEFAULT_STEPS,
  icon: Icon = Bot,
  hint,
  compact = false,
}: GenerationProgressProps) {
  const resolvedSteps = steps.length > 0 ? steps : DEFAULT_STEPS
  const isDone = progress >= 100

  const currentStepIndex = resolvedSteps.reduce(
    (acc, step, idx) => (progress >= step.threshold ? idx : acc),
    0,
  )

  const content = (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">


      {!compact && (
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 mb-8">

          {!isDone && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#347AF9]/20"
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#347AF9]/25 to-purple-500/20 blur-xl" />

          {!isDone && (
            <motion.div
              className="absolute inset-2 rounded-full border border-dashed border-[#347AF9]/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}

          <motion.div
            className="relative z-10 flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl"
            animate={isDone ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${isDone ? "text-emerald-500" : "text-[#347AF9]"}`} />
          </motion.div>
        </div>
      )}

      <div className="text-center mb-6 space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {isDone ? "Complete!" : title}
        </h3>
        <motion.p
          key={statusMessage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-slate-500 dark:text-slate-400 font-medium"
        >
          {statusMessage}
        </motion.p>
      </div>


      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
          <span className={`text-lg font-black tabular-nums ${isDone ? "text-emerald-500" : "bg-gradient-to-r from-[#347AF9] to-purple-500 bg-clip-text text-transparent"}`}>
            {progress}%
          </span>
        </div>
        <div className="relative h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${isDone ? "bg-emerald-500" : "bg-gradient-to-r from-[#347AF9] via-purple-500 to-[#347AF9] bg-[length:200%_100%]"}`}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%`, backgroundPosition: isDone ? undefined : ["0% 0%", "100% 0%"] }}
            transition={{
              width: { duration: 0.6, ease: "easeOut" },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
          />

          {!isDone && progress > 0 && (
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ left: ["-20%", "120%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
          )}
        </div>
      </div>


      <div className="flex items-start justify-between w-full relative">
        {resolvedSteps.map((step, idx) => {
          const StepIcon = step.icon
          const isActive = idx === currentStepIndex
          const isCompleted = idx < currentStepIndex
          const isLast = idx === resolvedSteps.length - 1

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-2 z-10">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`
                    flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-colors duration-300
                    ${isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : isActive
                        ? "bg-[#347AF9] text-white shadow-lg shadow-[#347AF9]/25 ring-4 ring-[#347AF9]/10"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className={`h-4 w-4 ${isActive && step.icon === Loader2 ? "animate-spin" : ""}`} />
                  )}
                </motion.div>
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-center leading-tight hidden sm:block ${isCompleted ? "text-emerald-600 dark:text-emerald-400"
                  : isActive ? "text-[#347AF9]"
                    : "text-slate-400 dark:text-slate-600"
                  }`}>
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 flex items-center self-start pt-[18px] sm:pt-[20px] px-1">
                  <div className="w-full h-[2px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      className={`h-full ${isCompleted ? "bg-emerald-500" : "bg-transparent"}`}
                      initial={{ width: "0%" }}
                      animate={{ width: isCompleted ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>


      {(progress < 100 || hint) && (
        <div className="flex flex-col items-center gap-3 mt-8">
          {progress < 100 && (
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-brand-primary"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          )}
          {hint && (
            <p className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800 text-center">
              💡 {hint}
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (compact) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-[#0E1338]">
          <CardContent className="p-6 sm:p-10">
            {content}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-3xl border border-slate-100 dark:border-slate-800 shadow-xl rounded-[2rem] bg-white dark:bg-[#0E1338] overflow-hidden relative">

        <div className="relative h-1 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#347AF9] via-purple-500 to-[#347AF9] bg-[length:200%_100%]"
            animate={{
              width: `${Math.max(progress, 3)}%`,
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              width: { duration: 0.6, ease: "easeOut" },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
          />
        </div>
        <CardContent className="p-8 sm:p-14">
          {content}
        </CardContent>
      </Card>
    </motion.div>
  )
}
