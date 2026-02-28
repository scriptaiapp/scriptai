"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Palette, MessageSquareText, Wand2, ArrowRight } from "lucide-react"

interface SBFormStep3Props {
    tone: string
    setTone: (v: string) => void
    additionalContext: string
    setAdditionalContext: (v: string) => void
    personalized: boolean
    setPersonalized: (v: boolean) => void
    aiTrained: boolean
}

export default function SBFormStep3({
    tone, setTone,
    additionalContext, setAdditionalContext,
    personalized, setPersonalized,
    aiTrained,
}: SBFormStep3Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
        >
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 3: Style & Tone</h2>
                <p className="text-sm font-medium text-slate-500">Provide the final touches to your script generation.</p>
            </div>

            {/* Personalization Toggle Banner */}
            <div className="rounded-2xl border-2 border-brand-primary/20 bg-brand-primary/5 p-5 space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-primary shadow-sm text-white">
                            <Wand2 className="h-5 w-5" />
                        </div>
                        <div>
                            <Label htmlFor="personalized" className="text-base font-bold text-slate-900 dark:text-white mb-1 block cursor-pointer">
                                Personalize to my style
                            </Label>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                {aiTrained
                                    ? "Blueprint will map your pacing, humor, tone, and storytelling."
                                    : "Train your AI in the AI Studio to unlock personalized blueprints."}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 mt-1 sm:mt-0">
                        <Switch
                            id="personalized"
                            checked={personalized && aiTrained}
                            onCheckedChange={setPersonalized}
                            disabled={!aiTrained}
                            className="data-[state=checked]:bg-brand-primary"
                        />
                    </div>
                </div>

                {!aiTrained && (
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 p-3 mt-2">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-500">
                            Your profile is untrained.
                        </p>
                        <Link href="/dashboard/train">
                            <Button variant="outline" size="sm" className="h-8 shrink-0 text-xs gap-1 border-amber-300 dark:border-amber-800/50 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50">
                                AI Studio <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label htmlFor="tone" className="text-sm font-bold text-slate-900 dark:text-white flex justify-between items-end">
                        <span className="flex items-center gap-2"><Palette className="h-4 w-4 text-brand-primary" /> Tone Preference</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Optional</span>
                    </Label>
                    <Input
                        id="tone"
                        placeholder={personalized && aiTrained
                            ? "Leave empty for your trained tone..."
                            : "e.g., Casual, confident, energetic..."}
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-medium"
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="additionalContext" className="text-sm font-bold text-slate-900 dark:text-white flex justify-between items-end">
                        <span className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-brand-primary" /> Additional Context</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Optional</span>
                    </Label>
                    <Textarea
                        id="additionalContext"
                        placeholder="Specific constraints, CTA prompts, hooks to avoid..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-medium resize-none p-4 leading-relaxed"
                    />
                </div>

            </div>
        </motion.div>
    )
}
