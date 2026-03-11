-- Admin Panel RBAC Migration
-- Adds role-based access control with Admin and Sales Rep roles

-- 1. Create role enum type
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'sales_rep');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);

-- 3. Blog posts table (admin-managed)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug),
  CONSTRAINT blog_posts_author_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts USING btree (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts USING btree (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts USING btree (published_at DESC);

-- 4. Activities / audit log table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_actor_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activities_actor ON public.activities USING btree (actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_action ON public.activities USING btree (action);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON public.activities USING btree (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities USING btree (created_at DESC);

-- 5. Affiliate links table
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sales_rep_id uuid NOT NULL,
  code text NOT NULL,
  label text,
  target_url text NOT NULL DEFAULT '/',
  commission_rate numeric(5,2) NOT NULL DEFAULT 10.00,
  click_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT affiliate_links_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_links_code_key UNIQUE (code),
  CONSTRAINT affiliate_links_rep_fkey FOREIGN KEY (sales_rep_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_links_commission_check CHECK (commission_rate >= 0 AND commission_rate <= 100)
);

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_affiliate_links_rep ON public.affiliate_links USING btree (sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON public.affiliate_links USING btree (code);

-- 6. Affiliate sales / conversions table
CREATE TABLE IF NOT EXISTS public.affiliate_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_link_id uuid NOT NULL,
  sales_rep_id uuid NOT NULL,
  customer_id uuid,
  customer_email text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  commission numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  subscription_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT affiliate_sales_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_sales_link_fkey FOREIGN KEY (affiliate_link_id) REFERENCES affiliate_links(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_sales_rep_fkey FOREIGN KEY (sales_rep_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_sales_customer_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT affiliate_sales_status_check CHECK (status IN ('pending', 'confirmed', 'paid', 'refunded'))
);

ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_affiliate_sales_rep ON public.affiliate_sales USING btree (sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_link ON public.affiliate_sales USING btree (affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_status ON public.affiliate_sales USING btree (status);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_created_at ON public.affiliate_sales USING btree (created_at DESC);

-- 7. Invited users table (sales rep invitations)
CREATE TABLE IF NOT EXISTS public.invited_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invited_by uuid NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  affiliate_link_id uuid,
  registered_user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT invited_users_pkey PRIMARY KEY (id),
  CONSTRAINT invited_users_inviter_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT invited_users_link_fkey FOREIGN KEY (affiliate_link_id) REFERENCES affiliate_links(id) ON DELETE SET NULL,
  CONSTRAINT invited_users_registered_fkey FOREIGN KEY (registered_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT invited_users_status_check CHECK (status IN ('pending', 'registered', 'subscribed', 'expired'))
);

ALTER TABLE public.invited_users ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invited_users_inviter ON public.invited_users USING btree (invited_by);
CREATE INDEX IF NOT EXISTS idx_invited_users_email ON public.invited_users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_invited_users_status ON public.invited_users USING btree (status);

-- 8. Contact/mail messages table (for admin mail management)
CREATE TABLE IF NOT EXISTS public.mail_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_email text NOT NULL,
  from_name text,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  replied_at timestamptz,
  replied_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT mail_messages_pkey PRIMARY KEY (id),
  CONSTRAINT mail_messages_status_check CHECK (status IN ('unread', 'read', 'replied', 'archived'))
);

ALTER TABLE public.mail_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_mail_messages_status ON public.mail_messages USING btree (status);
CREATE INDEX IF NOT EXISTS idx_mail_messages_created_at ON public.mail_messages USING btree (created_at DESC);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- Helper function to check if current user is sales_rep
CREATE OR REPLACE FUNCTION public.is_sales_rep()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'sales_rep');
$$;

-- == PROFILES: Admin can read/update all profiles ==
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (is_admin());

-- == BLOG POSTS ==
CREATE POLICY "Published blogs are public"
  ON public.blog_posts FOR SELECT TO public
  USING (status = 'published');

CREATE POLICY "Admins can manage all blogs"
  ON public.blog_posts FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- == ACTIVITIES ==
CREATE POLICY "Admins can view all activities"
  ON public.activities FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated users can insert activities"
  ON public.activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- == AFFILIATE LINKS ==
CREATE POLICY "Admins can manage all affiliate links"
  ON public.affiliate_links FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Sales reps can view own affiliate links"
  ON public.affiliate_links FOR SELECT TO authenticated
  USING (sales_rep_id = auth.uid());

CREATE POLICY "Sales reps can create own affiliate links"
  ON public.affiliate_links FOR INSERT TO authenticated
  WITH CHECK (sales_rep_id = auth.uid() AND is_sales_rep());

CREATE POLICY "Sales reps can update own affiliate links"
  ON public.affiliate_links FOR UPDATE TO authenticated
  USING (sales_rep_id = auth.uid() AND is_sales_rep());

-- == AFFILIATE SALES ==
CREATE POLICY "Admins can manage all affiliate sales"
  ON public.affiliate_sales FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Sales reps can view own sales"
  ON public.affiliate_sales FOR SELECT TO authenticated
  USING (sales_rep_id = auth.uid());

-- == INVITED USERS ==
CREATE POLICY "Admins can view all invitations"
  ON public.invited_users FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Sales reps can manage own invitations"
  ON public.invited_users FOR ALL TO authenticated
  USING (invited_by = auth.uid() AND is_sales_rep())
  WITH CHECK (invited_by = auth.uid() AND is_sales_rep());

-- == MAIL MESSAGES ==
CREATE POLICY "Admins can manage all mail"
  ON public.mail_messages FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Anyone can insert mail messages"
  ON public.mail_messages FOR INSERT TO public
  WITH CHECK (true);

-- == SUBSCRIPTIONS: Admin can view all ==
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (is_admin());

-- == Updated_at triggers for new tables ==
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_affiliate_sales_updated_at
  BEFORE UPDATE ON public.affiliate_sales
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_invited_users_updated_at
  BEFORE UPDATE ON public.invited_users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- == Views for admin dashboard stats ==
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT count(*) FROM public.profiles) AS total_users,
  (SELECT count(*) FROM public.profiles WHERE role = 'sales_rep') AS total_sales_reps,
  (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '30 days') AS new_users_30d,
  (SELECT count(*) FROM public.subscriptions WHERE status = 'active') AS active_subscriptions,
  (SELECT count(*) FROM public.blog_posts WHERE status = 'published') AS published_blogs,
  (SELECT count(*) FROM public.affiliate_sales WHERE status = 'confirmed') AS total_sales,
  (SELECT COALESCE(sum(amount), 0) FROM public.affiliate_sales WHERE status IN ('confirmed', 'paid')) AS total_revenue,
  (SELECT count(*) FROM public.mail_messages WHERE status = 'unread') AS unread_mails;
