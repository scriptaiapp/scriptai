"use client"
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  ArrowLeft, Loader2, Zap, Trash2, Save, Download, Plus,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter,
} from "@/components/ui/alert-dialog"

import { ScriptLoaderSkeleton } from "@/components/dashboard/scripts/skeleton/scriptLoaderSkeleton"
import { ScriptMetadata } from "@/components/dashboard/scripts/ScriptMetadata"
import { api } from "@/lib/api-client"
import { downloadBlob } from "@/lib/download"

const ScriptContentEditor = dynamic(
  () => import('@/components/dashboard/scripts/ScriptContentEditor').then(mod => mod.ScriptContentEditor),
  { ssr: false }
)

interface ScriptData {
  id: string
  title: string
  content: string
  prompt: string | null
  context: string | null
  tone: string | null
  include_storytelling: boolean
  reference_links: string | null
  language: string
  created_at: string
  updated_at: string
  include_timestamps: boolean
  duration: string
  credits_consumed: number
  status: string
}

export default function ScriptPage() {
  const router = useRouter()
  const params = useParams()
  const [script, setScript] = useState<ScriptData | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoadingScript, setIsLoadingScript] = useState(true)

  const scriptId = params.id as string

  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId) return
      setIsLoadingScript(true)
      try {
        const data = await api.get<ScriptData>(`/api/v1/script/${scriptId}`, { requireAuth: true })
        setScript(data)
        setTitle(data.title)
        setContent(data.content)
      } catch (error: unknown) {
        toast.error("Error loading script", {
          description: error instanceof Error ? error.message : "Failed to fetch script details.",
        })
        router.push("/dashboard/scripts")
      } finally {
        setIsLoadingScript(false)
      }
    }
    fetchScript()
  }, [scriptId, router])

  const handleUpdateScript = async () => {
    if (!title || !content) {
      toast.error("Missing information", { description: "Please provide a title and content." })
      return
    }
    setLoading(true)
    try {
      await api.patch(`/api/v1/script/${scriptId}`, { title, content }, { requireAuth: true })
      toast.success("Script updated!", { description: "Changes saved successfully." })
    } catch (error: unknown) {
      toast.error("Error updating script", {
        description: error instanceof Error ? error.message : "Failed to update.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteScript = async () => {
    setLoading(true)
    try {
      await api.delete(`/api/v1/script/${scriptId}`, { requireAuth: true })
      toast.success("Script deleted!")
      router.push("/dashboard/scripts")
    } catch (error: unknown) {
      toast.error("Error deleting script", {
        description: error instanceof Error ? error.message : "Failed to delete.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!scriptId) return
    try {
      const blob = await api.get<Blob>(`/api/v1/script/${scriptId}/export`, {
        requireAuth: true,
        responseType: "blob",
      })
      downloadBlob(blob, `${title || "script"}.pdf`)
      toast.success("PDF exported!")
    } catch {
      toast.error("Failed to export PDF")
    }
  }

  if (isLoadingScript) return <ScriptLoaderSkeleton />
  if (!script) return null

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

      {/* 1. Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/scripts")}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Script Details</h1>
            <p className="text-sm text-slate-500">Refine your generated content.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {script.credits_consumed > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/50">
              <Zap className="h-3.5 w-3.5" />
              {script.credits_consumed} Credit{script.credits_consumed > 1 ? "s" : ""}
            </span>
          )}
          <Link href="/dashboard/scripts/new">
            <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 font-bold rounded-xl shadow-sm transition-all">
              <Plus className="h-4 w-4 mr-2" />
              New Script
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* 2. Document Editor Area (Left Column) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0E1338] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col">

          {/* Document Toolbar */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0E1338]/50 backdrop-blur-sm rounded-t-[2rem]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Draft</span>

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
                    <AlertDialogTitle>Delete this script?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. "{script.title}" will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteScript} className="bg-red-600 hover:bg-red-700 rounded-xl text-white">
                      Delete Script
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* 3D Tactile Save Button */}
              <Button
                onClick={handleUpdateScript}
                disabled={loading}
                className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* The Actual Tiptap Editor */}
          <div className="p-8 sm:p-12">
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
        </div>

        {/* 3. Sticky Metadata Panel (Right Column) */}
        <div className="lg:col-span-4 sticky top-6">
          <ScriptMetadata script={script} />
        </div>

      </div>
    </div>
  )
}