"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Copy, Gift, Share2, Users, ArrowRight } from "lucide-react"

interface Referral {
  id: string
  referred_email: string
  status: "pending" | "completed"
  credits_awarded: number
  created_at: string
}

export default function Referrals() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState("")
  const [referralLink, setReferralLink] = useState("")
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0)

  useEffect(() => {
    if (user) {
      // Generate referral code based on user ID
      const code = user.id.substring(0, 8)
      setReferralCode(code)
      setReferralLink(`${window.location.origin}/signup?ref=${code}`)

      // Fetch referrals (simulated for now)
      const fetchReferrals = async () => {
        setLoading(true)
        try {
          // In a real app, this would be a Supabase query
          // Simulated data for now
          const mockReferrals: Referral[] = [
            {
              id: "1",
              referred_email: "friend1@example.com",
              status: "completed",
              credits_awarded: 5,
              created_at: "2023-05-15T10:30:00Z",
            },
            {
              id: "2",
              referred_email: "friend2@example.com",
              status: "pending",
              credits_awarded: 0,
              created_at: "2023-05-20T14:45:00Z",
            },
            {
              id: "3",
              referred_email: "colleague@example.com",
              status: "completed",
              credits_awarded: 5,
              created_at: "2023-06-01T09:15:00Z",
            },
          ]

          setReferrals(mockReferrals)
          setTotalCreditsEarned(mockReferrals.reduce((total, referral) => total + referral.credits_awarded, 0))
        } catch (error: any) {
          toast({
            title: "Error fetching referrals",
            description: error.message,
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }

      fetchReferrals()
    }
  }, [user, toast])

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Referral link copied!",
      description: "Share this link with friends to earn credits.",
    })
  }

  const handleShareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Script AI",
          text: "Check out Script AI - an AI assistant for YouTubers. Use my referral link to get started:",
          url: referralLink,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopyReferralLink()
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Invite friends and earn credits for premium features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCreditsEarned}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From {referrals.filter((r) => r.status === "completed").length} successful referrals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{referrals.filter((r) => r.status === "pending").length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Waiting for friends to complete signup</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Credits Per Referral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Credits awarded for each successful referral
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link with friends to earn credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={referralLink} readOnly className="flex-1" />
            <Button variant="outline" size="icon" onClick={handleCopyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShareReferral}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
            <Gift className="h-5 w-5 text-slate-500 flex-shrink-0" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              For each friend who signs up using your link, you'll earn 5 credits that can be used for premium features.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Referrals</h2>
        <Button variant="outline" size="sm" className="gap-1">
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent"></div>
        </div>
      ) : referrals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {referrals.map((referral) => (
            <Card key={referral.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                      <Users className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{referral.referred_email}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        referral.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {referral.status === "completed" ? "Completed" : "Pending"}
                    </span>
                    {referral.status === "completed" && (
                      <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        +{referral.credits_awarded} credits
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-semibold mb-2">No referrals yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Share your referral link with friends to start earning credits for premium features.
            </p>
            <Button className="bg-slate-700 hover:bg-slate-800 text-white" onClick={handleShareReferral}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Referral Link
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
