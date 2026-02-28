"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Save, Loader2, Eye, ExternalLink, Zap } from "lucide-react"
import { toast } from "sonner"

const ScriptContentEditor = dynamic(
    () => import("./ScriptContentEditor").then(mod => mod.ScriptContentEditor),
    { ssr: false }
)

interface ReviewStepProps {
    title: string
    setTitle: (v: string) => void
    content: string
    setContent: (v: string) => void
    scriptId: string | null
    creditsConsumed: number
    isSaving: boolean
    onSave: () => void
    onExport: () => void
}

export default function ReviewStep({
    title,
    setTitle,
    content,
    setContent,
    scriptId,
    creditsConsumed,
    isSaving,
    onSave,
    onExport,
}: ReviewStepProps) {
    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Eye className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-lg font-semibold text-slate-400 dark:text-slate-500">Nothing to review yet</p>
                <p className="text-sm text-slate-400 mt-1">Go back and generate a script first.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-8 py-4 -mx-8 sm:-mx-10 -mt-8 sm:-mt-10 mb-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0E1338]/50 backdrop-blur-sm rounded-t-[2rem]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Draft</span>
                <div className="flex items-center gap-2">
                    {creditsConsumed > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-900/50">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                {creditsConsumed} Credit{creditsConsumed > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                    {scriptId && (
                        <Link href={`/dashboard/scripts/${scriptId}`}>
                            <Button
                                variant="ghost" size="sm"
                                className="h-8 px-3 text-slate-500 hover:text-[#347AF9] hover:bg-[#347AF9]/10 rounded-lg text-xs font-semibold"
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open Editor
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="ghost" size="sm" onClick={onExport}
                        className="h-8 px-3 text-slate-500 hover:text-[#347AF9] hover:bg-[#347AF9]/10 rounded-lg text-xs font-semibold"
                    >
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                    </Button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <Button
                        size="sm" onClick={onSave} disabled={isSaving}
                        className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm rounded-xl"
                    >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <ScriptContentEditor
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                onCopyTitle={() => {
                    navigator.clipboard.writeText(title)
                    toast.success("Title copied!")
                }}
                onCopyScript={() => {
                    navigator.clipboard.writeText(content)
                    toast.success("Script copied!")
                }}
            />
        </div>
    )
}
