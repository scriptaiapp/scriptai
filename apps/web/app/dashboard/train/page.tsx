"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/supabase-provider"
import { Upload, X, AlertCircle, Loader2, PenTool, Search, Volume2, RefreshCw } from "lucide-react"
import { SuccessDialog } from "@/components/success-dialog"
import { toast } from "sonner";

export default function TrainAI() {
  const { supabase, user, session } = useSupabase()

  const [videoUrls, setVideoUrls] = useState<string[]>(["", "", ""])
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [youtubeConnected, setYoutubeConnected] = useState(false)
  const [aiTrained, setAiTrained] = useState(false)
  const [trainingData, setTrainingData] = useState<any>(null)

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
    const checkUserStatus = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('youtube_connected, ai_trained')
          .eq('user_id', user.id)
          .single()

        if (error) {
          toast.error("Error checking user status")
          return
        }

        setYoutubeConnected(data.youtube_connected)
        setAiTrained(data.ai_trained)

        // If AI is trained, fetch existing training data
        if (data.ai_trained) {
          const { data: styleData, error: styleError } = await supabase
            .from('user_style')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (!styleError && styleData) {
            setTrainingData(styleData)
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    checkUserStatus()
  }, [supabase, user])

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

  const handleStartTraining = async (isRetraining = false) => {
    if (!validateYouTubeUrls()) return

    setUploading(true)

    try {
      const validUrls = videoUrls.filter((url) => url.trim() !== "")

      // Send video URLs to backend for processing
      const response = await fetch("/api/train-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user?.id, 
          videoUrls: validUrls,
          isRetraining 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to train AI");
        return;
      }

      const result = await response.json();
      
      toast.success(
        isRetraining 
          ? "AI Re-training Complete! Your AI has been successfully updated with your new content style"
          : "AI Training Complete! Your AI has been successfully trained on your content style",
        {
          description: `Analyzed ${result.videosAnalyzed} videos${result.tokenRefreshed ? ' (refreshed YouTube connection)' : ''}`
        }
      )

      // Update local state
      setAiTrained(true)
      setShowModal(true)
    } catch (error: any) {
      toast.error("Error training AI", {
        description: error.message || "An unexpected error occurred"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRetrain = () => {
    // Clear existing video URLs and start fresh
    setVideoUrls(["", "", ""])
    setTrainingData(null)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Train Your AI</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload 3-5 videos from your YouTube channel to train AI on your unique content style
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${youtubeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              YouTube Connection
            </CardTitle>
            <CardDescription>
              {youtubeConnected 
                ? "Your YouTube channel is connected and ready for training"
                : "Connect your YouTube channel to start training"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!youtubeConnected && (
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                Connect YouTube Channel
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${aiTrained ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              AI Training Status
            </CardTitle>
            <CardDescription>
              {aiTrained 
                ? "Your AI has been trained on your content style"
                : "Train your AI to understand your unique style"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiTrained && trainingData && (
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <p><strong>Last trained:</strong> {new Date(trainingData.updated_at).toLocaleDateString()}</p>
                <p><strong>Videos analyzed:</strong> {trainingData.video_urls?.length || 0}</p>
              </div>
            )}
            {aiTrained && (
              <Button 
                onClick={handleRetrain}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-train AI
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training Form */}
      <Card>
        <CardHeader>
          <CardTitle>Video URLs</CardTitle>
          <CardDescription>
            Add 3-5 YouTube video URLs from your channel. These videos will be analyzed to understand your content style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {videoUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                className="flex-1"
              />
              {videoUrls.length > 3 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveVideoUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {videoUrls.length < 5 && (
            <Button
              variant="outline"
              onClick={handleAddVideoUrl}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Another Video
            </Button>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => handleStartTraining(aiTrained)}
            disabled={uploading || !youtubeConnected}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {aiTrained ? "Re-training AI..." : "Training AI..."}
              </>
            ) : (
              <>
                {aiTrained ? <RefreshCw className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {aiTrained ? "Re-train AI" : "Start Training"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Success Modal */}
      <SuccessDialog
        open={showModal}
        onOpenChange={setShowModal}
        title="AI Training Complete!"
        description="Your AI has been successfully trained on your content style. You can now generate personalized scripts, research topics, and more."
        nextSteps={nextSteps}
      />
    </div>
  )
}