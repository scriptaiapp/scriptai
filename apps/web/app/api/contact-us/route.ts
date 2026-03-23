import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function contactUsMail(name: string, email: string, message: string, phone: string, resend: Resend) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || '');
  const safeMessage = escapeHtml(message);

  const { data, error } = await resend.emails.send({
    from: 'Creator AI <notifications@tryscriptai.com>',
    to: 'support@tryscriptai.com',
    replyTo: email,
    subject: "📬 New Contact Message",
    html: `<div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4F46E5;">📬 New Contact Message</h2>
          <p><strong>From:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone No:</strong> ${safePhone}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="white-space: pre-line;">${safeMessage}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888;">Sent on ${new Date().toLocaleString()}</p>
        </div>
      </div>`,
  });

  if (error) {
    console.error('Error sending contact mail:', error);
    return { success: false, error: 'Failed to send message' };
  }

  return { success: true, data };
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { email, message, name, phone } = body;

  if (!email || !message || !name) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const result = await contactUsMail(name, email, message, phone ?? '', resend);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}