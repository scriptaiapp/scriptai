import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';
  const supabase = await createClient();

  // For Google sign-in
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error.message);
      redirect('/error');
    }

    if (data.user) {
      // Extract full_name and avatar_url from user metadata
      const full_name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email;
      const avatar_url = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;

      // Update full_name and avatar_url in profiles table
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
      // Extract full_name from user metadata (set during signUp)
      const full_name = data.user.user_metadata?.full_name || data.user.email;
      const avatar_url = data.user.user_metadata?.avatar_url || null;

      // Update full_name and avatar_url in profiles table
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

      // Handle pending referrals
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

      redirect(next);
    }
  }

  redirect('/error');
}