-- Proposed Supabase schema. Run once in a new project's SQL Editor.
-- This migration has NOT been applied to a live project by this repository.
begin;
create table public.academy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  contact_email text check (char_length(contact_email) <= 254),
  phone text check (char_length(phone) <= 32),
  updated_at timestamptz not null default now()
);
create table public.academy_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free','apex')),
  updated_at timestamptz not null default now()
);
create table public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_key text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, progress_key)
);
create table public.academy_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  visited_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.academy_profiles enable row level security;
alter table public.academy_memberships enable row level security;
alter table public.academy_progress enable row level security;
alter table public.academy_activity enable row level security;
revoke all on public.academy_profiles, public.academy_memberships,
  public.academy_progress, public.academy_activity from anon, authenticated;
grant select, insert, update on public.academy_profiles to authenticated;
grant select on public.academy_memberships to authenticated;
grant select, insert, update, delete on public.academy_progress, public.academy_activity to authenticated;
create policy profiles_read_own on public.academy_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.academy_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.academy_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy memberships_read_own on public.academy_memberships for select to authenticated using ((select auth.uid()) = user_id);
create policy progress_own on public.academy_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy activity_own on public.academy_activity for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Deliberately no authenticated membership-write policy or grant.
-- Missing membership means Free; only trusted administration/billing may grant Apex.
commit;
