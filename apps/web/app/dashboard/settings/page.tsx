"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSupabase } from "@/components/supabase-provider";
import { Loader2, Save, Bell, CreditCard, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";
import { BillingInfo } from "@/components/settings/BillingInfo";

// Define NavItem type for clarity
type NavItemId = "profile" | "notifications" | "billing";

export default function Settings() {
  const { supabase, user } = useSupabase();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [nameError, setNameError] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [scriptCompletionNotifications, setScriptCompletionNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [activeTab, setActiveTab] = useState<NavItemId>("profile");

  // Centralized navigation items for reuse
  const navItems = [
    { id: "profile" as NavItemId, icon: UserCircle, label: "Profile" },
    { id: "notifications" as NavItemId, icon: Bell, label: "Notifications" },
    { id: "billing" as NavItemId, icon: CreditCard, label: "Billing" },
  ];

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || initialFetchComplete) return;
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (error) throw error;
        if (data) {
          setName(data.full_name || "");
          setEmail(user.email || "");
          setLanguage(data.language || "en");
          setInitialFetchComplete(true);
        }
      } catch (error: any) {
        toast.error("Error fetching profile", { description: error.message });
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchUserProfile();
  }, [supabase, user, initialFetchComplete]);


  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!name || name.length < 3) {
      setNameError("Name must be at least 3 characters long");
      return;
    }
    setNameError("");
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          language,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error) throw error;

      toast.success("Profile updated", { description: "Your profile has been updated successfully." });
    } catch (error: any) {
      toast.error("Error updating profile", { description: error.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setSavingNotifications(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Notification preferences updated");
    setSavingNotifications(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error("Error sending password reset email", { description: error.message });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6 py-8 md:py-16">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your account, preferences, and billing information.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 md:flex-row md:gap-16">
          {/* --- DESKTOP SIDEBAR (Visible on medium screens and up) --- */}
          <aside className="hidden w-full md:flex md:w-1/4 lg:w-1/5">
            <nav className="flex w-full flex-col space-y-1 relative">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
          ${isActive
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-desktop-tab"
                        className="absolute inset-0 rounded-lg bg-purple-100 dark:bg-purple-900/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>

          </aside>

          <main className="flex-1">
            {/* --- MINIMAL MOBILE TAB BAR (Visible only on small screens) --- */}
            <nav className="relative mb-6 rounded-full bg-slate-100 p-1 dark:bg-slate-800/60 md:hidden">
              <div className="flex items-center relative justify-center gap-8">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="relative z-10 rounded-full p-2.5 w-28 flex items-center justify-center transition-colors"
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-slate-500"}`} />
                      {isActive && (
                        <motion.div
                          layoutId="active-settings-tab"
                          className="absolute inset-0 -z-10 rounded-full w-full bg-white shadow-md dark:bg-purple-900/40 flex items-center justify-center"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

            </nav>

            {/* --- CONTENT AREA (Dynamically rendered based on activeTab) --- */}
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Update your personal information and account settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingProfile ? (
                        <div className="flex min-h-[200px] items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                        </div>
                      ) : (
                        <ProfileSettingsForm
                          name={name}
                          setName={setName}
                          email={email}
                          language={language}
                          setLanguage={setLanguage}
                          nameError={nameError}
                          loading={savingProfile}
                          handleChangePassword={handleChangePassword}
                          supportedLanguages={supportedLanguages}
                        />
                      )}
                    </CardContent>
                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 rounded-b-lg">
                      <Button onClick={handleUpdateProfile} disabled={savingProfile || loadingProfile}>
                        {savingProfile ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how and when you receive notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NotificationSettingsForm
                        emailNotifications={emailNotifications}
                        setEmailNotifications={setEmailNotifications}
                        scriptCompletionNotifications={scriptCompletionNotifications}
                        setScriptCompletionNotifications={setScriptCompletionNotifications}
                        marketingEmails={marketingEmails}
                        setMarketingEmails={setMarketingEmails}
                        loading={savingNotifications}
                      />
                    </CardContent>
                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 rounded-b-lg">
                      <Button onClick={handleUpdateNotifications} disabled={savingNotifications}>
                        {savingNotifications ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Bell className="mr-2 h-4 w-4" />
                        )}
                        Save Preferences
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>
                        Manage your subscription and payment details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BillingInfo
                        currentPlan={currentPlan}
                        nextBillingDate={nextBillingDate}
                        paymentMethod={paymentMethod}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}