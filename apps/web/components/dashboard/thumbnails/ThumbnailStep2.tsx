"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { motion } from "motion/react"
import { Link2, LayoutTemplate, Sparkles } from "lucide-react"
import type { ThumbnailRatio } from "@/hooks/useThumbnailGeneration"

const ratioOptions: { value: ThumbnailRatio; label: string; desc: string }[] = [
  { value: "16:9", label: "16:9", desc: "YouTube Standard" },
  { value: "9:16", label: "9:16", desc: "Shorts / Stories" },
  { value: "1:1", label: "1:1", desc: "Square" },
  { value: "4:3", label: "4:3", desc: "Classic" },
]

interface ThumbnailStep2Props {
  ratio: ThumbnailRatio
  setRatio: (v: ThumbnailRatio) => void
  videoLink: string
  setVideoLink: (v: string) => void
}

export default function ThumbnailStep2({
  ratio,
  setRatio,
  videoLink,
  setVideoLink,
}: ThumbnailStep2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 2: Ratio & Context</h2>
        <p className="text-sm font-medium text-slate-500">Configure the format and optionally link your video.</p>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand-primary" /> Aspect Ratio
          </Label>
          <p className="text-xs font-medium text-slate-500 mt-1">Select the target aspect ratio for your thumbnail.</p>
        </div>

        {/* ratio pill buttons — same pattern as duration pills in FormStep2 */}
        <div className="flex flex-wrap items-center gap-3">
          {ratioOptions.map((opt) => {
            const isSelected = ratio === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRatio(opt.value)}
                className={`
                  px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                  ${isSelected
                    ? "bg-brand-primary text-white shadow-[0_4px_15px_rgba(52,122,249,0.25)] ring-2 ring-brand-primary/20 ring-offset-1 dark:ring-offset-slate-950"
                    : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }
                `}
              >
                {opt.label}
                <span className="ml-1.5 text-xs opacity-70 hidden sm:inline">{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

      {/* Video Link */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Link2 className="h-4 w-4 text-brand-primary" /> YouTube / Google Drive Link
          </Label>
          <p className="text-xs font-medium text-slate-500 mt-1">Provide a video link for context-aware thumbnail generation.</p>
        </div>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 bg-slate-200/50 dark:bg-slate-800 rounded-md">
            <Link2 className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <Input
            id="videoLink"
            placeholder="https://youtube.com/watch?v=..."
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="h-12 pl-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-base"
          />
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

      {/* Personalization Info — bento card like FormStep2 toggle cards */}
      <div
        className="relative flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-transparent"
      >
        <div className="p-2.5 rounded-xl shrink-0 bg-brand-primary text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <Label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">
            Personalized to your style
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            If AI Studio training is complete, thumbnails will automatically match your channel's visual identity and past thumbnail style.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
