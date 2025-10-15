import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";


async function contactUsMail(subject: string, email: string,body:string, resend: Resend) {
  try {
    const {data, error} = await resend.emails.send({
      from: 'Script AI <notifications@tryscriptai.com>',
      to: 'afrin@tryscriptai.com',
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4F46E5;">🚨 New Issue Reported</h2>
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="white-space: pre-line;">${body}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #888;">Sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>`,
    });
    if (error) {
      console.error('Error sending issue mail:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending mail:', error);
  }
}

export async function POST(req: NextRequest) {
  const { subject, email, body } = await req.json()

 try {
     const resend = new Resend(process.env.RESEND_API_KEY!);

  if (!subject || !email || !body) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

  const result = await contactUsMail(subject, email, body, resend)
   return NextResponse.json(result, { status: result?.success ? 200 : 500 })

 } catch (error) {
    console.log(error)
 }
}