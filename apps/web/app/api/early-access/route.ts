import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const supabase = await createClient();
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    // Insert email into Supabase
    const { error: insertError } = await supabase
      .from("early_access")
      .insert([{ email, status: "pending", created_at: new Date(), updated_at: new Date() }]);

    if (insertError) {
      if (insertError.code === "23505") {
        console.log("Duplicate email detected:", email);
        return NextResponse.json({ message: "Email already registered" }, { status: 400 });
      }
      throw insertError;
    }

    // Send waiting approval email
    const { data, error } = await resend.emails.send({
      from: "Script AI <no-reply@tryscriptai.com>",
      to: email,
      subject: "Script AI Early Access Waitlist",
      text: "Thanks for joining the Script AI early access waitlist! We're excited to have you. We'll get back to you once your access is ready.",
    });

    if (error) {
      console.log("Email send error:", error);
      return NextResponse.json({ message: "Failed to send mail" }, { status: 400 });
    }

    console.log("Email sent successfully:", data);
    return NextResponse.json({ message: "Successfully joined waitlist" }, { status: 200 });
  } catch (error) {
    console.error("Error in early-access API:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}