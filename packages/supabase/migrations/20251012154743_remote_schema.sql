

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."award_referral_credits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    referrer_profile_id UUID;
    current_credits INTEGER;
    current_referral_credits INTEGER;
    current_total_referrals INTEGER;
    credits_to_award INTEGER := 5; -- 5 credits per successful referral
BEGIN
    -- Only process when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Get the referrer's profile ID
        referrer_profile_id := NEW.referrer_id;
        
        -- Get current credits, referral credits, and total referrals for the referrer
        SELECT credits, referral_credits, total_referrals 
        INTO current_credits, current_referral_credits, current_total_referrals
        FROM profiles 
        WHERE id = referrer_profile_id;
        
        -- Set defaults if NULL
        current_credits := COALESCE(current_credits, 0);
        current_referral_credits := COALESCE(current_referral_credits, 0);
        current_total_referrals := COALESCE(current_total_referrals, 0);
        
        -- Award credits to BOTH fields and increment total referrals
        UPDATE profiles 
        SET 
            credits = current_credits + credits_to_award,           -- Main credits field
            referral_credits = current_referral_credits + credits_to_award,  -- Referral credits field
            total_referrals = current_total_referrals + 1
        WHERE id = referrer_profile_id;
        
        -- Log the credit award
        RAISE NOTICE '✅ Awarded % credits to referrer % (Profile ID: %). New main credits: %, New referral credits: %, New total referrals: %', 
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


ALTER FUNCTION "public"."award_referral_credits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_expired_referrals"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE referrals 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."check_expired_referrals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_referral"("referral_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  referrer_uuid UUID;
  credits_to_award INTEGER := 5;
BEGIN
  -- Get the referrer ID and update referral status
  UPDATE referrals 
  SET status = 'completed', 
      completed_at = NOW(),
      credits_awarded = credits_to_award
  WHERE id = referral_id 
    AND status = 'pending'
  RETURNING referrer_id INTO referrer_uuid;
  
  -- If referral was updated, award credits to referrer
  IF FOUND THEN
    UPDATE profiles 
    SET referral_credits = referral_credits + credits_to_award
    WHERE user_id = referrer_uuid;
  END IF;
END;
$$;


ALTER FUNCTION "public"."complete_referral"("referral_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_referral_code"() RETURNS character varying
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_code VARCHAR(10);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 8-character code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, user_id, name, email, ai_trained)
  values (new.id, new.id, new.raw_user_meta_data->>'name', new.email, false);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_existing_referral_credits"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    referral_record RECORD;
    referrer_profile_id UUID;
    current_credits INTEGER;
    current_total_referrals INTEGER;
    credits_to_award INTEGER := 5;
    total_awarded INTEGER := 0;
BEGIN
    -- Process all existing completed referrals that haven't been credited
    FOR referral_record IN 
        SELECT r.id, r.referrer_id, r.status, r.credits_awarded
        FROM referrals r
        WHERE r.status = 'completed' 
        AND r.credits_awarded = 0
        ORDER BY r.completed_at
    LOOP
        
        referrer_profile_id := referral_record.referrer_id;
        
        -- Get current credits and total referrals
        SELECT referral_credits, total_referrals 
        INTO current_credits, current_total_referrals
        FROM profiles 
        WHERE id = referrer_profile_id;
        
        -- Set defaults if NULL
        current_credits := COALESCE(current_credits, 0);
        current_total_referrals := COALESCE(current_total_referrals, 0);
        
        -- Award credits and increment total referrals
        UPDATE profiles 
        SET 
            referral_credits = current_credits + credits_to_award,
            total_referrals = current_total_referrals + 1
        WHERE id = referrer_profile_id;
        
        -- Mark this referral as credited
        UPDATE referrals 
        SET credits_awarded = credits_to_award
        WHERE id = referral_record.id;
        
        total_awarded := total_awarded + 1;
        
        RAISE NOTICE '✅ Synced credits for referral %: Awarded % credits to referrer %', 
            referral_record.id, credits_to_award, referrer_profile_id;
            
    END LOOP;
    
    RAISE NOTICE '🎯 Total referrals synced: %', total_awarded;
END;
$$;


ALTER FUNCTION "public"."sync_existing_referral_credits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_credits"("user_uuid" "uuid", "credit_change" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles 
  SET credits = credits + credit_change,
      updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$;


ALTER FUNCTION "public"."update_user_credits"("user_uuid" "uuid", "credit_change" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_referral_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Allow completion if we're setting referred_user_id at the same time
    -- OR if referred_user_id is already set
    IF NEW.status = 'completed' THEN
        -- Ensure completed_at is set when status is 'completed'
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at := NOW();
        END IF;
        
        -- Ensure credits_awarded is set when status is 'completed'
        IF NEW.credits_awarded IS NULL THEN
            NEW.credits_awarded := 5; -- Default 5 credits
        END IF;
        
        -- Log the completion (fixed logging)
        RAISE NOTICE '✅ Referral % completed successfully', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_referral_completion"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."documentation_generations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "project_name" "text" NOT NULL,
    "files_processed" integer DEFAULT 0,
    "credits_consumed" integer DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "output_format" "text" DEFAULT 'markdown'::"text",
    "generation_time" integer,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documentation_generations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dubbing_projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "project_id" "text" NOT NULL,
    "original_audio_name" "text",
    "target_language" "text",
    "dubbed_url" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."dubbing_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "price_monthly" integer NOT NULL,
    "credits_monthly" integer NOT NULL,
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "full_name" "text",
    "email" "text",
    "bio" "text",
    "credits" integer DEFAULT 10,
    "ai_trained" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "youtube_connected" boolean DEFAULT false,
    "avatar_url" "text",
    "name" "text",
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "referral_code" character varying(10),
    "referred_by" character varying(10),
    "total_referrals" integer DEFAULT 0,
    "referral_credits" integer DEFAULT 0,
    "welcome_email_sent" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referrer_id" "uuid",
    "referred_user_id" "uuid",
    "referral_code" character varying(10) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "credits_awarded" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "referred_email" "text"
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."referrals_with_profiles" WITH ("security_invoker"='on') AS
 SELECT "r"."id",
    "r"."referrer_id",
    "r"."referred_user_id",
    "r"."referral_code",
    "r"."status",
    "r"."credits_awarded",
    "r"."created_at",
    "r"."completed_at",
    "p1"."email" AS "referrer_email",
    "p1"."full_name" AS "referrer_name",
    "p1"."referral_code" AS "referrer_referral_code",
    "p2"."email" AS "referred_email",
    "p2"."full_name" AS "referred_name",
    "p2"."referral_code" AS "referred_referral_code"
   FROM (("public"."referrals" "r"
     LEFT JOIN "public"."profiles" "p1" ON (("r"."referrer_id" = "p1"."id")))
     LEFT JOIN "public"."profiles" "p2" ON (("r"."referred_user_id" = "p2"."id")));


ALTER TABLE "public"."referrals_with_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."research_topics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "topic" "text" NOT NULL,
    "context" "text",
    "research_data" "jsonb",
    "sources" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."research_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scripts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "prompt" "text",
    "context" "text",
    "tone" "text",
    "include_storytelling" boolean DEFAULT false,
    "reference_links" "text",
    "language" "text" DEFAULT 'english'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "include_timestamps" boolean DEFAULT false NOT NULL,
    "duration" "text"
);


ALTER TABLE "public"."scripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "plan_id" "uuid",
    "stripe_subscription_id" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subtitle_jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "video_path" "text" NOT NULL,
    "video_url" "text",
    "subtitles_json" "jsonb",
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "detected_language" "text",
    "duration" numeric,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subtitle_jobs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'processing'::"text", 'done'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."subtitle_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subtitles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "subtitle_path" "text" NOT NULL,
    "format" "text" NOT NULL,
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subtitles_format_check" CHECK (("format" = ANY (ARRAY['srt'::"text", 'vtt'::"text", 'json'::"text"])))
);


ALTER TABLE "public"."subtitles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_credits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "credits_used" integer DEFAULT 0,
    "credits_remaining" integer DEFAULT 0,
    "period_start" timestamp with time zone DEFAULT "now"(),
    "period_end" timestamp with time zone DEFAULT ("now"() + '1 mon'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usage_credits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "email_notifications" "jsonb" DEFAULT '{"usage_alerts": true, "product_updates": false, "documentation_updates": true}'::"jsonb",
    "default_output_format" "text" DEFAULT 'markdown'::"text",
    "api_key_encrypted" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_style" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "tone" "text",
    "vocabulary_level" "text",
    "pacing" "text",
    "themes" "text",
    "humor_style" "text",
    "structure" "text",
    "video_urls" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "style_analysis" "text",
    "recommendations" "jsonb",
    "visual_style" "text",
    "audience_engagement" "text"[],
    "narrative_structure" "text",
    "content" "text",
    "embedding" "extensions"."vector"(768)
);


ALTER TABLE "public"."user_style" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youtube_channels" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "channel_id" "text" NOT NULL,
    "channel_name" "text",
    "channel_description" "text",
    "custom_url" "text",
    "country" "text",
    "default_language" "text",
    "view_count" bigint,
    "subscriber_count" bigint,
    "video_count" bigint,
    "topic_details" "jsonb",
    "provider_token" "text",
    "refresh_token" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published_at" timestamp with time zone,
    "thumbnail" "text",
    "is_linked" boolean,
    "text_color" "text",
    "background_color" "text"
);


ALTER TABLE "public"."youtube_channels" OWNER TO "postgres";


ALTER TABLE ONLY "public"."documentation_generations"
    ADD CONSTRAINT "documentation_generations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dubbing_projects"
    ADD CONSTRAINT "dubbing_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_referred_user_id_key" UNIQUE ("referrer_id", "referred_user_id");



ALTER TABLE ONLY "public"."research_topics"
    ADD CONSTRAINT "research_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scripts"
    ADD CONSTRAINT "scripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."subtitle_jobs"
    ADD CONSTRAINT "subtitle_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subtitles"
    ADD CONSTRAINT "subtitles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."youtube_channels"
    ADD CONSTRAINT "unique_user_channel" UNIQUE ("user_id", "channel_id");



ALTER TABLE ONLY "public"."user_style"
    ADD CONSTRAINT "unique_user_style_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."usage_credits"
    ADD CONSTRAINT "usage_credits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_style"
    ADD CONSTRAINT "user_style_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."youtube_channels"
    ADD CONSTRAINT "youtube_channels_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_profiles_referral_code" ON "public"."profiles" USING "btree" ("referral_code");



CREATE INDEX "idx_referrals_referral_code" ON "public"."referrals" USING "btree" ("referral_code");



CREATE INDEX "idx_referrals_referred_email" ON "public"."referrals" USING "btree" ("referred_email");



CREATE INDEX "idx_referrals_referred_user_id" ON "public"."referrals" USING "btree" ("referred_user_id");



CREATE INDEX "idx_referrals_referrer_id" ON "public"."referrals" USING "btree" ("referrer_id");



CREATE INDEX "idx_referrals_status" ON "public"."referrals" USING "btree" ("status");



CREATE INDEX "idx_research_topics_created_at" ON "public"."research_topics" USING "btree" ("created_at");



CREATE INDEX "idx_research_topics_user_id" ON "public"."research_topics" USING "btree" ("user_id");



CREATE INDEX "idx_subtitle_jobs_created_at" ON "public"."subtitle_jobs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_subtitle_jobs_status" ON "public"."subtitle_jobs" USING "btree" ("status");



CREATE INDEX "idx_subtitle_jobs_user_id" ON "public"."subtitle_jobs" USING "btree" ("user_id");



CREATE INDEX "idx_subtitles_job_id" ON "public"."subtitles" USING "btree" ("job_id");



CREATE INDEX "user_style_embedding_idx" ON "public"."user_style" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops");



CREATE OR REPLACE TRIGGER "handle_documentation_generations_updated_at" BEFORE UPDATE ON "public"."documentation_generations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_usage_credits_updated_at" BEFORE UPDATE ON "public"."usage_credits" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_award_referral_credits" AFTER UPDATE ON "public"."referrals" FOR EACH ROW EXECUTE FUNCTION "public"."award_referral_credits"();



CREATE OR REPLACE TRIGGER "trigger_validate_referral_completion" BEFORE UPDATE ON "public"."referrals" FOR EACH ROW EXECUTE FUNCTION "public"."validate_referral_completion"();



CREATE OR REPLACE TRIGGER "update_subtitle_jobs_updated_at" BEFORE UPDATE ON "public"."subtitle_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."dubbing_projects"
    ADD CONSTRAINT "dubbing_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "public"."profiles"("referral_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."research_topics"
    ADD CONSTRAINT "research_topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scripts"
    ADD CONSTRAINT "scripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."subtitle_jobs"
    ADD CONSTRAINT "subtitle_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subtitles"
    ADD CONSTRAINT "subtitles_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."subtitle_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_style"
    ADD CONSTRAINT "user_style_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."youtube_channels"
    ADD CONSTRAINT "youtube_channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all referral operations" ON "public"."referrals" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticator to update profiles" ON "public"."profiles" FOR UPDATE TO "authenticator" USING (true);



CREATE POLICY "Allow delete own topics" ON "public"."research_topics" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow insert for authenticated users" ON "public"."dubbing_projects" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow insert for authenticated users" ON "public"."research_topics" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow inserting referrals" ON "public"."referrals" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow referral code lookups" ON "public"."profiles" FOR SELECT USING (("referral_code" IS NOT NULL));



CREATE POLICY "Allow select for own projects" ON "public"."dubbing_projects" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow select for own topics" ON "public"."research_topics" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow updating referrals" ON "public"."referrals" FOR UPDATE USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can access their own style" ON "public"."user_style" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own generations" ON "public"."documentation_generations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own subtitle jobs" ON "public"."subtitle_jobs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own scripts" ON "public"."scripts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own settings" ON "public"."user_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own subtitle jobs" ON "public"."subtitle_jobs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own subtitles" ON "public"."subtitles" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."subtitle_jobs"
  WHERE (("subtitle_jobs"."id" = "subtitles"."job_id") AND ("subtitle_jobs"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own channel data" ON "public"."youtube_channels" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own scripts" ON "public"."scripts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own style data" ON "public"."user_style" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own generations" ON "public"."documentation_generations" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own settings" ON "public"."user_settings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own subtitle jobs" ON "public"."subtitle_jobs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own usage" ON "public"."usage_credits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own channel data" ON "public"."youtube_channels" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own scripts" ON "public"."scripts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own style data" ON "public"."user_style" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own generations" ON "public"."documentation_generations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own settings" ON "public"."user_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subtitle jobs" ON "public"."subtitle_jobs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subtitles" ON "public"."subtitles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."subtitle_jobs"
  WHERE (("subtitle_jobs"."id" = "subtitles"."job_id") AND ("subtitle_jobs"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own usage" ON "public"."usage_credits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own channel data" ON "public"."youtube_channels" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own scripts" ON "public"."scripts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own style data" ON "public"."user_style" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."documentation_generations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dubbing_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."research_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subtitle_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subtitles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_credits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_style" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."youtube_channels" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."award_referral_credits"() TO "anon";
GRANT ALL ON FUNCTION "public"."award_referral_credits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_referral_credits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_expired_referrals"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_expired_referrals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_expired_referrals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_referral"("referral_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_referral"("referral_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_referral"("referral_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_existing_referral_credits"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_existing_referral_credits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_existing_referral_credits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_credits"("user_uuid" "uuid", "credit_change" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_credits"("user_uuid" "uuid", "credit_change" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_credits"("user_uuid" "uuid", "credit_change" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_referral_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_referral_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_referral_completion"() TO "service_role";






























GRANT ALL ON TABLE "public"."documentation_generations" TO "anon";
GRANT ALL ON TABLE "public"."documentation_generations" TO "authenticated";
GRANT ALL ON TABLE "public"."documentation_generations" TO "service_role";



GRANT ALL ON TABLE "public"."dubbing_projects" TO "anon";
GRANT ALL ON TABLE "public"."dubbing_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."dubbing_projects" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."referrals_with_profiles" TO "anon";
GRANT ALL ON TABLE "public"."referrals_with_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals_with_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."research_topics" TO "anon";
GRANT ALL ON TABLE "public"."research_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."research_topics" TO "service_role";



GRANT ALL ON TABLE "public"."scripts" TO "anon";
GRANT ALL ON TABLE "public"."scripts" TO "authenticated";
GRANT ALL ON TABLE "public"."scripts" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."subtitle_jobs" TO "anon";
GRANT ALL ON TABLE "public"."subtitle_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."subtitle_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."subtitles" TO "anon";
GRANT ALL ON TABLE "public"."subtitles" TO "authenticated";
GRANT ALL ON TABLE "public"."subtitles" TO "service_role";



GRANT ALL ON TABLE "public"."usage_credits" TO "anon";
GRANT ALL ON TABLE "public"."usage_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_credits" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_style" TO "anon";
GRANT ALL ON TABLE "public"."user_style" TO "authenticated";
GRANT ALL ON TABLE "public"."user_style" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_channels" TO "anon";
GRANT ALL ON TABLE "public"."youtube_channels" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_channels" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


  create policy "user can upload there avatar 1o1s1n1_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'user_avatar'::text));



  create policy "user can upload there avatar 1o1s1n1_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'user_avatar'::text) AND (storage.filename(name) ~ '.*\.(jpg|jpeg|png|gif|bmp|webp);
::text)));



  create policy "user can upload there avatar 1o1s1n1_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'user_avatar'::text));



  create policy "user can upload there avatar 1o1s1n1_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'user_avatar'::text));



