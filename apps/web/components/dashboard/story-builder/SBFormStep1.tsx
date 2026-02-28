"use client"

import { motion } from "motion/react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Clapperboard, Film, TrendingUp, Compass, Zap } from "lucide-react"

import {
    CONTENT_TYPES,
    CONTENT_TYPE_LABELS,
    STORY_MODES,
    STORY_MODE_LABELS,
    type ContentType,
    type StoryMode,
} from "@repo/validation"
import type { IdeationJob } from "@repo/validation"

interface SBFormStep1Props {
    videoTopic: string
    setVideoTopic: (v: string) => void
    contentType: ContentType
    setContentType: (v: ContentType) => void
    storyMode: StoryMode
    setStoryMode: (v: StoryMode) => void
    ideationJobs: IdeationJob[]
    isLoadingIdeations: boolean
    onSelectIdea: (ideationId: string, ideaIndex: number, ideaTitle: string) => void
    selectedIdeationId?: string
    selectedIdeaIndex?: number
    topicError: string | null
}

const STORY_MODE_DESCRIPTIONS: Record<StoryMode, string> = {
    cinematic: "Dramatic visuals, epic tone",
    high_energy: "Fast cuts, bold statements",
    documentary: "Facts-first, authoritative",
    conversational: "Casual, relatable",
    dramatic: "Tension-heavy, suspenseful",
    minimal: "Clean, essential info only",
}

const PRESET_PROMPTS = [
    {
        id: "case-study",
        icon: TrendingUp,
        label: "Case Study",
        prompt: "The rise and fall of Blockbuster, explaining the business decisions that led to its bankruptcy and what modern startups can learn from it.",
    },
    {
        id: "epic-challenge",
        icon: Compass,
        label: "Epic Challenge",
        prompt: "Surviving 50 hours in the Sahara Desert with only a bottle of water, focusing on the mental and physical toll.",
    },
    {
        id: "deep-dive",
        icon: Zap,
        label: "Deep Dive",
        prompt: "How the YouTube algorithm actually works in 2026, breaking down the technical details for creators who want to maximize their reach.",
    },
]

export default function SBFormStep1({
    videoTopic, setVideoTopic,
    contentType, setContentType,
    storyMode, setStoryMode,
    ideationJobs, isLoadingIdeations, onSelectIdea,
    selectedIdeationId, selectedIdeaIndex,
    topicError,
}: SBFormStep1Props) {
    const allIdeas = ideationJobs.flatMap(job =>
        (job.result?.ideas || []).map((idea, idx) => ({
            ideationId: job.id,
            ideaIndex: idx,
            title: idea.title,
            format: idea.suggestedFormat,
            score: idea.opportunityScore,
        }))
    )

    const selectedIdeaKey = selectedIdeationId && selectedIdeaIndex != null
        ? `${selectedIdeationId}::${selectedIdeaIndex}`
        : undefined

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Step 1: Core Idea & Structure</h2>

                <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Templates</span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {PRESET_PROMPTS.map((p) => {
                            const isSelected = videoTopic === p.prompt;

                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setVideoTopic(p.prompt)}
                                    className={`
                                        text-left p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-2 group
                                        ${isSelected
                                            ? "border-brand-primary bg-brand-primary/5 shadow-sm ring-2 ring-brand-primary/10"
                                            : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                                        }
                                    `}
                                >
                                    <div className={`p-2.5 w-max rounded-xl transition-colors ${isSelected ? "bg-brand-primary text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}>
                                        <p.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className={`font-bold text-sm block mb-1 ${isSelected ? "text-brand-primary" : "text-slate-900 dark:text-slate-100"}`}>
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

                {allIdeas.length > 0 && (
                    <div className="space-y-3 mb-8">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5 hover:text-brand-primary transition-colors">
                            <Lightbulb className="h-4 w-4" /> Pick from AI Ideas
                        </span>
                        <Select
                            value={selectedIdeaKey || "custom"}
                            onValueChange={(v) => {
                                if (v === "custom") {
                                    setVideoTopic("")
                                    return
                                }
                                const [ideationId, indexStr] = v.split("::")
                                const idea = allIdeas.find(i => i.ideationId === ideationId && i.ideaIndex === Number(indexStr))
                                if (idea) onSelectIdea(idea.ideationId, idea.ideaIndex, idea.title)
                            }}
                        >
                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-semibold">
                                <SelectValue placeholder="Type your own or select an idea..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                                <SelectItem value="custom" className="py-3 font-medium cursor-pointer">
                                    <span className="text-brand-primary">Custom Idea...</span>
                                </SelectItem>
                                {allIdeas.map((idea) => (
                                    <SelectItem key={`${idea.ideationId}::${idea.ideaIndex}`} value={`${idea.ideationId}::${idea.ideaIndex}`} className="py-3 cursor-pointer items-start">
                                        <div className="flex flex-col gap-1 pr-6">
                                            <span className="font-semibold text-sm line-clamp-1">{idea.title}</span>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 border-none px-1.5 py-0">Score: {idea.score}/100</Badge>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2.5">
                    <div className="flex justify-between items-end">
                        <label htmlFor="videoTopic" className="text-sm font-bold text-slate-900 dark:text-white">
                            Video Topic <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required</span>
                    </div>
                    <Textarea
                        id="videoTopic"
                        value={videoTopic}
                        onChange={(e) => setVideoTopic(e.target.value)}
                        placeholder="e.g., How I survived 50 hours in Antarctica..."
                        className={`
              min-h-[120px] text-base p-4 bg-slate-50 dark:bg-slate-900/50 
              focus:bg-white dark:focus:bg-[#0E1338] focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 
              rounded-xl resize-none transition-all leading-relaxed font-medium
              ${topicError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800"}
            `}
                    />
                    {topicError ? (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs font-bold mt-1"
                        >
                            {topicError}
                        </motion.p>
                    ) : (
                        <p className="text-xs font-medium text-slate-400">
                            The core concept. We'll generate a modular blueprint around this.
                        </p>
                    )}
                </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label htmlFor="contentType" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Film className="h-4 w-4 text-brand-primary" /> Structure Template
                    </Label>
                    <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                        <SelectTrigger id="contentType" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                            {CONTENT_TYPES.map((ct) => (
                                <SelectItem key={ct} value={ct} className="py-3 font-semibold cursor-pointer">
                                    {CONTENT_TYPE_LABELS[ct]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="storyMode" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clapperboard className="h-4 w-4 text-brand-primary" /> Story Mode
                    </Label>
                    <Select value={storyMode} onValueChange={(v) => setStoryMode(v as StoryMode)}>
                        <SelectTrigger id="storyMode" className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl max-h-[250px]">
                            {STORY_MODES.map((sm) => (
                                <SelectItem key={sm} value={sm} className="py-2.5 cursor-pointer">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm tracking-tight">{STORY_MODE_LABELS[sm]}</span>
                                        <span className="text-[10px] font-medium text-slate-400 leading-tight">
                                            {STORY_MODE_DESCRIPTIONS[sm]}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </motion.div>
    )
}
