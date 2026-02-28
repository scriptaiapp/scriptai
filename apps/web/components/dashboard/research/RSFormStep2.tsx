"use client"

import { motion } from "motion/react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquareText, FileDigit } from "lucide-react"

interface RSFormStep2Props {
    context: string
    setContext: (v: string) => void
    ideaCount: number
    setIdeaCount: (v: number) => void
}

export default function RSFormStep2({
    context, setContext,
    ideaCount, setIdeaCount,
}: RSFormStep2Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
        >
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 2: Refinement & Scope</h2>
                <p className="text-sm font-medium text-slate-500">Provide any final thoughts and choose how many ideas to generate.</p>
            </div>

            <div className="space-y-6">
                {/* Additional Context */}
                <div className="space-y-3">
                    <Label htmlFor="context" className="text-sm font-bold text-slate-900 dark:text-white flex justify-between items-end">
                        <span className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-brand-primary" /> Additional Context</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Optional</span>
                    </Label>
                    <Textarea
                        id="context"
                        placeholder="Specific constraints, CTA prompts, hooks to avoid..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        maxLength={1000}
                        className="min-h-[140px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-medium resize-none p-4 leading-relaxed focus-visible:bg-white dark:focus-visible:bg-[#0E1338]"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs font-medium text-slate-400">
                            Any specific direction you want the AI to consider.
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest">
                            {context.length}/1000
                        </span>
                    </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

                {/* Number of Ideas */}
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileDigit className="w-4 h-4 text-brand-primary" /> Target Output Count
                        </Label>
                        <p className="text-xs font-medium text-slate-500 mt-1">How many distinct video concepts should we generate for you?</p>
                    </div>

                    <div className="flex p-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-max">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                onClick={() => setIdeaCount(n)}
                                className={`flex-1 sm:flex-none sm:px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${ideaCount === n
                                    ? "bg-white dark:bg-[#0E1338] text-brand-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/50 scale-105"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-center"
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
