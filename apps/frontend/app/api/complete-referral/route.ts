import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { referralId, referredUserId } = await req.json()

    // Validate inputs
    if (!referralId || !referredUserId) {
      return NextResponse.json({ error: "Referral ID and referred user ID are required" }, { status: 400 })
    }

    const supabase = await createClient();

    // Get the referral
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select("*")
      .eq("id", referralId)
      .single()

    if (referralError || !referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 })
    }

    if (referral.status === "completed") {
      return NextResponse.json({ error: "Referral already completed" }, { status: 400 })
    }

    // Update the referral
    const { error: updateError } = await supabase
      .from("referrals")
      .update({
        referred_id: referredUserId,
        status: "completed",
        credits_awarded: 5, // Award 5 credits for a successful referral
      })
      .eq("id", referralId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update referral" }, { status: 500 })
    }

    // Add credits to the referrer
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", referral.referrer_id)
      .single()

    if (referrerError) {
      return NextResponse.json({ error: "Failed to fetch referrer profile" }, { status: 500 })
    }

    const { error: creditError } = await supabase
      .from("profiles")
      .update({
        credits: referrerProfile.credits + 5,
      })
      .eq("user_id", referral.referrer_id)

    if (creditError) {
      return NextResponse.json({ error: "Failed to update referrer credits" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Referral completed successfully",
    })
  } catch (error: any) {
    console.error("Error completing referral:", error)
    return NextResponse.json({ error: "Failed to complete referral", message: error.message }, { status: 500 })
  }
}
