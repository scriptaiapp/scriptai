import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

async function sendWelcomeEmail(full_name: string, email: string, user_id: string, resend: Resend) {
  try {
    await resend.emails.send({
      from: 'Script AI <onboarding@tryscriptai.com>',
      to: email,
      subject: 'Welcome to Script AI!',
      replyTo: 'support@tryscriptai.com',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
          <h1 style="color: #4F46E5; margin-bottom: 10px;">Welcome aboard, ${full_name}! 🎉</h1>
          
          <p>We're excited to have you join <strong>Script AI</strong>. 🚀</p>
          <p>
            Start exploring your dashboard here 👉 
            <a href="https://tryscriptai.com/dashboard" style="color: #4F46E5; text-decoration: none; font-weight: bold;">
              Go to Dashboard
            </a>
          </p>

          <h2 style="margin-top: 30px; color: #111;">🎥 Quick Start Guide</h2>
          <p>Watch this short video to learn how to test the features:</p>
          <div style="margin: 20px 0; text-align: center;">
            <a href="https://drive.google.com/file/d/1CPbW40HmE2Xh8WumJeCs0PvKcpa4U1Yo/preview"
              style="background-color: #4F46E5; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              ▶ Watch Guide Video
            </a>
          </div>

          <h2 style="margin-top: 30px; color: #111;">📝 Quick Feedback</h2>
          <p>
            We’d love to hear your thoughts! It’ll only take a minute.  
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScLoa3gQRo44ygVofL-pY-HKgNwWRfP72qUKN6yaG7UZngFwA/viewform?usp=header" 
              style="color: #4F46E5; font-weight: bold; text-decoration: none;">
              Share Feedback
            </a>
          </p>

          <h2 style="margin-top: 30px; color: #111;">🤝 Referral Program</h2>
          <p>
            Invite friends to join Script AI and earn <strong>10 free credits</strong>!  
            Simply share your referral link from the dashboard — when they sign up, you’ll both get 10 credits.
          </p>

          <p style="margin-top: 30px;">Have any questions? Just reply to this email or reach us at 
            <a href="mailto:support@tryscriptai.com" style="color: #4F46E5; text-decoration: none;">support@tryscriptai.com</a>.
          </p>

          <p style="margin-top: 20px;">Cheers,<br/>The Script AI Team</p>
        </div>`,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

async function sendAdminNotification(full_name: string, email: string, resend: Resend) {
  try {
    await resend.emails.send({
      from: 'Script AI <notifications@tryscriptai.com>',
      to: 'afrin@tryscriptai.com',
      subject: 'New User Sign Up Notification',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
          <h1 style="color: #4F46E5;">New User Sign Up</h1>
          <p>A new user has signed up:</p>
          <ul>
            <li><strong>Name:</strong> ${full_name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Time:</strong> ${new Date().toISOString()}</li>
          </ul>
        </div>`,
    });
    console.log(`Admin notification sent for new user: ${email}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';
  const supabase = await createClient();
  const resend = new Resend(process.env.RESEND_API_KEY!);

  // For Google sign-in
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error.message);
      redirect('/error');
    }

    if (data.user) {
      const full_name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email;
      const avatar_url = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile for Google OAuth:', profileError.message);
      }

      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('welcome_email_sent')
        .eq('id', data.user.id)
        .single();

      if (profileCheck && !profileCheck.welcome_email_sent) {
        await sendWelcomeEmail(full_name, data.user.email!, data.user.id, resend);
        await sendAdminNotification(full_name, data.user.email!, resend);

        // Mark as sent
        await supabase
          .from('profiles')
          .update({
            welcome_email_sent: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.user.id);
      }

      redirect(next);
    }
  }

  // For email OTP verification (manual signup)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.user) {
      const full_name = data.user.user_metadata?.full_name || data.user.email;
      const avatar_url = data.user.user_metadata?.avatar_url || null;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile for email OTP:', profileError.message);
      }

      if (data.user.email) {
        try {
          const { data: pendingReferrals, error: pendingError } = await supabase
            .from('referrals')
            .select('id')
            .eq('status', 'pending')
            .eq('referred_email', data.user.email);

          if (pendingError) {
            console.error('Error fetching pending referrals:', pendingError.message);
          } else if (pendingReferrals?.length && data.user) {
            const updates = pendingReferrals.map((referral) =>
              supabase
                .from('referrals')
                .update({
                  referred_user_id: data.user ? data.user.id : null,
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                })
                .eq('id', referral.id)
            );

            const results = await Promise.all(updates);
            const completedCount = results.filter((result) => !result.error).length;

            if (completedCount > 0) {
              console.log(`Completed ${completedCount} referral(s) for email: ${data.user.email}`);
            }
          }
        } catch (referralError) {
          console.error('Error processing referrals:', referralError);
        }
      }

      // For extra safety, also check if type === 'signup' (though flag handles it)
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('welcome_email_sent')
        .eq('id', data.user.id)
        .single();

      if (profileCheck && !profileCheck.welcome_email_sent && type === 'signup') {
        await sendWelcomeEmail(full_name, data.user.email!, data.user.id, resend);
        await sendAdminNotification(full_name, data.user.email!, resend);

        await supabase
          .from('profiles')
          .update({
            welcome_email_sent: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.user.id);
      }

      redirect(next);
    }
  }

  redirect('/error');
}