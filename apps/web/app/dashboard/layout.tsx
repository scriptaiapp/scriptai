"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const { loading } = useSupabase()
  const pathname = usePathname()

  const handleTogglePin = useCallback(() => {
    setSidebarPinned((prev) => !prev)
  }, [])

  const isAdminRoute = pathname.startsWith("/dashboard/admin")
  const isSalesRepRoute = pathname.startsWith("/dashboard/sales-rep")

  if (isAdminRoute || isSalesRepRoute) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} pinned={sidebarPinned} setPinned={setSidebarPinned} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} onToggleSidebarPin={handleTogglePin} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
