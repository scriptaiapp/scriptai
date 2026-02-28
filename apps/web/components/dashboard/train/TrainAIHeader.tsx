"use client"

import { motion } from "motion/react"
import { Youtube, Sparkles, Zap } from "lucide-react"

interface TrainAIHeaderProps {
  isYtConnected: boolean
  isAiTrained: boolean
  lastCreditsConsumed: number | null
}

export function TrainAIHeader({ isYtConnected, isAiTrained, lastCreditsConsumed }: TrainAIHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-100 dark:border-slate-800 pb-6"
    >
      {/* Title Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Studio
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
          Train your custom AI model on your unique vocabulary, tone, and pacing.
        </p>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* YouTube Status Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${isYtConnected
          ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
          : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
          }`}>
          {isYtConnected ? (
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          ) : (
            <Youtube className="h-4 w-4 opacity-70" />
          )}
          {isYtConnected ? "YouTube Connected" : "YouTube Pending"}
        </div>

        {/* AI Training Status Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${isAiTrained
          ? "bg-[#347AF9]/10 border-[#347AF9]/20 text-[#347AF9]"
          : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
          }`}>
          <Sparkles className={`h-4 w-4 ${isAiTrained ? "text-[#347AF9]" : "opacity-70"}`} />
          {isAiTrained ? "Model Trained" : "Untrained"}
        </div>

        {/* Credits Used Pill */}
        {isAiTrained && lastCreditsConsumed !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400 text-sm font-semibold">
            <Zap className="h-4 w-4 text-amber-500" />
            {lastCreditsConsumed} credit{lastCreditsConsumed !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </motion.div>
  )
}