"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Home,
  PenTool,
  Upload,
  ImageIcon,
  FileText,
  BookOpen,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      // Force a hard navigation to clear all client state
      window.location.href = "/login"
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/scripts", label: "My Scripts", icon: <PenTool className="h-5 w-5" /> },
    { href: "/dashboard/train", label: "Train AI", icon: <Upload className="h-5 w-5" /> },
    { href: "/dashboard/research", label: "Topic Research", icon: <Search className="h-5 w-5" /> },
    { href: "/dashboard/thumbnails", label: "Thumbnails", icon: <ImageIcon className="h-5 w-5" /> },
    { href: "/dashboard/subtitles", label: "Subtitles", icon: <FileText className="h-5 w-5" /> },
    { href: "/dashboard/courses", label: "Course Modules", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/dashboard/referrals", label: "Referrals", icon: <Gift className="h-5 w-5" /> },
    { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const sidebarContent = (
    <>
      <div className="px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-slate-500" />
          <span className="text-xl font-bold">Script AI</span>
        </Link>
      </div>
      <div className="space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto px-3 py-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {isMobile && (
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50" onClick={toggleSidebar}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      {isMobile ? (
        <div
          className={cn(
            "fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="h-full w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col">{sidebarContent}</div>
          {isOpen && <div className="absolute inset-0 bg-black/50 -z-10" onClick={() => setIsOpen(false)} />}
        </div>
      ) : (
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
          {sidebarContent}
        </div>
      )}
    </>
  )
}
