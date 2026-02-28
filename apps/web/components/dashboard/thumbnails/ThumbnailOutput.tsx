"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Eye, ImageIcon } from "lucide-react"
import type { ThumbnailJob } from "@/hooks/useThumbnailGeneration"

const RATIO_ASPECT: Record<string, string> = {
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
}

const COL_CLASS: Record<number, string> = {
    1: "grid-cols-1 max-w-2xl mx-auto",
    2: "grid-cols-1 sm:grid-cols-2",
}

interface ThumbnailOutputProps {
    job: ThumbnailJob
    onDownload: (url: string, index: number) => void
}

export function ThumbnailOutput({ job, onDownload }: ThumbnailOutputProps) {
    const aspect = RATIO_ASPECT[job.ratio] ?? "aspect-video"

    if (!job.image_urls?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Eye className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-lg font-semibold text-slate-400 dark:text-slate-500">No images yet</p>
                <p className="text-sm text-slate-400 mt-1">
                    {job.status === "queued" || job.status === "processing"
                        ? "Thumbnails are being generated..."
                        : "Generation did not produce any images."}
                </p>
            </div>
        )
    }

    const colClass = COL_CLASS[job.image_urls.length] ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

    return (
        <div className={`grid ${colClass} gap-5`}>
            {job.image_urls.map((url, i) => (
                <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow"
                >
                    {/* Image */}
                    <div className={`${aspect} relative`}>

                        <Image
                            src={url}
                            alt={`Thumbnail variation ${i + 1}`}
                            fill
                            className="object-cover"

                        />


                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-end justify-end p-3 gap-1.5">
                            <Button
                                size="icon"
                                variant="secondary"
                                title="Download"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm"
                                onClick={() => onDownload(url, i)}
                            >
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="secondary"
                                title="Open full size"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm"
                                onClick={() => window.open(url, "_blank")}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>


                    <div className="px-4 py-2.5 flex items-center gap-2 bg-white dark:bg-[#0E1338]">
                        <ImageIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Variation {i + 1}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
