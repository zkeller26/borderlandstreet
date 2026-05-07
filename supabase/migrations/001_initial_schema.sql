-- ============================================================================
-- Borderland Street Team Tracker — initial schema
-- Run in Supabase SQL Editor (dashboard → SQL → new query → paste → run)
-- ============================================================================

-- ============================================================================
-- DESTRUCTIVE TEARDOWN — wipes EVERYTHING in the `public` schema.
-- Safe on this brand-new Borderland project (no real data yet).
-- This also clears any tables accidentally created from the HomeSound script.
-- Supabase's auth/storage live in their own schemas and are untouched.
-- ============================================================================
drop schema public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
grant create on schema public to anon, authenticated, service_role;
grant all on schema public to postgres;

-- Restore Supabase's default object-level grants (wiped by the schema drop above).
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('ambassador', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.submission_type as enum ('poster', 'event', 'social');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.social_platform as enum ('instagram_story', 'instagram_feed', 'tiktok');
exception when duplicate_object then null; end $$;

-- Profiles --------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  school text,
  hometown text,
  instagram_handle text,
  role public.user_role not null default 'ambassador',
  created_at timestamptz not null default now()
);

-- Auto-create profile when a user signs up.
-- The signup form passes name/school/etc. via raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, school, hometown, instagram_handle)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'school', ''),
    nullif(new.raw_user_meta_data->>'hometown', ''),
    nullif(new.raw_user_meta_data->>'instagram_handle', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Submissions -----------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.submission_type not null,
  status public.submission_status not null default 'pending',
  points int not null default 0,

  photo_path text,
  notes text,

  -- poster
  location_name text,
  address text,
  lat double precision,
  lng double precision,

  -- event
  event_name text,
  venue text,

  -- social
  platform public.social_platform,
  post_url text,

  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_user_idx on public.submissions(user_id);
create index if not exists submissions_status_idx on public.submissions(status, created_at desc);
create index if not exists submissions_type_idx on public.submissions(type);

-- Admin messages --------------------------------------------------------------
create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_to_idx on public.admin_messages(to_user_id, created_at desc);
create index if not exists messages_thread_idx on public.admin_messages(from_user_id, to_user_id, created_at);

-- Progress view ---------------------------------------------------------------
create or replace view public.user_progress as
select
  p.id as user_id,
  p.full_name,
  p.school,
  coalesce(sum(case when s.status = 'approved' then s.points else 0 end), 0)::int as approved_points,
  coalesce(sum(case when s.status = 'approved' then 1 else 0 end), 0)::int as approved_count,
  coalesce(sum(case when s.status = 'pending'  then 1 else 0 end), 0)::int as pending_count,
  max(s.created_at) as last_activity
from public.profiles p
left join public.submissions s on s.user_id = p.id
where p.role = 'ambassador'
group by p.id, p.full_name, p.school;

-- Helper: is the calling user an admin? --------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Row Level Security ----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.admin_messages enable row level security;

-- profiles
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id);

-- submissions: ambassadors see/insert their own; admins see/update all
drop policy if exists submissions_select on public.submissions;
create policy submissions_select on public.submissions
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists submissions_insert on public.submissions;
create policy submissions_insert on public.submissions
  for insert with check (auth.uid() = user_id);

drop policy if exists submissions_update_admin on public.submissions;
create policy submissions_update_admin on public.submissions
  for update using (public.is_admin());

-- messages: visible to sender + recipient
drop policy if exists messages_select on public.admin_messages;
create policy messages_select on public.admin_messages
  for select using (auth.uid() = to_user_id or auth.uid() = from_user_id);

drop policy if exists messages_insert on public.admin_messages;
create policy messages_insert on public.admin_messages
  for insert with check (
    auth.uid() = from_user_id
    and (public.is_admin() or auth.uid() = to_user_id)
  );

drop policy if exists messages_mark_read on public.admin_messages;
create policy messages_mark_read on public.admin_messages
  for update using (auth.uid() = to_user_id);

-- Grant on the objects we just created (default privileges only apply to FUTURE objects).
grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- ============================================================================
-- Storage bucket: submission-photos
-- Run AFTER the rest. Bucket is created via the Storage API/dashboard normally,
-- but we can do it here via SQL too.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('submission-photos', 'submission-photos', false)
on conflict (id) do nothing;

-- Storage policies: users upload/read their own folder; admins read all.
drop policy if exists "submission_photos_insert_own" on storage.objects;
create policy "submission_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'submission-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "submission_photos_select_own_or_admin" on storage.objects;
create policy "submission_photos_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'submission-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- ============================================================================
-- Promote a user to admin (run manually after they've signed up):
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================
