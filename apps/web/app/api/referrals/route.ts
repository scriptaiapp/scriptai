import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's referrals
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching referrals:", error)
      return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
    }

    // Calculate total credits earned
    const totalCreditsEarned = referrals
      .filter((r) => r.status === "completed")
      .reduce((total, referral) => total + referral.credits_awarded, 0)

    // Count pending referrals
    const pendingReferrals = referrals.filter((r) => r.status === "pending").length

    return NextResponse.json({
      referrals: referrals || [],
      totalCreditsEarned,
      pendingReferrals,
      totalReferrals: referrals?.length || 0,
    })
  } catch (error: any) {
    console.error("Error in referrals API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
