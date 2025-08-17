import { NextResponse } from "next/server"
import { Resend } from "resend"
// import { createClient } from '@/lib/supabase/server';
/**
 * This route is used to request access to the Grand YouTube API.
 * It sends an email to the admin to grant access.
 */

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
//   const supabase = await createClient();
  try {
    const { email } = await request.json()
    console.log(email)


    // Send access granted email
   const res = await resend.emails.send({
      from: "Script AI <afrinxnahar@gmail.com>",
      to: "afrinxnahar@gmail.com",
      subject: "Script AI youtube access grant request",
      text: "Please grant access to the following email: " + email,
    })

    console.log("Email sent successfully:", res)

    return NextResponse.json({ message: "Access granted request sent" }, { status: 200 })
  } catch (error) {
    console.error("Error in grant-access API:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}