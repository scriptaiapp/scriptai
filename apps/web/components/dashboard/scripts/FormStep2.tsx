"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { motion } from "motion/react"
import { Sparkles, Timer, MessageSquare, Globe } from "lucide-react"

interface FormStep2Props {
    tone: string
    setTone: (value: string) => void
    language: string
    setLanguage: (value: string) => void
    includeStorytelling: boolean
    setIncludeStorytelling: (value: boolean) => void
    customDuration: string
    setCustomDuration: (value: string) => void
    duration: string
    setDuration: (value: string) => void
    includeTimestamps: boolean
    setIncludeTimestamps: (value: boolean) => void
}

export default function FormStep2({
    tone,
    setTone,
    language,
    setLanguage,
    includeStorytelling,
    setIncludeStorytelling,
    duration,
    setDuration,
    customDuration,
    setCustomDuration,
    includeTimestamps,
    setIncludeTimestamps
}: FormStep2Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
        >
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 2: Style & Formatting</h2>
                <p className="text-sm font-medium text-slate-500">Fine-tune how the AI writes your script.</p>
            </div>

            {/* Tone and Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label htmlFor="tone" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[#347AF9]" /> Tone
                    </Label>
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-[#347AF9]/10 focus:border-[#347AF9] transition-all text-base">
                            <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                            <SelectItem value="conversational" className="py-3 cursor-pointer">Conversational (Default)</SelectItem>
                            <SelectItem value="educational" className="py-3 cursor-pointer">Educational</SelectItem>
                            <SelectItem value="motivational" className="py-3 cursor-pointer">Motivational</SelectItem>
                            <SelectItem value="funny" className="py-3 cursor-pointer">Funny</SelectItem>
                            <SelectItem value="serious" className="py-3 cursor-pointer">Serious</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="language" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#347AF9]" /> Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-[#347AF9]/10 focus:border-[#347AF9] transition-all text-base">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                            <SelectItem value="english" className="py-3 cursor-pointer">English</SelectItem>
                            <SelectItem value="spanish" className="py-3 cursor-pointer">Spanish</SelectItem>
                            <SelectItem value="french" className="py-3 cursor-pointer">French</SelectItem>
                            <SelectItem value="german" className="py-3 cursor-pointer">German</SelectItem>
                            <SelectItem value="japanese" className="py-3 cursor-pointer">Japanese</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Video Duration Selection */}
            <div className="space-y-4">
                <div>
                    <Label className="text-sm font-bold text-slate-900 dark:text-white">Target Duration</Label>
                    <p className="text-xs font-medium text-slate-500 mt-1">Select the estimated length of your final video.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {[
                        { value: "1min", label: "~1 min" },
                        { value: "3min", label: "~3 min" },
                        { value: "5min", label: "~5 min" },
                        { value: "custom", label: "Custom" },
                    ].map((opt) => {
                        const isSelected = duration === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setDuration(opt.value)}
                                className={`
                                    px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                                    ${isSelected
                                        ? "bg-[#347AF9] text-white shadow-[0_4px_15px_rgba(52,122,249,0.25)] ring-2 ring-[#347AF9]/20 ring-offset-1 dark:ring-offset-slate-950"
                                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }
                                `}
                            >
                                {opt.label}
                            </button>
                        )
                    })}
                </div>

                {duration === 'custom' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                    >
                        <Input
                            type="text"
                            placeholder="e.g., 10:00 or 15 mins"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            className="max-w-[200px] h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-[#347AF9]/10 focus:border-[#347AF9] transition-all text-base"
                        />
                    </motion.div>
                )}
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Formatting Options (Bento Cards) */}
            <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-900 dark:text-white">Content Structure</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Storytelling Toggle Card */}
                    <div
                        onClick={() => setIncludeStorytelling(!includeStorytelling)}
                        className={`
                            relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                            ${includeStorytelling
                                ? "border-[#347AF9] bg-[#347AF9]/5 shadow-sm"
                                : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                            }
                        `}
                    >
                        <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${includeStorytelling ? "bg-[#347AF9] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pr-10">
                            <Label htmlFor="storytelling-switch" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer block mb-1">
                                Storytelling
                            </Label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Weaves a narrative hook and conflict to make the script engaging.
                            </p>
                        </div>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                            <Switch
                                id="storytelling-switch"
                                checked={includeStorytelling}
                                onCheckedChange={setIncludeStorytelling}
                                className="data-[state=checked]:bg-[#347AF9]"
                            />
                        </div>
                    </div>

                    {/* Timestamps Toggle Card */}
                    <div
                        onClick={() => setIncludeTimestamps(!includeTimestamps)}
                        className={`
                            relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                            ${includeTimestamps
                                ? "border-[#347AF9] bg-[#347AF9]/5 shadow-sm"
                                : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                            }
                        `}
                    >
                        <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${includeTimestamps ? "bg-[#347AF9] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Timer className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pr-10">
                            <Label htmlFor="timestamps-switch" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer block mb-1">
                                Timestamps
                            </Label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Adds estimated time markers for easier pacing and video editing.
                            </p>
                        </div>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                            <Switch
                                id="timestamps-switch"
                                checked={includeTimestamps}
                                onCheckedChange={setIncludeTimestamps}
                                className="data-[state=checked]:bg-[#347AF9]"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    )
}