-- Update referral credits from 5 to 250 across all trigger functions

CREATE OR REPLACE FUNCTION public.award_referral_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  credits_to_award INTEGER := 250;
  referrer_profile_id UUID;
  current_credits INTEGER;
  current_referral_credits INTEGER;
BEGIN
  -- Only award credits when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    referrer_profile_id := NEW.referrer_id;

    SELECT credits, referral_credits
      INTO current_credits, current_referral_credits
      FROM public.profiles
     WHERE id = referrer_profile_id;

    IF FOUND THEN
      UPDATE public.profiles
         SET credits           = current_credits + credits_to_award,
             referral_credits  = current_referral_credits + credits_to_award,
             total_referrals   = total_referrals + 1,
             updated_at        = NOW()
       WHERE id = referrer_profile_id;
    END IF;

    -- Ensure credits_awarded is set on the referral row
    IF NEW.credits_awarded IS NULL OR NEW.credits_awarded = 0 THEN
      NEW.credits_awarded := credits_to_award;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
