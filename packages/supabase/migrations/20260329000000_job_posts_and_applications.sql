-- Job posts table
CREATE TABLE IF NOT EXISTS public.job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  team text NOT NULL,
  location text NOT NULL DEFAULT 'Remote',
  type text NOT NULL DEFAULT 'Full-time',
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('engineering', 'ai', 'design', 'marketing', 'business', 'other')),
  description text NOT NULL,
  requirements text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id uuid REFERENCES public.job_posts(id) ON DELETE SET NULL,
  position text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  linkedin_url text NOT NULL,
  github_url text,
  portfolio_url text,
  resume_file_path text,
  cover_letter_file_path text,
  experience text NOT NULL,
  problem_solving text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON public.job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_category ON public.job_posts(category);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_post_id ON public.job_applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at DESC);

-- Enable RLS
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Public read for active job posts
CREATE POLICY "Anyone can view active job posts"
  ON public.job_posts FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Service role full access
CREATE POLICY "Service role full access job_posts"
  ON public.job_posts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access job_applications"
  ON public.job_applications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Allow anonymous inserts for applications (public form)
CREATE POLICY "Anyone can submit job applications"
  ON public.job_applications FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_job_posts_updated_at') THEN
    CREATE TRIGGER set_job_posts_updated_at
      BEFORE UPDATE ON public.job_posts
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_job_applications_updated_at') THEN
    CREATE TRIGGER set_job_applications_updated_at
      BEFORE UPDATE ON public.job_applications
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Storage bucket for application files (resume, cover letter PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-applications', 'job-applications', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload to job-applications"
  ON storage.objects FOR INSERT TO anon, authenticated, service_role
  WITH CHECK (bucket_id = 'job-applications');

CREATE POLICY "Anyone can read job-applications"
  ON storage.objects FOR SELECT TO anon, authenticated, service_role
  USING (bucket_id = 'job-applications');

CREATE POLICY "Service role can manage job-applications"
  ON storage.objects FOR DELETE TO service_role
  USING (bucket_id = 'job-applications');

-- Seed job posts
INSERT INTO public.job_posts (title, team, location, type, category, description, requirements) VALUES
  ('Senior Full-Stack Engineer', 'Engineering', 'Remote', 'Full-time', 'engineering',
   'Build and scale our core platform using Next.js, NestJS, and AI integrations. You''ll work across the stack on features used by thousands of creators.',
   'Strong proficiency in TypeScript, React/Next.js, and Node.js. Experience with PostgreSQL, Redis, and cloud infrastructure. Familiarity with AI/ML APIs is a plus.'),
  ('AI / ML Engineer', 'AI', 'Remote', 'Full-time', 'ai',
   'Design and improve our AI training pipeline, personalization models, and content generation systems. Experience with LLMs and fine-tuning required.',
   'Deep experience with Python, PyTorch/TensorFlow, and LLM fine-tuning. Understanding of RAG, embeddings, and production ML systems. Published research is a bonus.'),
  ('Product Designer', 'Design', 'Remote', 'Full-time', 'design',
   'Own the end-to-end design of our product — from research to wireframes to polished UI. Work closely with engineers and talk to real users weekly.',
   'Strong portfolio demonstrating product design skills. Proficiency in Figma. Experience with design systems and user research methodologies.'),
  ('Content Marketing Lead', 'Marketing', 'Remote', 'Full-time', 'marketing',
   'Own our blog, social presence, and content strategy. Create content that helps YouTubers grow while driving awareness for Creator AI.',
   'Proven track record in content marketing, preferably in SaaS or creator economy. Strong writing skills, SEO knowledge, and social media expertise.'),
  ('Co-Founder', 'Business', 'US Only', 'Full-time', 'business',
   'Join as a Co-Founder to lead business strategy, sales, and marketing for Creator AI. We''re looking for a driven leader who is passionate about AI and the creator economy to help take the company to the next level.',
   'Must be based in the US. Hands-on experience in business development, sales, and marketing. Must be an AI enthusiast or have experience building/scaling similar AI-based products. Startup experience strongly preferred. Strong network in the tech/creator space is a plus.')
ON CONFLICT DO NOTHING;
