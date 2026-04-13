-- Affiliate requests: users apply to become affiliates
CREATE TABLE IF NOT EXISTS public.affiliate_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  website text,
  social_media text,
  audience_size text,
  promotion_method text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT affiliate_requests_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_requests_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_requests_reviewer_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT affiliate_requests_status_check CHECK (status IN ('pending', 'approved', 'denied'))
);

ALTER TABLE public.affiliate_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_affiliate_requests_user ON public.affiliate_requests USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_requests_status ON public.affiliate_requests USING btree (status);
CREATE INDEX IF NOT EXISTS idx_affiliate_requests_created_at ON public.affiliate_requests USING btree (created_at DESC);

-- Add LS affiliate ID to affiliate_links for syncing with Lemon Squeezy
ALTER TABLE public.affiliate_links
  ADD COLUMN IF NOT EXISTS ls_affiliate_id text;

CREATE INDEX IF NOT EXISTS idx_affiliate_links_ls_id ON public.affiliate_links USING btree (ls_affiliate_id);

-- RLS Policies for affiliate_requests
CREATE POLICY "Users can view own affiliate requests"
  ON public.affiliate_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own affiliate requests"
  ON public.affiliate_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all affiliate requests"
  ON public.affiliate_requests FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER update_affiliate_requests_updated_at
  BEFORE UPDATE ON public.affiliate_requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
