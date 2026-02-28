"use client"

import { Textarea } from "@/components/ui/textarea"
import { MonitorPlay, BookOpen, ListOrdered } from "lucide-react"
import { motion } from "motion/react"

const PRESET_PROMPTS = [
  {
    id: "tech",
    icon: MonitorPlay,
    label: "Tech Tutorial",
    prompt:
      "A step-by-step tutorial on building a REST API with Node.js and Express, targeting beginner developers who want to learn backend development",
  },
  {
    id: "review",
    icon: BookOpen,
    label: "Product Review",
    prompt:
      "An honest, in-depth review of the latest MacBook Pro comparing it with the previous generation, covering performance, battery life, and value for money",
  },
  {
    id: "list",
    icon: ListOrdered,
    label: "Top 10 List",
    prompt:
      "Top 10 productivity apps every student needs in 2026, with quick demos and tips for getting the most out of each one",
  },
]

interface FormStep1Props {
  prompt: string
  setPrompt: (value: string) => void
  context: string
  setContext: (value: string) => void
  promptError: string | null
}

export default function FormStep1({
  prompt,
  setPrompt,
  context,
  setContext,
  promptError,
}: FormStep1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Step 1: What's the core idea?</h2>

        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Templates</span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRESET_PROMPTS.map((p) => {

              const isSelected = prompt === p.prompt;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrompt(p.prompt)}
                  className={`
                    text-left p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-2 group
                    ${isSelected
                      ? "border-[#347AF9] bg-[#347AF9]/5 shadow-sm ring-2 ring-[#347AF9]/10"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                    }
                  `}
                >
                  <div className={`p-2.5 w-max rounded-xl transition-colors ${isSelected ? "bg-[#347AF9] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}>
                    <p.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className={`font-bold text-sm block mb-1 ${isSelected ? "text-[#347AF9]" : "text-slate-900 dark:text-slate-100"}`}>
                      {p.label}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.prompt}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <div className="space-y-2.5">
          <div className="flex justify-between items-end">
            <label htmlFor="prompt" className="text-sm font-bold text-slate-900 dark:text-white">
              Prompt <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required</span>
          </div>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A step-by-step tutorial on building a REST API..."
            className={`
              min-h-[140px] text-base p-4 bg-slate-50 dark:bg-slate-900/50 
              focus:bg-white dark:focus:bg-slate-950 focus:border-[#347AF9] focus:ring-4 focus:ring-[#347AF9]/10 
              rounded-xl resize-none transition-all leading-relaxed
              ${promptError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800"}
            `}
          />
          {promptError ? (
            <motion.p
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs font-semibold"
            >
              {promptError}
            </motion.p>
          ) : (
            <p className="text-xs font-medium text-slate-400">
              Be specific about the topic, angle, and target audience.
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-end">
            <label htmlFor="context" className="text-sm font-bold text-slate-900 dark:text-white">
              Additional Context
            </label>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Optional</span>
          </div>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Mention benefits for students and developers, keep the intro under 10 seconds..."
            className="min-h-[100px] text-base p-4 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:border-[#347AF9] focus:ring-4 focus:ring-[#347AF9]/10 rounded-xl resize-none transition-all leading-relaxed"
          />
        </div>
      </div>
    </motion.div>
  )
}