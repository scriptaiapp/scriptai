create table "public"."profiles" (
    "id" uuid not null,
    "user_id" uuid,
    "name" text,
    "email" text,
    "credits" integer default 10,
    "ai_trained" boolean default false,
    "referral_code" character varying(10),
    "referred_by" character varying(10),
    "total_referrals" integer default 0,
    "referral_credits" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "avatar_url" text,
    "full_name" text,
    "youtube_connected" boolean,
    "language" text
);


alter table "public"."profiles" enable row level security;

create table "public"."referrals" (
    "id" uuid not null default uuid_generate_v4(),
    "referrer_id" uuid,
    "referred_user_id" uuid,
    "referral_code" character varying(10) not null,
    "status" character varying(20) default 'pending'::character varying,
    "credits_awarded" integer default 0,
    "created_at" timestamp with time zone default now(),
    "completed_at" timestamp with time zone
);


alter table "public"."referrals" enable row level security;

create table "public"."scripts" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "title" text not null,
    "content" text not null,
    "prompt" text,
    "context" text,
    "tone" text,
    "include_storytelling" boolean default false,
    "script_references" text,
    "language" text default 'english'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."scripts" enable row level security;

create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default auth.uid(),
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "subscription_type" text default ''::text,
    "subscription_end_date" timestamp with time zone
);


create table "public"."user_style" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "tone" text,
    "vocabulary_level" text,
    "pacing" text,
    "themes" text,
    "humor_style" text,
    "structure" text,
    "video_urls" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_style" enable row level security;

create table "public"."youtube_channels" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "channel_id" text not null,
    "channel_name" text,
    "channel_description" text,
    "custom_url" text,
    "published_at" timestamp with time zone,
    "country" text,
    "thumbnail" text,
    "default_language" text,
    "view_count" bigint,
    "subscriber_count" bigint,
    "video_count" bigint,
    "is_linked" boolean,
    "text_color" text,
    "background_color" text,
    "topic_details" jsonb,
    "updated_at" timestamp with time zone default now()
);


alter table "public"."youtube_channels" enable row level security;

CREATE INDEX idx_profiles_referral_code ON public.profiles USING btree (referral_code);

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);

CREATE INDEX idx_referrals_referred_user_id ON public.referrals USING btree (referred_user_id);

CREATE INDEX idx_referrals_referrer_id ON public.referrals USING btree (referrer_id);

CREATE INDEX idx_scripts_user_id ON public.scripts USING btree (user_id);

CREATE INDEX idx_user_style_user_id ON public.user_style USING btree (user_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_referral_code_key ON public.profiles USING btree (referral_code);

CREATE UNIQUE INDEX referrals_pkey ON public.referrals USING btree (id);

CREATE UNIQUE INDEX referrals_referrer_id_referred_user_id_key ON public.referrals USING btree (referrer_id, referred_user_id);

CREATE UNIQUE INDEX scripts_pkey ON public.scripts USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX unique_user_channel ON public.youtube_channels USING btree (user_id, channel_id);

CREATE UNIQUE INDEX user_style_pkey ON public.user_style USING btree (id);

CREATE UNIQUE INDEX youtube_channels_pkey ON public.youtube_channels USING btree (id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."referrals" add constraint "referrals_pkey" PRIMARY KEY using index "referrals_pkey";

alter table "public"."scripts" add constraint "scripts_pkey" PRIMARY KEY using index "scripts_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."user_style" add constraint "user_style_pkey" PRIMARY KEY using index "user_style_pkey";

alter table "public"."youtube_channels" add constraint "youtube_channels_pkey" PRIMARY KEY using index "youtube_channels_pkey";

alter table "public"."profiles" add constraint "fk_referred_by" FOREIGN KEY (referred_by) REFERENCES profiles(referral_code) not valid;

alter table "public"."profiles" validate constraint "fk_referred_by";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_referral_code_key" UNIQUE using index "profiles_referral_code_key";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."referrals" add constraint "referrals_referred_user_id_fkey" FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."referrals" validate constraint "referrals_referred_user_id_fkey";

alter table "public"."referrals" add constraint "referrals_referrer_id_fkey" FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."referrals" validate constraint "referrals_referrer_id_fkey";

alter table "public"."referrals" add constraint "referrals_referrer_id_referred_user_id_key" UNIQUE using index "referrals_referrer_id_referred_user_id_key";

alter table "public"."scripts" add constraint "scripts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."scripts" validate constraint "scripts_user_id_fkey";

alter table "public"."user_style" add constraint "user_style_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_style" validate constraint "user_style_user_id_fkey";

alter table "public"."youtube_channels" add constraint "unique_user_channel" UNIQUE using index "unique_user_channel";

alter table "public"."youtube_channels" add constraint "youtube_channels_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."youtube_channels" validate constraint "youtube_channels_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email)
  VALUES (NEW.id, NEW.id, NEW.email);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."referrals" to "anon";

grant insert on table "public"."referrals" to "anon";

grant references on table "public"."referrals" to "anon";

grant select on table "public"."referrals" to "anon";

grant trigger on table "public"."referrals" to "anon";

grant truncate on table "public"."referrals" to "anon";

grant update on table "public"."referrals" to "anon";

grant delete on table "public"."referrals" to "authenticated";

grant insert on table "public"."referrals" to "authenticated";

grant references on table "public"."referrals" to "authenticated";

grant select on table "public"."referrals" to "authenticated";

grant trigger on table "public"."referrals" to "authenticated";

grant truncate on table "public"."referrals" to "authenticated";

grant update on table "public"."referrals" to "authenticated";

grant delete on table "public"."referrals" to "service_role";

grant insert on table "public"."referrals" to "service_role";

grant references on table "public"."referrals" to "service_role";

grant select on table "public"."referrals" to "service_role";

grant trigger on table "public"."referrals" to "service_role";

grant truncate on table "public"."referrals" to "service_role";

grant update on table "public"."referrals" to "service_role";

grant delete on table "public"."scripts" to "anon";

grant insert on table "public"."scripts" to "anon";

grant references on table "public"."scripts" to "anon";

grant select on table "public"."scripts" to "anon";

grant trigger on table "public"."scripts" to "anon";

grant truncate on table "public"."scripts" to "anon";

grant update on table "public"."scripts" to "anon";

grant delete on table "public"."scripts" to "authenticated";

grant insert on table "public"."scripts" to "authenticated";

grant references on table "public"."scripts" to "authenticated";

grant select on table "public"."scripts" to "authenticated";

grant trigger on table "public"."scripts" to "authenticated";

grant truncate on table "public"."scripts" to "authenticated";

grant update on table "public"."scripts" to "authenticated";

grant delete on table "public"."scripts" to "service_role";

grant insert on table "public"."scripts" to "service_role";

grant references on table "public"."scripts" to "service_role";

grant select on table "public"."scripts" to "service_role";

grant trigger on table "public"."scripts" to "service_role";

grant truncate on table "public"."scripts" to "service_role";

grant update on table "public"."scripts" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."user_style" to "anon";

grant insert on table "public"."user_style" to "anon";

grant references on table "public"."user_style" to "anon";

grant select on table "public"."user_style" to "anon";

grant trigger on table "public"."user_style" to "anon";

grant truncate on table "public"."user_style" to "anon";

grant update on table "public"."user_style" to "anon";

grant delete on table "public"."user_style" to "authenticated";

grant insert on table "public"."user_style" to "authenticated";

grant references on table "public"."user_style" to "authenticated";

grant select on table "public"."user_style" to "authenticated";

grant trigger on table "public"."user_style" to "authenticated";

grant truncate on table "public"."user_style" to "authenticated";

grant update on table "public"."user_style" to "authenticated";

grant delete on table "public"."user_style" to "service_role";

grant insert on table "public"."user_style" to "service_role";

grant references on table "public"."user_style" to "service_role";

grant select on table "public"."user_style" to "service_role";

grant trigger on table "public"."user_style" to "service_role";

grant truncate on table "public"."user_style" to "service_role";

grant update on table "public"."user_style" to "service_role";

grant delete on table "public"."youtube_channels" to "anon";

grant insert on table "public"."youtube_channels" to "anon";

grant references on table "public"."youtube_channels" to "anon";

grant select on table "public"."youtube_channels" to "anon";

grant trigger on table "public"."youtube_channels" to "anon";

grant truncate on table "public"."youtube_channels" to "anon";

grant update on table "public"."youtube_channels" to "anon";

grant delete on table "public"."youtube_channels" to "authenticated";

grant insert on table "public"."youtube_channels" to "authenticated";

grant references on table "public"."youtube_channels" to "authenticated";

grant select on table "public"."youtube_channels" to "authenticated";

grant trigger on table "public"."youtube_channels" to "authenticated";

grant truncate on table "public"."youtube_channels" to "authenticated";

grant update on table "public"."youtube_channels" to "authenticated";

grant delete on table "public"."youtube_channels" to "service_role";

grant insert on table "public"."youtube_channels" to "service_role";

grant references on table "public"."youtube_channels" to "service_role";

grant select on table "public"."youtube_channels" to "service_role";

grant trigger on table "public"."youtube_channels" to "service_role";

grant truncate on table "public"."youtube_channels" to "service_role";

grant update on table "public"."youtube_channels" to "service_role";

create policy "Users can insert own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can insert referrals"
on "public"."referrals"
as permissive
for insert
to public
with check ((auth.uid() = referrer_id));


create policy "Users can view referrals they made"
on "public"."referrals"
as permissive
for select
to public
using ((auth.uid() = referrer_id));


create policy "Users can view referrals they received"
on "public"."referrals"
as permissive
for select
to public
using ((auth.uid() = referred_user_id));


create policy "Users can delete own scripts"
on "public"."scripts"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own scripts"
on "public"."scripts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own scripts"
on "public"."scripts"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own scripts"
on "public"."scripts"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete own style"
on "public"."user_style"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own style"
on "public"."user_style"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own style"
on "public"."user_style"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own style"
on "public"."user_style"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own channel data"
on "public"."youtube_channels"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own channel data"
on "public"."youtube_channels"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own channel data"
on "public"."youtube_channels"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_scripts BEFORE UPDATE ON public.scripts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_user_style BEFORE UPDATE ON public.user_style FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


