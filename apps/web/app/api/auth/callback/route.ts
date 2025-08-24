import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const supabase = await createClient();

  // for google sign in
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log(error);
    if (!error) {
      redirect("/dashboard");
    }
  }

  if (token_hash && type) {

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error && data.user) {
      // User email verified! Complete any pending referrals
      console.log('✅ User email verified:', data.user.email);
      
      try {
        // Complete pending referrals directly in the auth callback
        console.log('🔍 Looking for pending referrals for:', data.user.email);
        
        // Find pending referrals for this user's email
        const { data: pendingReferrals, error: pendingError } = await supabase
          .from('referrals')
          .select('*')
          .eq('status', 'pending')
          .eq('referred_email', data.user.email);

        if (pendingError) {
          console.log('❌ Error finding pending referrals:', pendingError);
        } else if (pendingReferrals && pendingReferrals.length > 0) {
          console.log('🔍 Found pending referrals:', pendingReferrals.length);
          
          let completedCount = 0;
          
          // Complete each pending referral
          for (const referral of pendingReferrals) {
            console.log('🔍 Completing referral:', referral.id);
            
            // Update referral status
            const { error: updateError } = await supabase
              .from('referrals')
              .update({ 
                referred_user_id: data.user.id,
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', referral.id);

            if (!updateError) {
              completedCount++;
              console.log('✅ Referral completed:', referral.id);
              
              // Credits will be awarded automatically by database trigger
              // Just update the referral status and the trigger handles the rest
              console.log('✅ Referral completed - credits will be awarded automatically by trigger');
            } else {
              console.log('❌ Error completing referral:', updateError);
            }
          }
          
          console.log('🎯 Completed referrals:', completedCount);
        } else {
          console.log('ℹ️ No pending referrals found for:', data.user.email);
        }
      } catch (referralError) {
        console.log('❌ Error in referral completion:', referralError);
      }
      
      redirect(next)
    }
  }

  // update profiles table on db

  redirect('/error')
}