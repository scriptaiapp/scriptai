import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { referralCode, userEmail } = await req.json()

    // Validate inputs
    if (!referralCode || !userEmail) {
      return NextResponse.json({ error: "Referral code and user email are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the referral by referral code and email
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", referralCode)
      .eq("referred_email", userEmail)
      .eq("status", "pending")
      .single()

    if (referralError || !referral) {
      return NextResponse.json({ error: "Referral not found or already completed" }, { status: 404 })
    }

    // Check if referral has expired
    if (new Date(referral.expires_at) < new Date()) {
      return NextResponse.json({ error: "Referral has expired" }, { status: 400 })
    }

    // Get the newly created user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the referral to completed
    const { error: updateError } = await supabase
      .from("referrals")
      .update({
        referred_id: user.id,
        status: "completed",
        credits_awarded: 5,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", referral.id)

    if (updateError) {
      console.error("Error updating referral:", updateError)
      return NextResponse.json({ error: "Failed to update referral" }, { status: 500 })
    }

    // Add credits to the referrer
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", referral.referrer_id)
      .single()

    if (referrerError) {
      console.error("Error fetching referrer profile:", referrerError)
      return NextResponse.json({ error: "Failed to fetch referrer profile" }, { status: 500 })
    }

    const { error: creditError } = await supabase
      .from("profiles")
      .update({
        credits: (referrerProfile.credits || 0) + 5,
      })
      .eq("user_id", referral.referrer_id)

    if (creditError) {
      console.error("Error updating referrer credits:", creditError)
      return NextResponse.json({ error: "Failed to update referrer credits" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Referral tracked and completed successfully",
      creditsAwarded: 5,
    })
  } catch (error: any) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Failed to track referral", message: error.message }, { status: 500 })
  }
}
