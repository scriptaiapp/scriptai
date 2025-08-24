import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ message: 'Missing user email' }, { status: 400 });
    }

    // Find the user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('email', userEmail)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    // Find pending referrals for this user's email
    const { data: pendingReferrals, error: pendingError } = await supabase
      .from('referrals')
      .select('*')
      .eq('status', 'pending')
      .eq('referred_email', userEmail);

    if (pendingError) {
      console.error('Error finding pending referrals:', pendingError);
      return NextResponse.json({ message: 'Error finding pending referrals' }, { status: 500 });
    }

    let completedCount = 0;

    // Complete each pending referral for this user
    for (const referral of pendingReferrals || []) {
      // Check if this referral was for this user's email
      // We'll need to store the email in the referral record or use a different approach
      // For now, let's update the referral with the user's ID
      
      const { error: updateError } = await supabase
        .from('referrals')
        .update({ 
          referred_user_id: userProfile.user_id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      if (!updateError) {
        completedCount++;
        
        // Award credits to the referrer and update total referrals
        const { error: creditError } = await supabase
          .from('profiles')
          .update({ 
            referral_credits: (referral.credits_awarded || 0) + 5,  // Award 5 credits for completed referral
            total_referrals: (referral.total_referrals || 0) + 1    // Increment total referrals count
          })
          .eq('user_id', referral.referrer_id);

        if (creditError) {
          console.error('Error awarding credits:', creditError);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Pending referrals completed', 
      completedCount 
    });

  } catch (error) {
    console.error('Error in complete-pending-referral:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
