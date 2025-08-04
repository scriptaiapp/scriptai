"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog"

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
      <div className="container py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Edit Script</CardTitle>
          <CardDescription>Modify the script title and content or delete the script</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Script Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your script"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Script Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] bg-slate-50 dark:bg-slate-900"
              placeholder="Your script content will appear here"
            />
          </div>

          <div className="space-y-2">
            <Label>Script Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div>
                <p><strong>Prompt:</strong> {script.prompt || "None"}</p>
                <p><strong>Context:</strong> {script.context || "None"}</p>
                <p><strong>Tone:</strong> {script.tone || "None"}</p>
              </div>
              <div>
                <p><strong>Storytelling:</strong> {script.include_storytelling ? "Yes" : "No"}</p>
                <p><strong>References:</strong> {script.reference_links || "None"}</p>
                <p><strong>Language:</strong> {script.language}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
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
                <AlertDialogAction onClick={handleDeleteScript}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={handleUpdateScript}
            className="w-full max-w-[200px] bg-slate-900 hover:bg-slate-800 text-white"
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
  )
}