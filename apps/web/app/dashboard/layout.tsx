"use client"

import type React from "react"
import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { ScriptsProvider } from "@/hooks/use-script"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading } = useSupabase()


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    // <ScriptsProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    // {/*</ScriptsProvider>*/}
  )
}
