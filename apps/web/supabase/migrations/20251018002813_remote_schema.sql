create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default auth.uid(),
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "subscription_type" text default ''::text,
    "payment_details" json
);


alter table "public"."subscriptions" enable row level security;

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

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX unique_user_channel ON public.youtube_channels USING btree (user_id, channel_id);

CREATE UNIQUE INDEX youtube_channels_pkey ON public.youtube_channels USING btree (id);

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."youtube_channels" add constraint "youtube_channels_pkey" PRIMARY KEY using index "youtube_channels_pkey";

alter table "public"."youtube_channels" add constraint "unique_user_channel" UNIQUE using index "unique_user_channel";

alter table "public"."youtube_channels" add constraint "youtube_channels_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."youtube_channels" validate constraint "youtube_channels_user_id_fkey";

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




