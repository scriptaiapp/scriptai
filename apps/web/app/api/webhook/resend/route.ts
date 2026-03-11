import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook } from "svix";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  const body = await request.text();

  if (process.env.RESEND_WEBHOOK_SECRET) {
    try {
      const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
      wh.verify(body, {
        "svix-id": svixId ?? "",
        "svix-timestamp": svixTimestamp ?? "",
        "svix-signature": svixSignature ?? "",
      });
    } catch {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }
  }

  const event = JSON.parse(body);

  if (event.type === "email.received") {
    const { email_id, from, to, subject, created_at } = event.data;

    console.log(
      `[Inbound Email] id=${email_id} from=${from} to=${JSON.stringify(to)} subject="${subject}" at=${created_at}`
    );

    try {
      const emailContent = await resend.emails.get(email_id);

      const toAddresses: string[] = to ?? [];
      const isSupport = toAddresses.some((addr: string) =>
        addr.toLowerCase().includes("support@tryscriptai.com")
      );

      if (isSupport) {
        await resend.emails.send({
          from: "Creator AI Support <support@tryscriptai.com>",
          to: "support@tryscriptai.com",
          subject: `[Support Inquiry] ${subject ?? "No Subject"}`,
          replyTo: from,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h2 style="color: #4F46E5; margin-top: 0;">New Inbound Email</h2>
                <p><strong>From:</strong> ${from}</p>
                <p><strong>To:</strong> ${toAddresses.join(", ")}</p>
                <p><strong>Subject:</strong> ${subject ?? "N/A"}</p>
                <p><strong>Received:</strong> ${created_at}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <div style="white-space: pre-line;">${(emailContent.data as any)?.html || (emailContent.data as any)?.text || "No email body available. Check the Resend dashboard."}</div>
              </div>
            </div>`,
        });
      }
    } catch (error) {
      console.error("Error processing inbound email:", error);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
