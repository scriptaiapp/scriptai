// route file: app/api/grant-access/route.ts (assumed path)

import { error } from "console"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supabase = await createClient();
  try {
    const { email } = await request.json()
    console.log(email)

    // Check if access has already been requested
    const { data: profileData, error: fetchError } = await supabase
      .from("profiles")
      .select("youtube_access_requested")
      .eq("email", email)
      .single();

    if (fetchError) throw fetchError;

    if (profileData?.youtube_access_requested) {
      return NextResponse.json({ message: "Access request already sent" }, { status: 200 })
    }

    // Send access request email to admin
    const res = await resend.emails.send({
      from: "Script AI <afrinnahar1999@gmail.com>",
      to: "afrinnahar1999@gmail.com",
      subject: "Script AI youtube access grant request",
      text: "Please grant access to the following email: " + email,
    })

    if (res?.error) {
      console.error("Error sending mail", res)
      return NextResponse.json({ message: "Error sending mail" }, { status: 400 })
    }

    // Send confirmation email to the user
    const confirmationRes = await resend.emails.send({
      from: "Script AI <afrinnahar1999@gmail.com>",
      to: email,
      subject: "Your Script AI YouTube Access Request",
      text: "Your request for YouTube access has been submitted. We will notify you once it's approved.",
    })

    if (confirmationRes?.error) {
      console.error("Error sending confirmation mail", confirmationRes)
      // Note: We don't fail the request if confirmation fails, but log it
    }

    // Update the profiles table to mark as requested
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ youtube_access_requested: true })
      .eq('email', email)

    if (updateError) throw updateError;

    console.log("Email sent successfully:", res)
    return NextResponse.json({ message: "Access granted request sent" }, { status: 200 })

  } catch (error) {
    console.error("Error in grant-access API:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`"youtube_grant_access", youtube_access_requested`)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      granted: data["youtube_grant_access"] || false,
      requested: data.youtube_access_requested || false
    });
  } catch (error) {
    console.error("Error in grant-access GET:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}