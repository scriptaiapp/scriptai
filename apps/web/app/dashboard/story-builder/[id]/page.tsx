"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, Zap, Trash2, Download, Plus, Loader2 } from "lucide-react"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter,
} from "@/components/ui/alert-dialog"

import { api } from "@/lib/api-client"
import { downloadBlob } from "@/lib/download"
import type { StoryBuilderJob } from "@/hooks/useStoryBuilder"
import { StoryBuilderResults } from "@/components/dashboard/story-builder/StoryBuilderResults"
import { ScriptLoaderSkeleton } from "@/components/dashboard/scripts/skeleton/scriptLoaderSkeleton"
import { Badge } from "@/components/ui/badge"

export default function StoryBuilderDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const [job, setJob] = useState<StoryBuilderJob | null>(null)
    const [loading, setLoading] = useState(false)
    const [isLoadingJob, setIsLoadingJob] = useState(true)

    const jobId = params.id as string

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return
            setIsLoadingJob(true)
            try {
                const data = await api.get<StoryBuilderJob>(`/api/v1/story-builder/${jobId}`, { requireAuth: true })
                setJob(data)
            } catch (error: unknown) {
                toast.error("Error loading story builder", {
                    description: error instanceof Error ? error.message : "Failed to fetch details.",
                })
                router.push("/dashboard/story-builder")
            } finally {
                setIsLoadingJob(false)
            }
        }
        fetchJob()
    }, [jobId, router])

    const handleDeleteJob = async () => {
        setLoading(true)
        try {
            await api.delete(`/api/v1/story-builder/${jobId}`, { requireAuth: true })
            toast.success("Story Builder deleted!")
            router.push("/dashboard/story-builder")
        } catch (error: unknown) {
            toast.error("Error deleting story builder", {
                description: error instanceof Error ? error.message : "Failed to delete.",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        if (!jobId) return
        try {
            const blob = await api.get<Blob>(`/api/v1/story-builder/${jobId}/export`, {
                requireAuth: true,
                responseType: "blob",
            })
            downloadBlob(blob, `${job?.video_topic || "story-builder"}.pdf`)
            toast.success("PDF exported!")
        } catch {
            toast.error("Failed to export PDF")
        }
    }

    const handleRegenerate = () => {
        if (!job) return
        router.push(`/dashboard/story-builder/new?topic=${encodeURIComponent(job.video_topic)}`)
    }

    if (isLoadingJob) return <ScriptLoaderSkeleton />
    if (!job) return null

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

            {/* 1. Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/story-builder")}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Story Builder Details</h1>
                        <p className="text-sm text-slate-500">{job.video_topic}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {job.credits_consumed > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                            <Zap className="h-3.5 w-3.5" />
                            {job.credits_consumed} Credit{job.credits_consumed > 1 ? "s" : ""}
                        </span>
                    )}
                    <Link href="/dashboard/story-builder/new">
                        <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 font-bold rounded-xl shadow-sm transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            New Story Builder
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* 2. Main content Area (Left Column) */}
                <div className="lg:col-span-8 bg-white dark:bg-[#0E1338] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">

                    {/* Document Toolbar */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0E1338]/50 backdrop-blur-sm rounded-t-[2rem]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Story Blueprint</span>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleExport}
                                title="Export PDF"
                                className="h-8 px-3 text-slate-500 hover:text-[#347AF9] hover:bg-[#347AF9]/10 rounded-lg text-xs font-semibold"
                            >
                                <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={loading}
                                        className="h-8 px-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-semibold"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this story builder?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. "{job.video_topic}" will be permanently removed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700 rounded-xl text-white">
                                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                                            Delete Builder
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 max-h-[1000px] overflow-y-auto">
                        {job.result ? (
                            <StoryBuilderResults
                                result={job.result}
                                onRegenerate={handleRegenerate}
                                isGenerating={false}
                            />
                        ) : (
                            <div className="flex items-center justify-center p-8 text-slate-500">
                                {job.status === 'processing' ? 'Processing...' : job.status === 'queued' ? 'Queued...' : job.status === 'failed' ? `Failed: ${job.error_message}` : 'No result found.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Sticky Metadata Panel (Right Column) */}
                <div className="lg:col-span-4 sticky top-6">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Blueprint Configuration</h3>
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="text-slate-500 dark:text-slate-400 mb-1">Topic</dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">{job.video_topic}</dd>
                                </div>
                                {job.target_audience && (
                                    <div>
                                        <dt className="text-slate-500 dark:text-slate-400 mb-1">Target Audience</dt>
                                        <dd className="font-medium text-slate-900 dark:text-slate-100">{job.target_audience}</dd>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <dt className="text-slate-500 dark:text-slate-400 mb-1">Status</dt>
                                        <dd>
                                            <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'} className="capitalize">
                                                {job.status}
                                            </Badge>
                                        </dd>
                                    </div>
                                    <div className="flex-1">
                                        <dt className="text-slate-500 dark:text-slate-400 mb-1">Date</dt>
                                        <dd className="font-medium text-slate-900 dark:text-slate-100">{new Date(job.created_at).toLocaleDateString()}</dd>
                                    </div>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
