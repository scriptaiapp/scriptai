"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { Script } from "@repo/validation"
import { YoutubePermissionDialog } from "@/components/YoutubePermissionDialog"
import { NewUserOnboarding } from "@/components/dashboard/main/NewUserOnboarding"
import { ReturningUserHub } from "@/components/dashboard/main/ReturningUserHub"
import { DashboardSkeleton } from "@/components/dashboard/main/skeleton/DashboardSkeleton"
import { connectYoutubeChannel } from "@/lib/connectYT"

export default function Dashboard() {
  const { supabase, user, profile, fetchUserProfile } = useSupabase()
  const [recentScripts, setRecentScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)

  // Separate, specific loading states for user actions provide better UX
  const [isConnectingYoutube, setIsConnectingYoutube] = useState(false)
  const [isDisconnectingYoutube, setIsDisconnectingYoutube] = useState(false)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [youtubeAccessRequested, setYoutubeAccessRequested] = useState(false)

  // Effect to fetch data specific to this component (recent scripts)
  useEffect(() => {
    const fetchRecentScripts = async () => {
      if (!user) return

      try {
        const { data: scriptsData, error: scriptsError } = await supabase
          .from("scripts")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3)

        if (scriptsError) throw scriptsError

        setRecentScripts(scriptsData || [])
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch recent scripts.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentScripts()
  }, [supabase, user])

  const handleConnectYoutube = () => {
    connectYoutubeChannel({
      supabase,
      user,
      setIsConnectingYoutube,
      setPermissionDialogOpen,
      setYoutubeAccessRequested,
    })
  }

  const handleDisconnectYoutube = async () => {
    if (!user) return
    setIsDisconnectingYoutube(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ai_trained: false, youtube_connected: false })
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      toast.success("YouTube channel disconnected successfully.")
      fetchUserProfile(user.id)
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect YouTube channel.")
    } finally {
      setIsDisconnectingYoutube(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="container py-8">
        <DashboardSkeleton />
      </div>
    )
  }
  const isSetupComplete = profile.youtube_connected && profile.ai_trained

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {profile.full_name || "Creator"}
        </h1>
      </div>

      {isSetupComplete ? (
        <ReturningUserHub
          profile={profile}
          recentScripts={recentScripts}
          disconnectYoutubeChannel={handleDisconnectYoutube}
          disconnectingYoutube={isDisconnectingYoutube}
        />
      ) : (
        <NewUserOnboarding
          profile={profile}
          connectYoutubeChannel={handleConnectYoutube}
          connectingYoutube={isConnectingYoutube}
          disconnectYoutubeChannel={handleDisconnectYoutube}
          disconnectingYoutube={isDisconnectingYoutube}
        />
      )}

      <YoutubePermissionDialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        isRequested={youtubeAccessRequested}
      />
    </div>
  )
}