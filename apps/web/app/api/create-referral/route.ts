import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Validate inputs
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the email already exists in the referrals table
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", session.user.id)
      .eq("referred_email", email)
      .single()

    if (existingReferral) {
      return NextResponse.json({ error: "You have already referred this email" }, { status: 400 })
    }

    // Generate unique referral code
    const referralCode = session.user.id.substring(0, 8)

    // Create the referral
    const { data, error } = await supabase
      .from("referrals")
      .insert([
        {
          referrer_id: session.user.id,
          referred_email: email,
          status: "pending",
          credits_awarded: 0,
          referral_code: referralCode,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
      ])
      .select()

    if (error) {
      console.error("Error creating referral:", error)
      return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
    }

    // In a real application, you would send an email to the referred user here

    return NextResponse.json({
      success: true,
      message: "Referral created successfully",
      referral: data[0],
    })
  } catch (error: any) {
    console.error("Error creating referral:", error)
    return NextResponse.json({ error: "Failed to create referral", message: error.message }, { status: 500 })
  }
}
