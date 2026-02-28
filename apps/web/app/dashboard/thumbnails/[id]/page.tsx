"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    ArrowLeft, Download, Loader2, Zap, Trash2, Plus,
    Ratio, Sparkles, Clock, Link as LinkIcon, AlertCircle, RefreshCw,
    Image as ImageIcon, Settings2,
} from "lucide-react"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger, AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { getThumbnail, deleteThumbnail, type ThumbnailJob } from "@/lib/api/getThumbnails"
import { downloadFile } from "@/lib/download"
import { ThumbnailOutput } from "@/components/dashboard/thumbnails/ThumbnailOutput"

const STATUS_STYLES = {
    queued: { dot: "bg-slate-400", label: "Queued", text: "text-slate-500" },
    processing: { dot: "bg-amber-400 animate-pulse", label: "Processing", text: "text-amber-600 dark:text-amber-400" },
    completed: { dot: "bg-emerald-500", label: "Completed", text: "text-emerald-600 dark:text-emerald-400" },
    failed: { dot: "bg-red-500", label: "Failed", text: "text-red-500" },
} as const

function ThumbnailDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
            <Skeleton className="h-9 w-64 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                    <Skeleton className="h-12 rounded-2xl" />
                    <Skeleton className="h-[420px] rounded-[2rem]" />
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-[360px] rounded-[2rem]" />
                </div>
            </div>
        </div>
    )
}

export default function ThumbnailDetailPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.id as string

    const [job, setJob] = useState<ThumbnailJob | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true)
            const data = await getThumbnail(jobId)
            if (!data) {
                toast.error("Thumbnail not found")
                router.push("/dashboard/thumbnails")
                return
            }
            setJob(data)
            setIsLoading(false)
        }
        fetchJob()
    }, [jobId, router])

    const handleDownload = useCallback(
        (url: string, index: number) => downloadFile(url, `thumbnail_${index + 1}.png`),
        [],
    )

    const handleDownloadAll = () => {
        if (!job?.image_urls?.length) return
        job.image_urls.forEach((url, i) => downloadFile(url, `thumbnail_${i + 1}.png`))
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const success = await deleteThumbnail(jobId)
        if (success) {
            toast.success("Thumbnail deleted!")
            router.push("/dashboard/thumbnails")
        } else {
            toast.error("Failed to delete thumbnail")
            setIsDeleting(false)
        }
    }

    if (isLoading) return <ThumbnailDetailSkeleton />
    if (!job) return null

    const status = STATUS_STYLES[job.status] ?? STATUS_STYLES.queued
    const hasImages = job.image_urls?.length > 0

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost" size="icon"
                        onClick={() => router.push("/dashboard/thumbnails")}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Thumbnail Details</h1>
                        <p className="text-sm text-slate-500">View and download your generated thumbnails.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {job.credits_consumed > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                            <Zap className="h-3.5 w-3.5" />
                            {job.credits_consumed} Credit{job.credits_consumed > 1 ? "s" : ""}
                        </span>
                    )}
                    <Link href="/dashboard/thumbnails/new">
                        <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 font-bold rounded-xl shadow-sm transition-all">
                            <Plus className="h-4 w-4 mr-2" /> New Thumbnail
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left — Image Output */}
                <div className="lg:col-span-8 bg-white dark:bg-[#0E1338] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0E1338]/50 backdrop-blur-sm rounded-t-[2rem]">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Thumbnails</span>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${status.text}`}>{status.label}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {hasImages && (
                                <>
                                    <Button
                                        variant="ghost" size="sm"
                                        onClick={handleDownloadAll}
                                        className="h-8 px-3 text-slate-500 hover:text-[#347AF9] hover:bg-[#347AF9]/10 rounded-lg text-xs font-semibold"
                                    >
                                        <Download className="h-3.5 w-3.5 mr-1.5" /> Download All
                                    </Button>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                                </>
                            )}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost" size="sm" disabled={isDeleting}
                                        className="h-8 px-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-semibold"
                                    >
                                        {isDeleting
                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                            : <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                        }
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this thumbnail?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. All generated images will be permanently removed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl text-white">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* Error banner */}
                    {job.status === "failed" && job.error_message && (
                        <div className="mx-8 mt-6 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            {job.error_message}
                        </div>
                    )}

                    {/* Images */}
                    <div className="p-8 sm:p-10">
                        <ThumbnailOutput job={job} onDownload={handleDownload} />
                    </div>

                    {/* Footer — regenerate hint */}
                    {hasImages && (
                        <div className="px-8 sm:px-10 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 rounded-b-[2rem] flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium">
                                {job.image_urls.length} image{job.image_urls.length > 1 ? "s" : ""} · {job.ratio} · {new Date(job.created_at).toLocaleDateString()}
                            </p>
                            <Link href="/dashboard/thumbnails/new">
                                <Button
                                    size="sm"
                                    className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm rounded-xl"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Generate New
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right — Metadata */}
                <div className="lg:col-span-4 sticky top-6">
                    <div className="bg-white dark:bg-[#0E1338] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 overflow-hidden">

                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0E1338]/50">
                            <div className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-[#347AF9]" />
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">Generation Details</h2>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Parameters used by the AI.</p>
                        </div>

                        <div className="p-6 space-y-5">

                            {/* Stat bento */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#347AF9]/30 transition-colors group">
                                    <Ratio className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Ratio</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{job.ratio}</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#347AF9]/30 transition-colors group">
                                    <ImageIcon className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Count</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{job.generate_count} images</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#347AF9]/30 transition-colors group">
                                    <Sparkles className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Credits</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {job.credits_consumed > 0 ? job.credits_consumed : "—"}
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#347AF9]/30 transition-colors group">
                                    <Clock className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Created</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Accordions */}
                            <Accordion type="multiple" className="w-full space-y-3">
                                <AccordionItem value="prompt" className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden px-4">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                                <Sparkles className="h-4 w-4 text-[#347AF9]" />
                                            </div>
                                            <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">Prompt</strong>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed">
                                        {job.prompt}
                                    </AccordionContent>
                                </AccordionItem>

                                {job.video_link && (
                                    <AccordionItem value="video" className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden px-4">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                                    <LinkIcon className="h-4 w-4 text-[#347AF9]" />
                                                </div>
                                                <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">Video Link</strong>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4">
                                            <a
                                                href={job.video_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#347AF9] hover:underline break-all"
                                            >
                                                {job.video_link}
                                            </a>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {(job.reference_image_url || job.face_image_url) && (
                                    <AccordionItem value="refs" className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden px-4">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                                    <ImageIcon className="h-4 w-4 text-[#347AF9]" />
                                                </div>
                                                <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">Reference Images</strong>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4 space-y-3">
                                            {job.reference_image_url && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Style Reference</p>
                                                    <img src={job.reference_image_url} alt="Reference" className="w-full rounded-xl object-cover max-h-32" />
                                                </div>
                                            )}
                                            {job.face_image_url && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Face Reference</p>
                                                    <img src={job.face_image_url} alt="Face reference" className="w-full rounded-xl object-cover max-h-32" />
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
