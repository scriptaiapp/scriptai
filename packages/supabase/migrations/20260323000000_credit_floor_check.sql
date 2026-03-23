-- Prevent credits from going negative by rejecting insufficient balance
CREATE OR REPLACE FUNCTION public.update_user_credits(user_uuid uuid, credit_change integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF credit_change < 0 THEN
    -- Deduction: ensure sufficient balance
    UPDATE profiles
    SET credits = credits + credit_change,
        updated_at = NOW()
    WHERE user_id = user_uuid
      AND credits + credit_change >= 0;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient credits' USING ERRCODE = 'P0001';
    END IF;
  ELSE
    -- Addition: always allowed
    UPDATE profiles
    SET credits = credits + credit_change,
        updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
END;
$function$;
