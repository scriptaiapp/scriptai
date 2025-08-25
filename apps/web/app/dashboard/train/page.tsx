"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/supabase-provider"
import { Upload, X, AlertCircle, Loader2, PenTool, Search, Volume2, Youtube, Bot, RefreshCw } from "lucide-react"
import { SuccessDialog } from "@/components/success-dialog"
import { toast } from "sonner"

export default function TrainAI() {
  const { supabase, user } = useSupabase()

  const [videoUrls, setVideoUrls] = useState<string[]>(["", "", ""])
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [youtubeConnected, setYoutubeConnected] = useState(false)
  const [aiTrained, setAiTrained] = useState(false)
  const [trainingData, setTrainingData] = useState<any>(null)

  const nextSteps = [
    { title: "Create Scripts", description: "Generate scripts tailored to your style", icon: PenTool, href: "/dashboard/scripts" },
    { title: "Research Topics", description: "Explore topics aligned with your content", icon: Search, href: "/dashboard/research" },
    { title: "Audio Dubbing", description: "Create dubbed audio in multiple languages", icon: Volume2, href: "/dashboard/audio-dubbing" },
  ]

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("youtube_connected, ai_trained")
          .eq("user_id", user.id)
          .single()

        if (error) {
          toast.error("Error checking user status")
          return
        }

        setYoutubeConnected(data.youtube_connected)
        setAiTrained(data.ai_trained)

        if (data.ai_trained) {
          const { data: styleData, error: styleError } = await supabase
            .from("user_style")
            .select("*")
            .eq("user_id", user.id)
            .single()
          if (!styleError && styleData) setTrainingData(styleData)
        }
      } catch (error) {
        console.error("Error checking user status:", error)
      }
    }
    checkUserStatus()
  }, [supabase, user])

  const handleAddVideoUrl = () => {
    if (videoUrls.length < 5) setVideoUrls([...videoUrls, ""])
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
    if (filledUrls.some((url) => !youtubeRegex.test(url))) {
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
      const response = await fetch("/api/train-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, videoUrls: validUrls, isRetraining }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to train AI")
        return
      }

      const result = await response.json()
      toast.success(
        isRetraining ? "AI Re-training Complete!" : "AI Training Complete!",
        {
          description: `Analyzed ${result.videosAnalyzed} videos${result.tokenRefreshed ? " (refreshed YouTube connection)" : ""}`,
        }
      )

      setAiTrained(true)
      setShowModal(true)
    } catch (error: any) {
      toast.error("Error training AI", { description: error.message || "Unexpected error" })
    } finally {
      setUploading(false)
    }
  }

  const handleRetrain = () => {
    setVideoUrls(["", "", ""])
    setTrainingData(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="container py-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Train Your AI</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Provide your content to train the AI on your unique style.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: How It Works */}
          <motion.div variants={itemVariants} className="lg:col-span-1 lg:sticky lg:top-8 space-y-6">
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Follow these steps to personalize your AI.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { step: 1, title: "Provide Videos", desc: "Add 3-5 YouTube video links that best represent your style.", icon: Youtube },
                    { step: 2, title: "AI Analysis", desc: "Our AI analyzes your tone, vocabulary, and delivery style.", icon: Bot },
                    { step: 3, title: "Start Creating", desc: "Generate personalized scripts that match your unique voice.", icon: PenTool },
                  ].map(({ step, title, desc, icon: Icon }) => (
                    <div key={step} className="flex items-start gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-slate-900 shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{step}. {title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-400">
                For best results, choose videos that showcase your typical content style, tone, and delivery.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Status + Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${youtubeConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                    YouTube Connection
                  </CardTitle>
                  <CardDescription>
                    {youtubeConnected
                      ? "Your YouTube channel is connected and ready for training"
                      : "Connect your YouTube channel to start training"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!youtubeConnected && (
                    <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
                      Connect YouTube Channel
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${aiTrained ? "bg-green-500" : "bg-yellow-500"}`}></div>
                    AI Training Status
                  </CardTitle>
                  <CardDescription>
                    {aiTrained
                      ? "Your AI has been trained on your content style"
                      : "Train your AI to understand your unique style"}
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
                    <Button onClick={handleRetrain} variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" /> Re-train AI
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Training Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Add Your YouTube Videos</CardTitle>
                <CardDescription>Provide links to 3-5 of your videos. More videos lead to better results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoUrls.map((url, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      placeholder={`https://www.youtube.com/watch?v=... (Video ${index + 1})`}
                      value={url}
                      onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                      disabled={uploading}
                    />
                    {videoUrls.length > 3 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveVideoUrl(index)} disabled={uploading}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
                {videoUrls.length < 5 && (
                  <Button variant="outline" size="sm" onClick={handleAddVideoUrl} disabled={uploading} className="mt-2">
                    Add Another Video
                  </Button>
                )}
              </CardContent>
              <CardFooter className="flex justify-end bg-slate-50/50 dark:bg-slate-900/50 p-4 border-t">
                <Button
                  onClick={() => handleStartTraining(aiTrained)}
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900"
                  disabled={uploading || !youtubeConnected}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {aiTrained ? "Re-training AI..." : "Training AI..."}
                    </>
                  ) : (
                    <>
                      {aiTrained ? <RefreshCw className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                      {aiTrained ? "Re-train AI" : "Start Training"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>

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
