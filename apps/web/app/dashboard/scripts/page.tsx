"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import { Plus, Search } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { ContentCard } from "@/components/dashboard/common/ContentCard"
import ContentCardSkeleton from "@/components/dashboard/common/skeleton/ContentCardSkeleton"
import { EmptySvg } from "@/components/dashboard/common/EmptySvg"
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired"
import { getScripts, deleteScript, Script } from "@/lib/api/getScripts"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
        },
    },
}

const emptyStateVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4 },
    },
}

export default function Scripts() {
    const { profile, profileLoading } = useSupabase()
    const [scripts, setScripts] = useState<Script[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [scriptToDelete, setScriptToDelete] = useState<string | null>(null)

    useEffect(() => {
        const fetchScripts = async () => {
            setLoading(true)
            const fetchedScripts = await getScripts()
            setScripts(fetchedScripts)
            setLoading(false)
        }

        fetchScripts()
    }, [])

    const handleDeleteScript = async () => {
        if (!scriptToDelete) return

        const success = await deleteScript(scriptToDelete)

        if (success) {
            setScripts(scripts.filter((script) => script.id !== scriptToDelete))
            toast.success("Script deleted", {
                description: "Your script has been deleted successfully.",
            })
        } else {
            toast.error("Error deleting script", {
                description: "Could not delete the script. Please try again.",
            })
        }
        setScriptToDelete(null)
    }

    const handleExportScript = async (scriptId: string) => {
        if (!scriptId) return

        try {
            const response = await fetch(`/api/scripts/${scriptId}/export`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/pdf",
                },
            })

            if (!response.ok) throw new Error("Failed to export script")

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")

            a.href = url
            a.download = `script-${scriptId}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url) // Clean up the object URL
        } catch (error: any) {
            toast.error("Error exporting script", {
                description: error.message,
            })
        }
    }

    if (profileLoading || loading) {
        return <ContentCardSkeleton />
    }

    const showTrainingOverlay = !profile?.youtube_connected || !profile?.ai_trained

    const filteredScripts: Script[] = scripts.filter((script: Script) =>
        script.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <motion.div
                className="container py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Scripts</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage all your generated scripts
                        </p>
                    </div>
                    {!showTrainingOverlay && (
                        <Link href="/dashboard/scripts/new">
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white transition-all hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10">
                                <Plus className="mr-2 h-4 w-4" />
                                New Script
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                        <Input
                            placeholder="Search scripts..."
                            className="pl-10 focus-visible:ring-2 focus-visible:ring-purple-500/80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {showTrainingOverlay ? (
                        <motion.div
                            key="training-required"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <AITrainingRequired />
                        </motion.div>
                    ) : filteredScripts.length > 0 ? (
                        <motion.div
                            key="script-list"
                            className="grid grid-cols-1 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredScripts.map((script) => (
                                <ContentCard
                                    key={script.id}
                                    id={script.id}
                                    title={script.title}
                                    created_at={script.created_at}
                                    onDelete={handleDeleteScript}
                                    setToDelete={setScriptToDelete}
                                    onExport={handleExportScript}
                                    type="scripts"
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty-state-illustrated"
                            variants={emptyStateVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="text-center py-16">
                                <div className="flex flex-col items-center">
                                    <EmptySvg className="h-32 w-auto mb-6 text-slate-300 dark:text-slate-700" />
                                    <h3 className="font-semibold text-xl text-slate-800 dark:text-slate-200 mb-2">
                                        Start your first masterpiece
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                        {searchQuery
                                            ? `We couldn't find a script matching "${searchQuery}".`
                                            : "Every great story starts with a blank page. Create a new script to begin."}
                                    </p>
                                    {!searchQuery && (
                                        <Link href="/dashboard/scripts/new">
                                            <Button className="bg-slate-900 hover:bg-slate-800 text-white transition-all">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Script
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    )
}