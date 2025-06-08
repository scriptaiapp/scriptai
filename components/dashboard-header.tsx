"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useSupabase } from "@/components/supabase-provider"

export default function DashboardHeader() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const { user } = useSupabase()
  const [pageTitle, setPageTitle] = useState("")

  useEffect(() => {
    // Set page title based on pathname
    const path = pathname.split("/").filter(Boolean)
    if (path.length === 1) {
      setPageTitle("Dashboard")
    } else {
      const title = path[1].charAt(0).toUpperCase() + path[1].slice(1)
      setPageTitle(title)
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {isMobile && (
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <span className="text-sm font-medium">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
