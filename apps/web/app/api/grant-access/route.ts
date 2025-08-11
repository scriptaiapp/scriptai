import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from '@/lib/supabase/server';

/**
 * @todo This route will be added for admin site later on
 */



export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supabase = await createClient();
  try {
    const { email } = await request.json()

    // Update status to approved
    const { data, error } = await supabase
      .from("early_access")
      .update({ status: "approved", updated_at: new Date() })
      .eq("email", email)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    // Send access granted email
    await resend.emails.send({
      from: "Script AI <afrinxnahar@gmail.com>",
      to: email,
      subject: "Script AI Early Access Granted",
      text: "Great news! You've been granted early access to Script AI. Log in with your Google account to get started: [your-login-url].",
    })

    return NextResponse.json({ message: "Access granted" }, { status: 200 })
  } catch (error) {
    console.error("Error in grant-access API:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}