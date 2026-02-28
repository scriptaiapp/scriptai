"use client"

import { motion } from "motion/react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Clock, GraduationCap, Users } from "lucide-react"

import {
    VIDEO_DURATIONS,
    VIDEO_DURATION_LABELS,
    AUDIENCE_LEVELS,
    AUDIENCE_LEVEL_LABELS,
    type VideoDuration,
    type AudienceLevel,
} from "@repo/validation"

interface SBFormStep2Props {
    videoDuration: VideoDuration
    setVideoDuration: (v: VideoDuration) => void
    audienceLevel: AudienceLevel
    setAudienceLevel: (v: AudienceLevel) => void
    targetAudience: string
    setTargetAudience: (v: string) => void
}

export default function SBFormStep2({
    videoDuration, setVideoDuration,
    audienceLevel, setAudienceLevel,
    targetAudience, setTargetAudience,
}: SBFormStep2Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
        >
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 2: Audience & Duration</h2>
                <p className="text-sm font-medium text-slate-500">How long is it, and who is it for?</p>
            </div>

            {/* Target Duration Selection */}
            <div className="space-y-4">
                <div>
                    <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-primary" /> Target Duration
                    </Label>
                    <p className="text-xs font-medium text-slate-500 mt-1">Select the estimated length of your final video.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {VIDEO_DURATIONS.map((vd) => {
                        const isSelected = videoDuration === vd
                        return (
                            <button
                                key={vd}
                                type="button"
                                onClick={() => setVideoDuration(vd)}
                                className={`
                  px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                  ${isSelected
                                        ? "bg-brand-primary text-white shadow-[0_4px_15px_rgba(52,122,249,0.3)] ring-2 ring-brand-primary/20 ring-offset-1 dark:ring-offset-[#0E1338]"
                                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                                    }
                `}
                            >
                                {VIDEO_DURATION_LABELS[vd]}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Audience Strategy Selection */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="audienceLevel" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-brand-primary" /> Audience Level
                        </Label>
                        <Select value={audienceLevel} onValueChange={(v) => setAudienceLevel(v as AudienceLevel)}>
                            <SelectTrigger id="audienceLevel" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                                {AUDIENCE_LEVELS.map((al) => (
                                    <SelectItem key={al} value={al} className="py-3 font-semibold cursor-pointer">
                                        {AUDIENCE_LEVEL_LABELS[al]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="targetAudience" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="h-4 w-4 text-brand-primary" /> Target Audience <span className="text-[10px] uppercase font-semibold text-slate-400">Optional</span>
                        </Label>
                        <Input
                            id="targetAudience"
                            placeholder="e.g., Beginners, 18-30 yrs old..."
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
