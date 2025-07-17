"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, BookOpen } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"

export default function CourseModuleGenerator() {
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [videoCount, setVideoCount] = useState("5")
  const [references, setReferences] = useState("")
  const [loading, setLoading] = useState(false)
  const [courseModule, setCourseModule] = useState<any>(null)

  const handleGenerateCourseModule = async () => {
    if (!topic) {
      toast.error("Topic required!", { description: "Please enter a course topic to generate a module." })
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Sample course module for demonstration
      const sampleCourseModule = {
        title: `Complete ${topic} Course`,
        description: description || `A comprehensive course on ${topic} for ${difficulty} level learners.`,
        videoCount: Number.parseInt(videoCount),
        difficulty,
        estimatedDuration: `${Number.parseInt(videoCount) * 15} minutes`,
        videos: Array.from({ length: Number.parseInt(videoCount) }, (_, i) => ({
          id: i + 1,
          title: i === 0 ? `Introduction to ${topic}` : `${topic} Concept ${i}`,
          duration: `${10 + Math.floor(Math.random() * 10)} minutes`,
          description: `Learn about ${i === 0 ? "the basics of" : "advanced concepts in"} ${topic} in this ${i === 0 ? "introductory" : "in-depth"
            } video.`,
          script: `[INTRO]
Hello and welcome to video ${i + 1} of our ${topic} course. Today we're going to cover ${i === 0 ? "the fundamentals of" : "how to master"
            } ${topic}.

[MAIN CONTENT]
${i === 0
              ? `Let's start by understanding what ${topic} is and why it's important. ${topic} is a crucial concept that helps you...`
              : `Now that you understand the basics, let's dive deeper into ${topic} concept ${i}. This builds upon what we learned earlier and extends it by...`
            }

[KEY POINTS]
- Key point 1 about ${topic}
- Key point 2 about ${topic}
- Key point 3 about ${topic}

[CONCLUSION]
That's all for this video on ${topic}. In the next video, we'll explore ${i < Number.parseInt(videoCount) - 1 ? `${topic} concept ${i + 2}` : "how to apply everything we've learned"
            }.`,
        })),
      }

      setCourseModule(sampleCourseModule)

      toast.success("Course module generated!", { description: "Your course module has been generated successfully." })
    } catch (error: any) {

      toast.error(error.message || "An unexpected error occurred", { description: "Please try again later." })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadModule = () => {
    if (!courseModule) return

    const moduleText = JSON.stringify(courseModule, null, 2)
    const blob = new Blob([moduleText], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${courseModule.title.replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Course Module Generator</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Create structured course modules with video outlines and scripts
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Module</TabsTrigger>
          <TabsTrigger value="preview" disabled={!courseModule}>
            Preview & Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Course Module Generator</CardTitle>
              <CardDescription>Fill in the details below to generate your course module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Course Topic (Required)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., React Hooks, Digital Marketing, Photography Basics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">Enter the main topic of your course</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., A comprehensive guide to mastering React Hooks for beginners"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">Provide a brief description of your course</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} disabled={loading}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-count">Number of Videos</Label>
                  <Select value={videoCount} onValueChange={setVideoCount} disabled={loading}>
                    <SelectTrigger id="video-count">
                      <SelectValue placeholder="Select number of videos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Videos</SelectItem>
                      <SelectItem value="5">5 Videos</SelectItem>
                      <SelectItem value="7">7 Videos</SelectItem>
                      <SelectItem value="10">10 Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="references">References (Optional)</Label>
                <Textarea
                  id="references"
                  placeholder="e.g., https://example.com/article, or leave empty for AI to research"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add URLs or sources for reference, or leave empty for AI to research
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateCourseModule}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Course Module"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {courseModule && (
            <Card>
              <CardHeader>
                <CardTitle>{courseModule.title}</CardTitle>
                <CardDescription>{courseModule.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                    {courseModule.videoCount} Videos
                  </div>
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                    {courseModule.difficulty.charAt(0).toUpperCase() + courseModule.difficulty.slice(1)}
                  </div>
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                    {courseModule.estimatedDuration}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  {courseModule.videos.map((video: any) => (
                    <AccordionItem key={video.id} value={`video-${video.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-start text-left">
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md mr-3">
                            <BookOpen className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{video.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{video.duration}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-10">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Description</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{video.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Script</h4>
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md text-sm whitespace-pre-wrap font-mono">
                              {video.script}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCourseModule(null)}>
                  Generate New
                </Button>
                <Button className="bg-slate-700 hover:bg-slate-800 text-white" onClick={handleDownloadModule}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Module
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
