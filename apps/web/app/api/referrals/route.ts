import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Fetch user's referral data
export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral code and stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, referral_code, total_referrals, referral_credits, full_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    // Get pending referrals
    const { data: pendingReferrals, error: pendingError } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_user_id,
        status,
        created_at,
        referred_email
      `)
      .eq('referrer_id', profile.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('Error fetching pending referrals:', pendingError);
    }

    // Get completed referrals with full user info
    const { data: completedReferrals, error: completedError } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_user_id,
        status,
        credits_awarded,
        created_at,
        completed_at,
        referred_email,
        referred_user:profiles!referrals_referred_user_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq('referrer_id', profile.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (completedError) {
      console.error('Error fetching completed referrals:', completedError);
    }

    return NextResponse.json({
      referralCode: profile.referral_code,
      totalReferrals: profile.total_referrals,
      referralCredits: profile.referral_credits,
      userProfile: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      },
      pendingReferrals: pendingReferrals || [],
      completedReferrals: completedReferrals || []
    });

  } catch (error) {
    console.error('Error in GET referrals:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Generate new referral code for user
export async function POST() {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique referral code
    const referralCode = generateReferralCode();
    
    // Update user's profile with referral code
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ message: 'Failed to generate referral code' }, { status: 500 });
    }

    return NextResponse.json({ referralCode });

  } catch (error) {
    console.error('Error in POST referrals:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
