"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import {
  BarChart3,
  BookOpen,
  FileText,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Search,
} from "lucide-react";
import Image from "next/image"
import logo from "@/public/dark-logo.png"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href: string
  }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathname = usePathname()

  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 transition-all hover:text-slate-900 dark:hover:text-white",
              pathname === link.href
                ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                : "hover:bg-slate-100 dark:hover:bg-slate-800",
              isCollapsed && "h-9 w-9 justify-center px-2",
            )}
            title={isCollapsed ? link.title : undefined}
          >
            {link.icon}
            {!isCollapsed && <span>{link.title}</span>}
            {!isCollapsed && link.label && (
              <span className="ml-auto text-xs font-medium text-slate-600 dark:text-slate-400">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}

interface DashboardSidebarProps {
  collapsed: boolean
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const links = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      variant: "default",
      href: "/dashboard",
    },
    {
      title: "Scripts",
      icon: <FileText className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/scripts",
    },
    {
      title: "Thumbnails",
      icon: <ImageIcon className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/thumbnails",
    },
    {
      title: "Subtitles",
      icon: <MessageSquare className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/subtitles",
    },
    {
      title: "Courses",
      icon: <BookOpen className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/courses",
    },
    {
      title: "Research",
      icon: <Search className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/research",
    },
    {
      title: "Train AI",
      icon: <Sparkles className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/train",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/analytics",
    },
    {
      title: "Referrals",
      icon: <Users className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/referrals",
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/settings",
    },
  ] as const

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-6 w-6 text-slate-500" />
              <span>Script AI</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <Nav isCollapsed={false} links={links} />
          </ScrollArea>
          <div className="mt-auto border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-slate-800 dark:text-slate-100"
              onClick={() => {
                handleLogout()
                setOpen(false)
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn(
        "border-r bg-white dark:bg-slate-950 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center border-b", collapsed ? "px-2" : "px-4")}>
        <Link href="/dashboard" className="flex items-center font-semibold">
          <Image src={logo} alt="Script AI" width={28} height={28} />
          {!collapsed && <span>Script AI</span>}
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <Nav isCollapsed={collapsed} links={links} />
      </ScrollArea>
      <div className={cn("mt-auto border-t", collapsed ? "p-2" : "p-4")}>
        <Button
          variant="ghost"
          className={cn(
            "text-slate-800 dark:text-slate-100",
            collapsed ? "w-10 h-10 p-0" : "w-full justify-start gap-2",
          )}
          onClick={handleLogout}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Log out</span>}
        </Button>
      </div>
    </aside>
  )
}
