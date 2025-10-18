-- Creating table for YouTube channel details
create table youtube_channels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  channel_id text not null,
  channel_name text,
  channel_description text,
  custom_url text,
  published_at timestamp with time zone,
  country text,
  thumbnail text,
  default_language text,
  view_count bigint,
  subscriber_count bigint,
  video_count bigint,
  is_linked boolean,
  text_color text,
  background_color text,
  topic_details jsonb,
  updated_at timestamp with time zone default now(),
  constraint unique_user_channel unique (user_id, channel_id)
);

-- Enabling Row-Level Security
alter table youtube_channels enable row level security;

-- Creating RLS policy for selecting own data
create policy "Users can view their own channel data"
on youtube_channels
for select
using (auth.uid() = user_id);

-- Creating RLS policy for inserting own data
create policy "Users can insert their own channel data"
on youtube_channels
for insert
with check (auth.uid() = user_id);

-- Creating RLS policy for updating own data
create policy "Users can update their own channel data"
on youtube_channels
for update
using (auth.uid() = user_id);