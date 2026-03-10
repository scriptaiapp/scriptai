
ALTER TABLE IF EXISTS "public"."subscriptions"
  ADD COLUMN IF NOT EXISTS "ls_subscription_id" text;

ALTER TABLE IF EXISTS "public"."subscriptions"
  ADD COLUMN IF NOT EXISTS "ls_customer_id" text;

-- Ensure Lemon Squeezy column on plans
ALTER TABLE IF EXISTS "public"."plans"
  ADD COLUMN IF NOT EXISTS "ls_variant_id" text;

-- Drop old index, create new one
DROP INDEX IF EXISTS idx_subscriptions_stripe_customer_id;

CREATE INDEX IF NOT EXISTS idx_subscriptions_ls_customer_id
  ON public.subscriptions (ls_customer_id)
  WHERE ls_customer_id IS NOT NULL;

-- Add Lemon Squeezy-specific columns
ALTER TABLE IF EXISTS "public"."subscriptions"
  ADD COLUMN IF NOT EXISTS "ls_order_id" text;

-- Rename unique constraint for clarity
ALTER INDEX IF EXISTS subscriptions_stripe_subscription_id_key
  RENAME TO subscriptions_ls_subscription_id_key;

-- Nullify old values (Stripe IDs are not valid for Lemon Squeezy)
UPDATE "public"."subscriptions" SET ls_subscription_id = NULL, ls_customer_id = NULL;
UPDATE "public"."plans" SET ls_variant_id = NULL;
