"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, Save, Bell } from "lucide-react"

// Import the new components from the correct path
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm"
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm"
import { BillingInfo } from "@/components/settings/BillingInfo"

export default function Settings() {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  // Add state to track if the initial fetch is done
  const [initialFetchComplete, setInitialFetchComplete] = useState(false)

  // This can be moved to a constants file later if needed
  const supportedLanguages = [
    { code: "ar", name: "العربية (Arabic)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "zh", name: "中文 (Chinese)" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français (French)" },
    { code: "de", name: "Deutsch (German)" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "it", name: "Italiano (Italian)" },
    { code: "ja", name: "日本語 (Japanese)" },
    { code: "ko", name: "한국어 (Korean)" },
    { code: "pt", name: "Português (Portuguese)" },
    { code: "ru", name: "Русский (Russian)" },
    { code: "es", name: "Español (Spanish)" },
  ];

  // Profile settings state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [language, setLanguage] = useState("en")
  const [nameError, setNameError] = useState("");

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [scriptCompletionNotifications, setScriptCompletionNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Subscription info state (mock data)
  const [currentPlan, setCurrentPlan] = useState("Free")
  const [nextBillingDate, setNextBillingDate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Only fetch if user exists and the initial fetch hasn't happened yet
      if (!user || initialFetchComplete) {
        // If there's no user, we might still want to stop the loading spinner
        if (!user) setProfileLoading(false);
        return;
      }

      setProfileLoading(true)
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()
        if (error) throw error

        if (data) {
          setName(data.full_name || "")
          setEmail(user.email || "")
          setLanguage(data.language || "en")
          setCurrentPlan("Free")
          setNextBillingDate("")
          setPaymentMethod("")

          // Mark the initial fetch as complete
          setInitialFetchComplete(true)
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error)
        toast.error("Error fetching profile", { description: error.message })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [supabase, user, initialFetchComplete]) // Add initialFetchComplete to dependencies

  const handleUpdateProfile = async () => {
    if (!user) return
    if (!name || name.length < 3) {
      setNameError("Name must be at least 3 characters long")
      return
    }
    setNameError("");

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          language,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error
      toast.success("Profile updated", { description: "Your profile has been updated successfully." })
    } catch (error: any) {
      toast.error("Error updating profile", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotifications = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Notification preferences updated");
    setLoading(false);
  }

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error("Error sending password reset email", { description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ProfileSettingsForm
                  name={name}
                  setName={setName}
                  email={email}
                  language={language}
                  setLanguage={setLanguage}
                  nameError={nameError}
                  loading={loading}
                  handleChangePassword={handleChangePassword}
                  supportedLanguages={supportedLanguages}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateProfile} disabled={loading || profileLoading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm
                emailNotifications={emailNotifications}
                setEmailNotifications={setEmailNotifications}
                scriptCompletionNotifications={scriptCompletionNotifications}
                setScriptCompletionNotifications={setScriptCompletionNotifications}
                marketingEmails={marketingEmails}
                setMarketingEmails={setMarketingEmails}
                loading={loading}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateNotifications} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Bell className="mr-2 h-4 w-4" />Save Preferences</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <BillingInfo
                currentPlan={currentPlan}
                nextBillingDate={nextBillingDate}
                paymentMethod={paymentMethod}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
