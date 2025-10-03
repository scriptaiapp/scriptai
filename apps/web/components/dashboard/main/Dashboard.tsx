"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { NewUserOnboarding } from "@/components/dashboard/main/NewUserOnboarding"
import { ReturningUserHub } from "@/components/dashboard/main/ReturningUserHub"
import { DashboardSkeleton } from "@/components/dashboard/main/skeleton/DashboardSkeleton"
import { connectYoutubeChannel } from "@/lib/connectYT"

interface DashboardProps {
    initialScripts: any[]
}

export default function Dashboard({ initialScripts }: DashboardProps) {
    const { supabase, user, profile, fetchUserProfile } = useSupabase()

    const [recentScripts, setRecentScripts] = useState(initialScripts)
    const [isConnectingYoutube, setIsConnectingYoutube] = useState(false)
    const [isDisconnectingYoutube, setIsDisconnectingYoutube] = useState(false)

    const handleConnectYoutube = () => {
        connectYoutubeChannel({
            supabase,
            user,
            setIsConnectingYoutube,
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
            await fetchUserProfile(user.id)
        } catch (error: any) {
            toast.error(error.message || "Failed to disconnect YouTube channel.")
        } finally {
            setIsDisconnectingYoutube(false)
        }
    }

    if (!profile) {
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
        </div>
    )
}
