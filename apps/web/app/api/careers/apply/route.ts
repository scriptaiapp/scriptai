import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseClient, getSupabaseServiceEnv } from "@repo/supabase";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const position = formData.get("position") as string;
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string | null;
  const linkedin_url = formData.get("linkedin_url") as string;
  const github_url = formData.get("github_url") as string | null;
  const portfolio_url = formData.get("portfolio_url") as string | null;
  const experience = formData.get("experience") as string;
  const problem_solving = formData.get("problem_solving") as string;
  const job_post_id = formData.get("job_post_id") as string | null;
  const resumeFile = formData.get("resume_file") as File | null;
  const coverLetterFile = formData.get("cover_letter_file") as File | null;

  if (!position || !full_name || !email || !experience || !linkedin_url || !problem_solving) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
  }

  for (const file of [resumeFile, coverLetterFile]) {
    if (file) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ success: false, error: "Only PDF files are allowed" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: "File size must be under 5MB" }, { status: 400 });
      }
    }
  }

  try {
    const { url, key } = getSupabaseServiceEnv();
    const supabase = createSupabaseClient(url, key);
    const timestamp = Date.now();
    const sanitizedName = full_name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

    let resume_file_path: string | null = null;
    let cover_letter_file_path: string | null = null;

    if (resumeFile) {
      const path = `resumes/${sanitizedName}_${timestamp}_resume.pdf`;
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const { error } = await supabase.storage.from("job-applications").upload(path, buffer, { contentType: "application/pdf" });
      if (error) {
        console.error("Resume upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload resume" }, { status: 500 });
      }
      const { data: urlData } = supabase.storage.from("job-applications").getPublicUrl(path);
      resume_file_path = urlData.publicUrl;
    }

    if (coverLetterFile) {
      const path = `cover-letters/${sanitizedName}_${timestamp}_cover_letter.pdf`;
      const buffer = Buffer.from(await coverLetterFile.arrayBuffer());
      const { error } = await supabase.storage.from("job-applications").upload(path, buffer, { contentType: "application/pdf" });
      if (error) {
        console.error("Cover letter upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload cover letter" }, { status: 500 });
      }
      const { data: urlData } = supabase.storage.from("job-applications").getPublicUrl(path);
      cover_letter_file_path = urlData.publicUrl;
    }

    const { error: dbError } = await supabase.from("job_applications").insert({
      job_post_id: job_post_id || null,
      position,
      full_name,
      email,
      phone: phone || null,
      linkedin_url,
      github_url: github_url || null,
      portfolio_url: portfolio_url || null,
      resume_file_path,
      cover_letter_file_path,
      experience,
      problem_solving,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to save application" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const safe = {
      name: escapeHtml(full_name),
      email: escapeHtml(email),
      phone: escapeHtml(phone || "N/A"),
      position: escapeHtml(position),
      experience: escapeHtml(experience),
      linkedin: escapeHtml(linkedin_url),
      github: github_url ? escapeHtml(github_url) : null,
      portfolio: portfolio_url ? escapeHtml(portfolio_url) : null,
      problemSolving: escapeHtml(problem_solving),
    };

    await resend.emails.send({
      from: "Creator AI <notifications@tryscriptai.com>",
      to: "support@tryscriptai.com",
      replyTo: email,
      subject: `New Job Application: ${safe.position}`,
      html: `<div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED; margin-top: 0;">New Job Application</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 130px;">Position:</td><td style="padding: 8px 0;">${safe.position}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td style="padding: 8px 0;">${safe.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${safe.phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Experience:</td><td style="padding: 8px 0;">${safe.experience}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">LinkedIn:</td><td style="padding: 8px 0;"><a href="${safe.linkedin}">${safe.linkedin}</a></td></tr>
            ${safe.github ? `<tr><td style="padding: 8px 0; font-weight: bold;">GitHub:</td><td style="padding: 8px 0;"><a href="${safe.github}">${safe.github}</a></td></tr>` : ""}
            ${safe.portfolio ? `<tr><td style="padding: 8px 0; font-weight: bold;">Portfolio:</td><td style="padding: 8px 0;"><a href="${safe.portfolio}">${safe.portfolio}</a></td></tr>` : ""}
            ${resume_file_path ? `<tr><td style="padding: 8px 0; font-weight: bold;">Resume:</td><td style="padding: 8px 0;"><a href="${resume_file_path}">View Resume</a></td></tr>` : ""}
            ${cover_letter_file_path ? `<tr><td style="padding: 8px 0; font-weight: bold;">Cover Letter:</td><td style="padding: 8px 0;"><a href="${cover_letter_file_path}">View Cover Letter</a></td></tr>` : ""}
          </table>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <h3 style="color: #4F46E5;">Problem Solving</h3>
          <p style="white-space: pre-line;">${safe.problemSolving}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888;">Submitted on ${new Date().toLocaleString()}</p>
        </div>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
