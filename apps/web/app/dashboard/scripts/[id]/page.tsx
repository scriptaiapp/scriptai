"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { BookText, Hash, Languages, LinkIcon, Loader2, Smile, Sparkles } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog"
import ScriptEditor from "@/components/dashboard/scripts/ScriptEditor"
import { ScriptLoaderSkeleton } from "@/components/dashboard/scripts/skeleton/scriptLoaderSkeleton"

interface Script {
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
}

export default function ScriptPage() {
  const router = useRouter()
  const params = useParams()
  const [script, setScript] = useState<Script | null>(null)
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
        const response = await fetch(`/api/scripts/${scriptId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to fetch script")
        }

        const data: Script = await response.json()
        setScript(data)
        setTitle(data.title)
        setContent(data.content)
      } catch (error: any) {
        toast.error("Error loading script", {
          description: error.message || "Failed to fetch script details.",
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
      toast.error("Missing information", {
        description: "Please provide a title and content for the script.",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update script")
      }

      toast.success("Script updated!", {
        description: "Your script changes have been saved successfully.",
      })
    } catch (error: any) {
      toast.error("Error updating script", {
        description: error.message || "Failed to update script.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteScript = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete script")
      }

      toast.success("Script deleted!", {
        description: "The script has been successfully deleted.",
      })
      router.push("/dashboard/scripts")
    } catch (error: any) {
      toast.error("Error deleting script", {
        description: error.message || "Failed to delete script.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingScript) {
    return (
      <ScriptLoaderSkeleton />
    )
  }

  if (!script) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Script Details</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">View and edit your YouTube video script</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">

        {/* Main content column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Script Content</CardTitle>
              <CardDescription>Modify the title and the main content of your script.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScriptEditor
                script={content}
                setScript={setContent}
                title={title}
                size="400"
                setTitle={setTitle}
                animation={false}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30 hover:border-red-500/50 transition-all focus-visible:ring-2 focus-visible:ring-red-500" disabled={loading}>
                    Delete Script
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the script "{script.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteScript} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                onClick={handleUpdateScript}
                className="w-full max-w-[200px] bg-slate-900 hover:bg-slate-800 text-white transition-all hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 focus-visible:ring-2 focus-visible:ring-purple-500/80"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Metadata column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Details</CardTitle>
              <CardDescription>The parameters used to generate this script.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <Hash className="h-4 w-4 mt-0.5 text-slate-400" />
                  <span><strong>Prompt:</strong> {script.prompt || "N/A"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <BookText className="h-4 w-4 mt-0.5 text-slate-400" />
                  <span><strong>Context:</strong> {script.context || "N/A"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Smile className="h-4 w-4 mt-0.5 text-slate-400" />
                  <span><strong>Tone:</strong> {script.tone || "N/A"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 mt-0.5 text-slate-400" />
                  <span><strong>Storytelling:</strong> {script.include_storytelling ? "Yes" : "No"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <LinkIcon className="h-4 w-4 mt-0.5 text-slate-400" />
                  <span><strong>References:</strong> {script.reference_links || "N/A"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Languages className="h-4 w-4 mt-0.5 text-slate-400" />
                  <span><strong>Language:</strong> {script.language}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}