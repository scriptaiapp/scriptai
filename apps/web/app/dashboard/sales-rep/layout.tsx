"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Link2,
  Users,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react"

const salesLinks = [
  { label: "Dashboard", href: "/dashboard/sales-rep", icon: LayoutDashboard },
  { label: "Affiliate Links", href: "/dashboard/sales-rep/links", icon: Link2 },
  { label: "Invited Users", href: "/dashboard/sales-rep/invited", icon: Users },
  { label: "My Sales", href: "/dashboard/sales-rep/my-sales", icon: DollarSign },
]

export default function SalesRepLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileLoading, logout } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user) {
        router.push("/login?redirectedFrom=/dashboard/sales-rep")
        return
      }
      if (profile?.role !== "sales_rep" && profile?.role !== "admin") {
        router.push("/dashboard")
      }
    }
  }, [user, profile, loading, profileLoading, router])

  if (loading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (!user || (profile?.role !== "sales_rep" && profile?.role !== "admin")) return null

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 border-r border-slate-800 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/dashboard/sales-rep" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-semibold text-lg">Sales Dashboard</span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {salesLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard/sales-rep" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
                  isActive
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 p-4 space-y-2">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900/50 px-6">
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-200">{profile?.full_name || profile?.email}</p>
              <p className="text-xs text-slate-500">Sales Representative</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
              {(profile?.full_name || profile?.email || "S").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
