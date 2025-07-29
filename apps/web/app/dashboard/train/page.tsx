"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Upload, X, AlertCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function TrainAI() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [videoUrls, setVideoUrls] = useState<string[]>(["", "", ""])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState(1)

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
    const filledUrls = videoUrls.filter((url) => url.trim() !== "")

    if (filledUrls.length < 3) {
      toast({
        title: "Not enough videos",
        description: "Please provide at least 3 YouTube video URLs to train your AI.",
        variant: "destructive",
      })
      return false
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    const invalidUrls = filledUrls.filter((url) => !youtubeRegex.test(url))

    if (invalidUrls.length > 0) {
      toast({
        title: "Invalid YouTube URLs",
        description: "Please provide valid YouTube video URLs.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleStartTraining = async () => {
    if (!validateYouTubeUrls()) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate the training process with progress updates
      const validUrls = videoUrls.filter((url) => url.trim() !== "")

      // Step 1: Extract video IDs and fetch transcripts
      setStep(1)
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(i)
      }

      // Step 2: Analyze content and extract style patterns
      setStep(2)
      for (let i = 30; i < 60; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(i)
      }

      // Step 3: Train AI model on user's style
      setStep(3)
      for (let i = 60; i < 100; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(i)
      }

      // Update user profile to mark AI as trained
      const { error } = await supabase.from("profiles").update({ ai_trained: true }).eq("user_id", user?.id)

      if (error) throw error

      // Save user style data
      const { error: styleError } = await supabase.from("user_style").upsert({
        user_id: user?.id,
        tone: "conversational",
        vocabulary_level: "intermediate",
        pacing: "moderate",
        themes: "based on uploaded content",
        humor_style: "natural",
        structure: "intro, main points, conclusion",
        video_urls: validUrls,
      })

      if (styleError) throw styleError

      toast({
        title: "AI Training Complete!",
        description: "Your AI has been successfully trained on your content style.",
      })

      // Redirect to dashboard after successful training
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error training AI",
        description: error.message,
        variant: "destructive",
      })
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

        {uploading && (
          <div className="px-6 pb-2">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                {step === 1 && "Extracting video transcripts..."}
                {step === 2 && "Analyzing content style..."}
                {step === 3 && "Training AI model..."}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

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
    </div>
  )
}
