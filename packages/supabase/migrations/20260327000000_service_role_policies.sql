-- Add explicit service_role full-access policies for tables that workers update.
-- service_role bypasses RLS by default, but explicit policies ensure
-- consistent behavior and match the pattern used by story_builder_jobs and ideation_jobs.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'thumbnail_jobs' AND policyname = 'Allow service role full access thumbnail_jobs'
  ) THEN
    CREATE POLICY "Allow service role full access thumbnail_jobs"
    ON "public"."thumbnail_jobs" AS permissive FOR ALL TO service_role
    USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scripts' AND policyname = 'Allow service role full access scripts'
  ) THEN
    CREATE POLICY "Allow service role full access scripts"
    ON "public"."scripts" AS permissive FOR ALL TO service_role
    USING (true) WITH CHECK (true);
  END IF;
END $$;
