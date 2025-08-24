import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { referralCode, userEmail } = await request.json();
    
    // This API can be called during signup, so we don't require authentication
    // The user might not be logged in yet when this is called

    if (!referralCode || !userEmail) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Debug: Check what the API can see in the database
    console.log('🔍 API Debug: Checking database connection...');
    
    const { data: allProfiles, error: debugError } = await supabase
      .from('profiles')
      .select('email, referral_code')
      .limit(5);
    
    console.log('🔍 API Debug: First 5 profiles:', allProfiles);
    console.log('🔍 API Debug: Debug error:', debugError);

    // Find referrer by referral code
    console.log('🔍 Looking for referral code:', referralCode);
    
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, user_id, referral_code, total_referrals')
      .eq('referral_code', referralCode)
      .single();

    console.log('🔍 Referral lookup result:', { referrer, referrerError });

    if (referrerError || !referrer) {
      console.log('❌ Referral code not found:', referralCode);
      console.log('❌ Error details:', referrerError);
      return NextResponse.json({ message: 'Invalid referral code' }, { status: 400 });
    }

    // Find referred user by email - they might not have a profile yet (during signup)
    let referredUserId = null;
    
    // First try to find existing profile
    const { data: referredUser, error: userError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('email', userEmail)
      .single();

    if (referredUser) {
      // User has a profile, use their user_id
      referredUserId = referredUser.user_id;
    } else {
      // User doesn't have a profile yet (during signup)
      // We'll create a pending referral that gets completed when they verify email
      // For now, we'll use a temporary approach - store the email and complete later
      console.log('User profile not found yet, creating pending referral for:', userEmail);
    }

    // Check if referral already exists (only if we have a referred user ID)
    if (referredUserId) {
      const { data: existingReferral, error: checkError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrer.id)
        .eq('referred_user_id', referredUserId)
        .single();

      if (existingReferral) {
        return NextResponse.json({ message: 'Referral already exists' }, { status: 409 });
      }
    }

    // Create referral record
    const referralData: any = {
      referrer_id: referrer.id,
      referral_code: referralCode,
      status: 'pending',
      referred_email: userEmail  // Always store the email
    };

    // Only add referred_user_id if we have it
    if (referredUserId) {
      referralData.referred_user_id = referredUserId;
    }

    console.log('🔍 Creating referral with data:', referralData);

    const { data: createdReferral, error: createError } = await supabase
      .from('referrals')
      .insert(referralData)
      .select();

    console.log('🔍 Referral creation result:', { createdReferral, createError });

    if (createError) {
      console.log('❌ Failed to create referral:', createError);
      console.log('❌ Error details:', JSON.stringify(createError, null, 2));
      return NextResponse.json({ message: 'Failed to create referral' }, { status: 500 });
    }

    // Update referrer's total referrals count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_referrals: (referrer.total_referrals || 0) + 1 })
      .eq('user_id', referrer.user_id);

    if (updateError) {
      console.error('Error updating referrer count:', updateError);
    }

    return NextResponse.json({ message: 'Referral tracked successfully' });

  } catch (error) {
    console.error('Error in track-referral:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
