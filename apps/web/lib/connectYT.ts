import { toast } from "sonner"
import { SupabaseClient } from "@supabase/supabase-js"

interface ConnectYoutubeProps {
  supabase: SupabaseClient
  user: any
  setIsConnectingYoutube: (value: boolean) => void
}

export const connectYoutubeChannel = async ({
  supabase,
  user,
  setIsConnectingYoutube,
}: ConnectYoutubeProps) => {
  setIsConnectingYoutube(true)
  try {
    if (!user?.id) throw new Error("User not authenticated.")

    // Proceed directly with Supabase OAuth
    const { data: oauthData, error: oauthError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/youtube/callback`,
          scopes:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

    if (oauthError) throw oauthError
    if (oauthData?.url) {
      window.location.href = oauthData.url
      return
    }
    throw new Error("Failed to retrieve Google authentication URL.")
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred."
    console.error("YouTube Connection Error:", errorMessage)
    toast.error(errorMessage)
  } finally {
    setIsConnectingYoutube(false)
  }
}