"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, Search, BookOpen, LinkIcon, TrendingUp, HelpCircle, Lightbulb } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ResearchTopic {
  id: string
  topic: string
  context?: string
  created_at: string
  research_data: {
    summary: string
    keyPoints: string[]
    trends: string[]
    questions: string[]
    contentAngles: string[]
    sources: string[]
  }
}

export default function TopicResearch() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [topic, setTopic] = useState("")
  const [context, setContext] = useState("")
  const [loading, setLoading] = useState(false)
  const [research, setResearch] = useState<ResearchTopic | null>(null)
  const [recentTopics, setRecentTopics] = useState<ResearchTopic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)

  useEffect(() => {
    const fetchRecentTopics = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("research_topics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        setRecentTopics(data || [])
      } catch (error: any) {
        toast({
          title: "Error fetching recent topics",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoadingTopics(false)
      }
    }

    fetchRecentTopics()
  }, [supabase, user, toast])

  const handleResearchTopic = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to research.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/research-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          context,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to research topic")
      }

      const data = await response.json()
      setResearch({
        id: data.id,
        topic: data.topic,
        context,
        created_at: new Date().toISOString(),
        research_data: data.research,
      })

      toast({
        title: "Research complete!",
        description: "Your topic has been researched successfully.",
      })

      // Refresh the recent topics list
      const { data: updatedTopics, error } = await supabase
        .from("research_topics")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (!error) {
        setRecentTopics(updatedTopics || [])
      }
    } catch (error: any) {
      toast({
        title: "Error researching topic",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewTopic = async (id: string) => {
    try {
      const response = await fetch(`/api/research-topic/${id}`, {
        method: "GET",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch research topic")
      }

      const data = await response.json()
      setResearch(data)
    } catch (error: any) {
      toast({
        title: "Error fetching research topic",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Topic Research</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Research topics for your YouTube videos with AI assistance
        </p>
      </div>

      <Tabs defaultValue="research" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="research">Research Topic</TabsTrigger>
          <TabsTrigger value="results" disabled={!research}>
            Research Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Research a New Topic</CardTitle>
                  <CardDescription>Enter a topic to research for your next YouTube video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic (Required)</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Artificial Intelligence in Healthcare"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Enter the main topic you want to research
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context">Additional Context</Label>
                    <Textarea
                      id="context"
                      placeholder="e.g., Focus on recent advancements and ethical considerations"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Add specific details or angles you want to explore
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleResearchTopic}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Research Topic
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Research</CardTitle>
                  <CardDescription>Your recently researched topics</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTopics ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    </div>
                  ) : recentTopics.length > 0 ? (
                    <div className="space-y-4">
                      {recentTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          onClick={() => handleViewTopic(topic.id)}
                        >
                          <div>
                            <h3 className="font-medium">{topic.topic}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(topic.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-slate-500 dark:text-slate-400">No research topics yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          {research && (
            <Card>
              <CardHeader>
                <CardTitle>{research.topic}</CardTitle>
                <CardDescription>Researched on {new Date(research.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <p className="text-slate-600 dark:text-slate-400">{research.research_data.summary}</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="key-points">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-slate-500" />
                        <span>Key Points</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {research.research_data.keyPoints.map((point, index) => (
                          <li key={index} className="text-slate-600 dark:text-slate-400">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="trends">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-slate-500" />
                        <span>Current Trends</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {research.research_data.trends.map((trend, index) => (
                          <li key={index} className="text-slate-600 dark:text-slate-400">
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="questions">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-slate-500" />
                        <span>Common Questions</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {research.research_data.questions.map((question, index) => (
                          <li key={index} className="text-slate-600 dark:text-slate-400">
                            {question}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="angles">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-slate-500" />
                        <span>Content Angles</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {research.research_data.contentAngles.map((angle, index) => (
                          <li key={index} className="text-slate-600 dark:text-slate-400">
                            {angle}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sources">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-slate-500" />
                        <span>Sources</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6 list-disc">
                        {research.research_data.sources.map((source, index) => (
                          <li key={index} className="text-slate-600 dark:text-slate-400">
                            {source}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setResearch(null)}>
                  Research New Topic
                </Button>
                <Button
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                  onClick={() => router.push("/dashboard/scripts/new")}
                >
                  Create Script from Research
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
