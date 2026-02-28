"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { useSupabase } from "@/components/supabase-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

import { useStoryBuilder } from "@/hooks/useStoryBuilder"
import { StoryBuilderForm } from "@/components/dashboard/story-builder/StoryBuilderForm"
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired"

export default function NewStoryBuilderPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { profile, profileLoading } = useSupabase()

    const hook = useStoryBuilder()

    useEffect(() => {
        const topic = searchParams.get("topic")
        if (topic && !hook.videoTopic) hook.setVideoTopic(topic)
    }, [searchParams])

    if (profileLoading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-80" />
                <Skeleton className="h-[600px] rounded-[2rem] mt-6" />
            </div>
        )
    }

    const showTrainingOverlay = !profile?.youtube_connected || !profile?.ai_trained

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

            {/* Page Header */}
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
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Story Builder</h1>
                        <p className="text-sm text-slate-500">Build modular story blueprints with structured hooks and tension mapping.</p>
                    </div>
                </div>
            </div>

            {showTrainingOverlay ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AITrainingRequired />
                </motion.div>
            ) : (
                <StoryBuilderForm
                    {...hook}
                    onGenerate={hook.handleGenerate}
                    onRegenerate={hook.handleRegenerate}
                    onSelectIdea={hook.handleSelectIdea}
                />
            )}
        </div>
    )
}
