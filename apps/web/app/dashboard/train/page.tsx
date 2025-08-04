"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/supabase-provider"
import { Upload, X, AlertCircle, Loader2, PenTool, Search, Volume2 } from "lucide-react"
import { SuccessDialog } from "@/components/success-dialog"
import { toast } from "sonner";

export default function TrainAI() {
  const { supabase, user, session } = useSupabase()

  const [videoUrls, setVideoUrls] = useState<string[]>(["", "", ""])
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [youtubeConnected, setYoutubeConnected] = useState(false)

  const nextSteps = [
    {
      title: "Create Scripts",
      description: "Generate scripts tailored to your style",
      icon: PenTool,
      href: "/dashboard/scripts",
    },
    {
      title: "Research Topics",
      description: "Explore topics aligned with your content",
      icon: Search,
      href: "/dashboard/research",
    },
    {
      title: "Audio Dubbing",
      description: "Create dubbed audio in multiple languages",
      icon: Volume2,
      href: "/dashboard/audio-dubbing",
    },
  ]

  useEffect(() => {
    console.log("user", user);
    console.log("session", session)
    const checkYoutubeConnected = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('youtube_connected')
        .eq('user_id', user.id)
        .single()

      if (error) {
        toast.error("Error checking YouTube connection")
        return
      }

      setYoutubeConnected(data.youtube_connected)
    }

    checkYoutubeConnected()
  }, [supabase, user, toast])

  const handleAddVideoUrl = () => {
    setVideoUrls([...videoUrls, ""])
  }

  const handleRemoveVideoUrl = (index: number) => {
    const newUrls = [...videoUrls]
    newUrls.splice(index, 1)
    setVideoUrls(newUrls)
  }

  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls]
    newUrls[index] = value
    setVideoUrls(newUrls)
  }

  const validateYouTubeUrls = () => {
    if (!youtubeConnected) {
      toast.error("YouTube not connected! Please connect your YouTube channel in the dashboard before training.")
      return false
    }

    const filledUrls = videoUrls.filter((url) => url.trim() !== "")

    if (filledUrls.length < 3) {
      toast.error("Not enough videos. Please provide at least 3 YouTube video URLs to train your AI.")
      return false
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    const invalidUrls = filledUrls.filter((url) => !youtubeRegex.test(url))

    if (invalidUrls.length > 0) {
      toast.error("Invalid YouTube URLs. Please provide valid YouTube video URLs.")
      return false
    }

    return true
  }

  const handleStartTraining = async () => {
    if (!validateYouTubeUrls()) return

    setUploading(true)

    try {
      const validUrls = videoUrls.filter((url) => url.trim() !== "")

      // Send video URLs to backend for processing
      const response = await fetch("/api/train-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, videoUrls: validUrls }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Error training AI")
        throw new Error(errorData.error || "Failed to train AI");
      }

      toast.success("AI Training Complete! Your AI has been successfully trained on your content style")

      setShowModal(true)
    } catch (error: any) {
      toast.error("Error training AI")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Train Your AI</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload your videos to train the AI on your unique style
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How AI Training Works</CardTitle>
          <CardDescription>Train your AI to generate scripts that match your unique style and tone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Provide YouTube Videos</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add links to 3-5 of your YouTube videos that best represent your style
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Analyzes Your Content</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our AI extracts transcripts and analyzes your tone, vocabulary, and style
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Personalized Script Generation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate scripts that match your unique style, tone, and content preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Your YouTube Videos</CardTitle>
          <CardDescription>
            Provide links to 3-5 of your YouTube videos that best represent your content style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {videoUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                disabled={uploading}
              />
              {videoUrls.length > 3 && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveVideoUrl(index)} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {videoUrls.length < 5 && (
            <Button variant="outline" size="sm" onClick={handleAddVideoUrl} disabled={uploading} className="mt-2">
              Add Another Video
            </Button>
          )}

          <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-400">
              For best results, choose videos that showcase your typical content style, tone, and delivery.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={handleStartTraining}
            className="bg-slate-950 hover:bg-slate-900 text-white"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training AI...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Training
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <SuccessDialog
        open={showModal}
        onOpenChange={setShowModal}
        title="Congratulations!"
        description="Your AI has been successfully trained on your unique content style."
        nextSteps={nextSteps}
      />
    </div>
  )
}