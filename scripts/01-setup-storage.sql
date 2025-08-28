begin;

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Cleanup trigger/function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop tables (children → parent)
drop table if exists analytics_events cascade;
drop table if exists music_settings cascade;
drop table if exists music_tracks cascade;
drop table if exists social_links cascade;
drop table if exists profiles cascade;

-- Schema

create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  username varchar(50) unique not null,
  display_name varchar(100),
  bio text,
  avatar_url text,
  background_color varchar(7) default '#000000',
  background_image_url text,
  is_public boolean default true,
  reveal_type varchar(20) default 'none',
  reveal_title text,
  reveal_description text,
  reveal_min_age integer default 18,
  view_count integer default 0,
  like_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists social_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  platform varchar(50) not null,
  url text not null,
  display_text varchar(100),
  is_visible boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists music_tracks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title varchar(200) not null,
  artist varchar(200),
  audio_url text not null,
  cover_image_url text,
  duration integer,
  is_visible boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists music_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  player_style varchar(20) default 'modern',
  auto_play boolean default false,
  show_controls boolean default true,
  primary_color varchar(7) default '#ef4444',
  secondary_color varchar(7) default '#1f2937',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null,
  event_type varchar(50) not null,
  event_data jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now(),
  constraint fk_analytics_profile
    foreign key (profile_id) references profiles(id) on delete cascade
);

-- Indexes
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_social_links_user_id on social_links(user_id);
create index if not exists idx_music_tracks_user_id on music_tracks(user_id);

-- Enable RLS
alter table profiles enable row level security;
alter table social_links enable row level security;
alter table music_tracks enable row level security;
alter table music_settings enable row level security;
alter table analytics_events enable row level security;

-- Profiles policies
drop policy if exists "Public profiles viewable" on profiles;
drop policy if exists "Users manage own profile" on profiles;

create policy "Public profiles viewable"
  on profiles for select
  using (is_public = true);

create policy "Profiles insert own"
  on profiles for insert
  with check (user_id = auth.uid());

create policy "Profiles update own"
  on profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Profiles delete own"
  on profiles for delete
  using (user_id = auth.uid());

-- Social links policies
drop policy if exists "Users manage own social links" on social_links;
drop policy if exists "Public social links viewable" on social_links;

create policy "Public social links viewable"
  on social_links for select
  using (is_visible = true);

create policy "Social links insert own"
  on social_links for insert
  with check (user_id = auth.uid());

create policy "Social links update own"
  on social_links for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Social links delete own"
  on social_links for delete
  using (user_id = auth.uid());

-- Music tracks policies
drop policy if exists "Users manage own music" on music_tracks;
drop policy if exists "Public music viewable" on music_tracks;

create policy "Public music viewable"
  on music_tracks for select
  using (is_visible = true);

create policy "Music tracks insert own"
  on music_tracks for insert
  with check (user_id = auth.uid());

create policy "Music tracks update own"
  on music_tracks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Music tracks delete own"
  on music_tracks for delete
  using (user_id = auth.uid());

-- Music settings policies
drop policy if exists "Users manage own music settings" on music_settings;
drop policy if exists "Public music settings viewable" on music_settings;

create policy "Public music settings viewable"
  on music_settings for select
  using (true);

create policy "Music settings insert own"
  on music_settings for insert
  with check (user_id = auth.uid());

create policy "Music settings update own"
  on music_settings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Music settings delete own"
  on music_settings for delete
  using (user_id = auth.uid());

-- Analytics policies
drop policy if exists "Users view own analytics" on analytics_events;
drop policy if exists "Insert analytics events" on analytics_events;

create policy "Users view own analytics"
  on analytics_events for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));

create policy "Insert analytics events"
  on analytics_events for insert
  with check (true);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (username) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional seed
insert into public.profiles (id, user_id, username, display_name, is_public)
values (gen_random_uuid(), gen_random_uuid(), 'dashboard', 'Dashboard', true)
on conflict (username) do update
set is_public = true,
    display_name = excluded.display_name;

commit;

-- Storage setup (run after commit; safe to re-run)

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own files" on storage.objects;
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can view their own files" on storage.objects;
create policy "Users can view their own files"
  on storage.objects for select
  using (auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update their own files" on storage.objects;
create policy "Users can update their own files"
  on storage.objects for update
  using (auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own files" on storage.objects;
create policy "Users can delete their own files"
  on storage.objects for delete
  using (auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Public can view uploaded files" on storage.objects;
create policy "Public can view uploaded files"
  on storage.objects for select
  using (bucket_id = 'uploads');