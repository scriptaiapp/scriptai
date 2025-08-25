"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
