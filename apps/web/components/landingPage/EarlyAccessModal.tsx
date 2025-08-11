"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2 } from "lucide-react"
import { Loader2 } from "lucide-react"


interface EarlyAccessModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function EarlyAccessModal({ isOpen, onOpenChange }: EarlyAccessModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        toast.success("You're on the waitlist 🎉")
        setShowThankYou(true)
        setEmail("")
        setTimeout(() => {
          setShowThankYou(false)
          onOpenChange(false)
        }, 3000)
      } else {
        const data = await res.json()
        toast.error(data.message || "Something went wrong")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>

      <DialogContent className="w-[90vw] max-w-md rounded-lg">
        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 p-6 rounded-lg text-center space-y-3"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-700">
                Thank you for joining!
              </h3>
              <p className="text-sm text-green-600">
                You’re officially on the waitlist 🚀
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Join Early Access</DialogTitle>
                <DialogDescription>
                  Enter your email to join the Script AI early access waitlist.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-zinc-900 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
