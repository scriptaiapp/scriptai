"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, Save, CreditCard, Shield, Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function Settings() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // Profile settings
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [scriptCompletionNotifications, setScriptCompletionNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Subscription info (mock data)
  const [currentPlan, setCurrentPlan] = useState("Free")
  const [nextBillingDate, setNextBillingDate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      setProfileLoading(true)
      try {
        // Fetch user profile from Supabase
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

        if (error) throw error

        if (data) {
          setName(data.name || "")
          setEmail(user.email || "")
          setBio(data.bio || "")

          // Mock subscription data
          setCurrentPlan("Free")
          setNextBillingDate("")
          setPaymentMethod("")
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [supabase, user, toast])

  const handleUpdateProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      // In a real app, you would update notification preferences in the database
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating notification preferences",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user || !user.email) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      })
    } catch (error: any) {
      toast({
        title: "Error sending password reset email",
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
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled={true}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} disabled={loading} />
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Security</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security settings</p>

                    <Button variant="outline" onClick={handleChangePassword} disabled={loading} className="mt-2">
                      <Shield className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdateProfile}
                className="bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading || profileLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={loading}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="script-completion">Script Completion</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Get notified when your scripts are generated
                    </p>
                  </div>
                  <Switch
                    id="script-completion"
                    checked={scriptCompletionNotifications}
                    onCheckedChange={setScriptCompletionNotifications}
                    disabled={loading}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdateNotifications}
                className="bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
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
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-medium">{currentPlan} Plan</p>
                    {nextBillingDate && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Next billing date: {nextBillingDate}</p>
                    )}
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Payment Method</h3>
                {paymentMethod ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-slate-500" />
                      <p>{paymentMethod}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No payment method added</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Billing History</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                  <p className="text-slate-500 dark:text-slate-400">No billing history available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
