import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Script AI - Personalized AI Assistant for YouTubers",
  description: "Generate personalized scripts, titles, thumbnails for your YouTube videos"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SupabaseProvider>
            <main>
              {children}
            </main>
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
