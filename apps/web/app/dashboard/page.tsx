"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool, Upload, ImageIcon, FileText, BookOpen, Plus, ArrowRight } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"

interface UserProfile {
  avatar_url: string
  email: string
  full_name: string
  credits: number
  ai_trained: boolean
}

export default function Dashboard() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentScripts, setRecentScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  console.log("User in Dashboard:", user)


  useEffect(() => {
    console.log("Fetching user data from dashboard:", user)

    const fetchUserData = async () => {

      if (!user) return

      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileError) throw profileError

        // Fetch recent scripts
        const { data: scriptsData, error: scriptsError } = await supabase
          .from("scripts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3)

        if (scriptsError) throw scriptsError

        setProfile(user.user_metadata as UserProfile)
        setRecentScripts(scriptsData || [])
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, user])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-950 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.full_name || "Creator"}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.credits || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Use credits to generate scripts and other content
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">AI Training Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {profile?.ai_trained ? (
                <span className="text-green-500">Trained</span>
              ) : (
                <span className="text-slate-900">Not Trained</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {profile?.ai_trained
                ? "Your AI is trained and ready to generate personalized scripts"
                : "Train your AI to generate personalized scripts"}
            </p>
            {!profile?.ai_trained && (
              <Link href="/dashboard/train">
                <Button size="sm" className="mt-2 bg-slate-900 hover:bg-slate-800 text-white">
                  Train Now
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Free Plan</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upgrade to Pro for unlimited scripts and more features
            </p>
            <Link href="#upgrade">
              <Button size="sm" variant="outline" className="mt-2">
                Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/scripts/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <PenTool className="h-10 w-10 text-slate-500 mb-4" />
              <CardTitle className="text-lg mb-1">Create Script</CardTitle>
              <CardDescription>Generate a new script for your video</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/train">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-slate-500 mb-4" />
              <CardTitle className="text-lg mb-1">Train AI</CardTitle>
              <CardDescription>Upload videos to train your AI model</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/thumbnails">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <ImageIcon className="h-10 w-10 text-slate-500 mb-4" />
              <CardTitle className="text-lg mb-1">Create Thumbnail</CardTitle>
              <CardDescription>Generate eye-catching thumbnails</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/courses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BookOpen className="h-10 w-10 text-slate-500 mb-4" />
              <CardTitle className="text-lg mb-1">Course Module</CardTitle>
              <CardDescription>Create a structured course module</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Scripts */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Scripts</h2>
        <Link href="/dashboard/scripts">
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {recentScripts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mb-8">
          {recentScripts.map((script) => (
            <Card key={script.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{script.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(script.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/scripts/${script.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-semibold mb-2">No scripts yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Create your first script to get started</p>
            <Link href="/dashboard/scripts/new">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="h-4 w-4 mr-2" /> Create Script
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Train Your AI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Upload 3-5 of your videos to train the AI on your unique style and content preferences.
            </p>
            <Link href="/dashboard/train">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Start Training</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Create Your First Script</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Generate a personalized script based on your prompt, tone, and context preferences.
            </p>
            <Link href="/dashboard/scripts/new">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Create Script</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Explore Other Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try our thumbnail generator, subtitle creator, and course module builder.
            </p>
            <Link href="/dashboard/thumbnails">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Explore Tools</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
