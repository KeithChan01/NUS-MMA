-- Run this in the Supabase SQL editor for your project

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
