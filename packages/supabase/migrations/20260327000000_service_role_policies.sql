-- Add explicit service_role full-access policies for tables that workers update.
-- service_role bypasses RLS by default, but explicit policies ensure
-- consistent behavior and match the pattern used by story_builder_jobs and ideation_jobs.

CREATE POLICY IF NOT EXISTS "Allow service role full access thumbnail_jobs"
ON "public"."thumbnail_jobs"
AS permissive
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow service role full access scripts"
ON "public"."scripts"
AS permissive
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
