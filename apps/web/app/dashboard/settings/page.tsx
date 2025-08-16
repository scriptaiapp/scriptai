"use client";

import { useState } from "react";
import { Bell, CreditCard, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";
import { BillingInfo } from "@/components/settings/BillingInfo";

// Define NavItem type for clarity
type NavItemId = "profile" | "notifications" | "billing";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<NavItemId>("profile");
  const navItems = [
    { id: "profile" as NavItemId, icon: UserCircle, label: "Profile" },
    { id: "notifications" as NavItemId, icon: Bell, label: "Notifications" },
    { id: "billing" as NavItemId, icon: CreditCard, label: "Billing" },
  ];


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

                  <ProfileSettingsForm />

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

                  <NotificationSettingsForm />
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

                  <BillingInfo />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}