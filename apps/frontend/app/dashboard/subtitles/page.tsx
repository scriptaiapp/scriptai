"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, Download } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function SubtitleGenerator() {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [language, setLanguage] = useState("english")
  const [loading, setLoading] = useState(false)
  const [subtitles, setSubtitles] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("url")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleGenerateSubtitles = async () => {
    if (activeTab === "url" && !videoUrl) {
      toast({
        title: "Video URL required",
        description: "Please enter a YouTube video URL to generate subtitles.",
        variant: "destructive",
      })
      return
    }

    if (activeTab === "upload" && !videoFile) {
      toast({
        title: "Video file required",
        description: "Please upload a video file to generate subtitles.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Simulate file upload progress
      if (activeTab === "upload") {
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval)
              return 100
            }
            return prev + 10
          })
        }, 500)
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Sample subtitles for demonstration
      const sampleSubtitles = `1
00:00:00,000 --> 00:00:03,000
Welcome to this video about content creation.

2
00:00:03,500 --> 00:00:07,000
Today we're going to discuss how AI can help YouTubers.

3
00:00:07,500 --> 00:00:12,000
Script AI makes it easy to generate personalized scripts for your videos.

4
00:00:12,500 --> 00:00:16,000
Let's start by looking at the key features of this platform.

5
00:00:16,500 --> 00:00:20,000
First, you can train the AI on your existing content.

6
00:00:20,500 --> 00:00:25,000
This ensures that the scripts match your unique style and tone.`

      setSubtitles(sampleSubtitles)

      toast({
        title: "Subtitles generated!",
        description: "Your subtitles have been generated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error generating subtitles",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleDownloadSubtitles = () => {
    if (!subtitles) return

    const blob = new Blob([subtitles], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "subtitles.srt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subtitle Generator</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Generate accurate subtitles for your YouTube videos</p>
      </div>

      <Tabs defaultValue="url" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">YouTube URL</TabsTrigger>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>Generate from YouTube URL</CardTitle>
              <CardDescription>Enter a YouTube video URL to generate subtitles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="video-url">YouTube Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter the full URL of the YouTube video you want to generate subtitles for
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage} disabled={loading}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select the language of the video content</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateSubtitles}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Subtitles"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Upload a video file to generate subtitles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="video-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-slate-500 dark:text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">MP4, MOV, or AVI (MAX. 500MB)</p>
                    </div>
                    <input
                      id="video-file"
                      type="file"
                      className="hidden"
                      accept="video/mp4,video/mov,video/avi"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                </div>
                {videoFile && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">Selected file: {videoFile.name}</p>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                  <div className="bg-slate-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="upload-language">Language</Label>
                <Select value={language} onValueChange={setLanguage} disabled={loading}>
                  <SelectTrigger id="upload-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select the language of the video content</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateSubtitles}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading || !videoFile}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Subtitles"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {subtitles && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Subtitles</CardTitle>
            <CardDescription>Review and download your subtitles</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={subtitles}
              onChange={(e) => setSubtitles(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSubtitles("")}>
              Clear
            </Button>
            <Button className="bg-slate-700 hover:bg-slate-800 text-white" onClick={handleDownloadSubtitles}>
              <Download className="mr-2 h-4 w-4" />
              Download SRT
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
