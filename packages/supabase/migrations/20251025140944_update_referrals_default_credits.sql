CREATE OR REPLACE FUNCTION public.award_referral_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_profile_id UUID;
    current_credits INTEGER;
    current_referral_credits INTEGER;
    current_total_referrals INTEGER;
    credits_to_award INTEGER := 250;
BEGIN
    -- Only process when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Get the referrer's profile ID
        referrer_profile_id := NEW.referrer_id;
        
        -- Lock and get current values to prevent race conditions
        SELECT credits, referral_credits, total_referrals 
        INTO current_credits, current_referral_credits, current_total_referrals
        FROM profiles 
        WHERE id = referrer_profile_id
        FOR UPDATE;
        
        -- Handle NULL values safely
        current_credits := COALESCE(current_credits, 0);
        current_referral_credits := COALESCE(current_referral_credits, 0);
        current_total_referrals := COALESCE(current_total_referrals, 0);
        
        -- Update the profile with new credit values
        UPDATE profiles 
        SET 
            credits = current_credits + credits_to_award,
            referral_credits = current_referral_credits + credits_to_award,
            total_referrals = current_total_referrals + 1
        WHERE id = referrer_profile_id;
        
        -- Optional: Log the action for debugging
        RAISE NOTICE '✅ Awarded % credits to referrer % (Profile ID: %). New totals -> Credits: %, Referral Credits: %, Total Referrals: %', 
            credits_to_award,
            referrer_profile_id,
            referrer_profile_id,
            current_credits + credits_to_award,
            current_referral_credits + credits_to_award,
            current_total_referrals + 1;
    END IF;
    
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.award_referral_credits() OWNER TO postgres;
