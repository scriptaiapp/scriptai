"use client"

import { motion } from "motion/react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Search, Zap, Lightbulb, TrendingUp, Target } from "lucide-react"

interface RSFormStep1Props {
    autoMode: boolean
    setAutoMode: (v: boolean) => void
    nicheFocus: string
    setNicheFocus: (v: string) => void
    nicheError: string | null
}

const NICHE_PRESETS = [
    {
        id: "ai-tools",
        icon: Lightbulb,
        label: "AI & Tech",
        niche: "AI tools for small business owners",
    },
    {
        id: "travel",
        icon: TrendingUp,
        label: "Travel & Lifestyle",
        niche: "Budget travel hacks for solo travelers",
    },
    {
        id: "fitness",
        icon: Target,
        label: "Health & Fitness",
        niche: "Home workouts for busy professionals",
    },
]

export default function RSFormStep1({
    autoMode, setAutoMode,
    nicheFocus, setNicheFocus,
    nicheError,
}: RSFormStep1Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div>
                <div className="flex items-center gap-2.5 mb-6">
                    <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                        <Search className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Configure Your Search
                    </h2>
                </div>

                {/* Auto-Mode toggle card */}
                <div
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${autoMode
                        ? "border-brand-primary bg-brand-primary/5 shadow-sm ring-2 ring-brand-primary/10"
                        : "border-slate-100 dark:border-slate-800 hover:border-brand-primary/30 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                >
                    <div className="pr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Label className="text-base font-bold text-slate-900 dark:text-white cursor-pointer" onClick={() => setAutoMode(!autoMode)}>
                                Auto Mode
                            </Label>
                            {autoMode && (
                                <Zap className="h-4 w-4 text-brand-primary animate-pulse" />
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            AI picks the best topics based on your channel intelligence and current market trends.
                        </p>
                    </div>
                    <Switch
                        checked={autoMode}
                        onCheckedChange={setAutoMode}
                        className="data-[state=checked]:bg-brand-primary shrink-0"
                    />
                </div>
            </div>

            {!autoMode && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                >
                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

                    {/* Quick-template cards */}
                    <div className="space-y-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Quick Templates
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {NICHE_PRESETS.map((p) => {
                                const isSelected = nicheFocus === p.niche
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setNicheFocus(p.niche)}
                                        className={`
                      text-left p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-2 group
                      ${isSelected
                                                ? "border-brand-primary bg-brand-primary/5 shadow-sm ring-2 ring-brand-primary/10"
                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                                            }
                    `}
                                    >
                                        <div
                                            className={`p-2.5 w-max rounded-xl transition-colors ${isSelected
                                                ? "bg-brand-primary text-white shadow-sm"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                                }`}
                                        >
                                            <p.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span
                                                className={`font-bold text-sm block mb-1 ${isSelected
                                                    ? "text-brand-primary"
                                                    : "text-slate-900 dark:text-slate-100"
                                                    }`}
                                            >
                                                {p.label}
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {p.niche}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Niche focus input */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-end">
                            <Label
                                htmlFor="nicheFocus"
                                className="text-sm font-bold text-slate-900 dark:text-white"
                            >
                                Niche Focus <span className="text-red-500">*</span>
                            </Label>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                Required
                            </span>
                        </div>
                        <Input
                            id="nicheFocus"
                            placeholder="e.g., AI tools for developers, personal finance for millennials..."
                            value={nicheFocus}
                            onChange={(e) => setNicheFocus(e.target.value)}
                            maxLength={200}
                            className={`h-14 text-base px-4 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:bg-white dark:focus-visible:bg-[#0E1338] focus-visible:ring-4 focus-visible:ring-brand-primary/10 focus-visible:border-brand-primary rounded-xl transition-all font-medium ${nicheError ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10" : ""}`}
                        />
                        {nicheError ? (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs font-bold mt-1"
                            >
                                {nicheError}
                            </motion.p>
                        ) : (
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs font-medium text-slate-400">
                                    Target subject for generation.
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 tracking-widest">
                                    {nicheFocus.length}/200
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
