-- Run this in the Supabase SQL editor for your project

-- Member profiles table
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null,
  weight_class    text,
  muay_thai       text,   -- Beginner, Intermediate, Advanced, or null
  bjj             text,
  wrestling       text,
  boxing          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Sessions table
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date_time   timestamptz not null,
  location    text not null,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Signups table
create table if not exists signups (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now(),
  unique (session_id, user_id)
);

-- Enable Row Level Security
alter table sessions enable row level security;
alter table signups enable row level security;

-- Grant table-level permissions to Postgres roles
grant select on sessions to anon, authenticated;
grant all on sessions to service_role;

grant select on signups to anon, authenticated;
grant insert, delete on signups to authenticated;
grant all on signups to service_role;

grant select on profiles to anon, authenticated;
grant insert, update on profiles to authenticated;
grant all on profiles to service_role;

-- Sessions: anyone can read
create policy "sessions_public_read" on sessions
  for select using (true);

-- Signups: anyone can read
create policy "signups_public_read" on signups
  for select using (true);

-- Signups: authenticated users can insert their own
create policy "signups_insert_own" on signups
  for insert with check (auth.uid() = user_id);

-- Signups: users can delete their own
create policy "signups_delete_own" on signups
  for delete using (auth.uid() = user_id);

-- Profiles: enable RLS
alter table profiles enable row level security;

-- Profiles: anyone can read
create policy "profiles_public_read" on profiles
  for select using (true);

-- Profiles: users can insert/update their own
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);
