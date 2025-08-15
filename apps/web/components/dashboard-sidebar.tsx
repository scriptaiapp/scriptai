"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { motion } from "motion/react"
import {
  Home,
  Sparkles,
  FileText,
  Search,
  ImageIcon,
  MessageSquare,
  BookOpen,
  Users,
  Menu
} from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"

import logo from "@/public/dark-logo.png"

interface NavLink {
  label: string
  icon: React.ReactNode
  variant: "default" | "ghost"
  href: string
}

interface NavProps {
  isCollapsed?: boolean
  onLinkClick?: () => void
  links: ReadonlyArray<NavLink>
}

export const Logo = ({
  showText = true,
  href = "/dashboard",
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-2 font-medium text-black dark:text-white",
    )}
  >
    <Image
      src={logo}
      alt="Script AI Logo"
      width={24}
      height={20}
      className="shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm"
    />


    {showText && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="whitespace-pre"
      >
        Script AI
      </motion.span>
    )}
  </Link>
);

export function Nav({ links, isCollapsed, onLinkClick }: NavProps) {
  const pathname = usePathname()

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links?.map((link, index) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={index}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 transition-all hover:text-slate-900 dark:hover:text-white",
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800",
                isCollapsed && "h-9 w-9 justify-center px-2"
              )}
              title={isCollapsed ? link.label : undefined}
            >
              {link.icon}
              {!isCollapsed && <span>{link.label}</span>}

            </Link>
          )
        })}
      </nav>
    </div>
  )
}

interface DashboardSidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function DashboardSidebar({
  collapsed,
  setCollapsed
}: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()


  const links: ReadonlyArray<NavLink> = [
    { label: "Dashboard", icon: <Home className="h-4 w-4" />, variant: "default", href: "/dashboard" },
    { label: "Train AI", icon: <Sparkles className="h-4 w-4" />, variant: "ghost", href: "/dashboard/train" },
    { label: "Scripts", icon: <FileText className="h-4 w-4" />, variant: "ghost", href: "/dashboard/scripts" },
    { label: "Topic Research", icon: <Search className="h-4 w-4" />, variant: "ghost", href: "/dashboard/research" },
    { label: "Thumbnails", icon: <ImageIcon className="h-4 w-4" />, variant: "ghost", href: "/dashboard/thumbnails" },
    { label: "Subtitles", icon: <MessageSquare className="h-4 w-4" />, variant: "ghost", href: "/dashboard/subtitles" },
    { label: "Course Modules", icon: <BookOpen className="h-4 w-4" />, variant: "ghost", href: "/dashboard/courses" },
    { label: "Audio Dubbing", icon: <Users className="h-4 w-4" />, variant: "ghost", href: "/dashboard/dubbing" }
  ]

  if (isMobile) {
    return (
      <Sheet open={collapsed} onOpenChange={setCollapsed}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>

          <div className="p-2">
            <Nav links={links} onLinkClick={() => setCollapsed(false)} />
          </div>

        </SheetContent>
      </Sheet>
    )
  }

  const pathname = usePathname();

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo showText={true} /> : <Logo showText={false} />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <SidebarLink
                  key={idx}
                  link={link}
                  className={`
                py-2 font-medium transition-colors duration-150 rounded-md
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 flex items-center justify-start
                ${open ? "px-3" : "justify-center"}
                ${isActive
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
              `}
                />
              );
            })}
          </div>
        </div>
        <div />
      </SidebarBody>
    </Sidebar>
  )
}
