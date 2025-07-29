"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2 } from "lucide-react"

export default function NewScript() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [prompt, setPrompt] = useState("")
  const [context, setContext] = useState("")
  const [tone, setTone] = useState("")
  const [includeStorytelling, setIncludeStorytelling] = useState(false)
  const [references, setReferences] = useState("")
  const [language, setLanguage] = useState("english")

  const [loading, setLoading] = useState(false)
  const [generatedScript, setGeneratedScript] = useState("")
  const [scriptTitle, setScriptTitle] = useState("")

  const handleGenerateScript = async () => {
    if (!prompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate a script.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if user has enough credits
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("credits, ai_trained")
        .eq("user_id", user?.id)
        .single()

      if (profileError) throw profileError

      if (profileData.credits < 1) {
        toast({
          title: "Insufficient credits",
          description:
            "You need at least 1 credit to generate a script. Please upgrade your plan or earn more credits.",
          variant: "destructive",
        })
        return
      }

      // Call the OpenAI API to generate the script
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          context,
          tone,
          includeStorytelling,
          references,
          language,
          personalized: profileData.ai_trained,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate script")
      }

      const data = await response.json()

      // Update the user's credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: profileData.credits - 1 })
        .eq("user_id", user?.id)

      if (updateError) throw updateError

      // Set the generated script and a default title
      setGeneratedScript(data.script)
      setScriptTitle(data.title || "New Script")

      toast({
        title: "Script generated!",
        description: "Your script has been generated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error generating script",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScript = async () => {
    if (!generatedScript || !scriptTitle) {
      toast({
        title: "Missing information",
        description: "Please generate a script and provide a title before saving.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("scripts")
        .insert([
          {
            user_id: user?.id,
            title: scriptTitle,
            content: generatedScript,
            prompt,
            context,
            tone,
            include_storytelling: includeStorytelling,
            references,
            language,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Script saved!",
        description: "Your script has been saved successfully.",
      })

      router.push(`/dashboard/scripts/${data[0].id}`)
    } catch (error: any) {
      toast({
        title: "Error saving script",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Script</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Generate a personalized script for your YouTube video</p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Script</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedScript}>
            Preview & Save
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Script Generator</CardTitle>
              <CardDescription>Fill in the details below to generate your personalized script</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt (Required)</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., Generate a unique script on time-blocking technique"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Describe what you want your script to be about
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context</Label>
                <Textarea
                  id="context"
                  placeholder="e.g., Include why time-blocking is important and how successful people use it"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add specific details or points you want to include
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motivational">Motivational</SelectItem>
                      <SelectItem value="funny">Funny</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
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
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="storytelling"
                  checked={includeStorytelling}
                  onCheckedChange={(checked) => setIncludeStorytelling(checked as boolean)}
                />
                <Label htmlFor="storytelling" className="cursor-pointer">
                  Include storytelling elements
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="references">References</Label>
                <Textarea
                  id="references"
                  placeholder="e.g., https://example.com/article, or leave empty for AI to research"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add URLs or sources for reference, or leave empty for AI to research
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateScript}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Script"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Save Script</CardTitle>
              <CardDescription>Review your generated script and save it to your library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Script Title</Label>
                <Input
                  id="title"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  placeholder="Enter a title for your script"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="script">Generated Script</Label>
                <div className="border rounded-md p-4 min-h-[300px] bg-slate-50 dark:bg-slate-900 whitespace-pre-wrap">
                  {generatedScript}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setGeneratedScript("")} disabled={loading}>
                Regenerate
              </Button>
              <Button
                onClick={handleSaveScript}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Script"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
