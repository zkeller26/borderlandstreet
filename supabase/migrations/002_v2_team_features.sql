-- ============================================================================
-- v2 — Team-member fields, expanded signup, new point system, material requests
-- Run AFTER 001_initial_schema.sql in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================================

-- ── profiles: split full_name + add team-member fields ──────────────────────
alter table public.profiles
  add column if not exists first_name      text,
  add column if not exists last_name       text,
  add column if not exists phone           text,
  add column if not exists shipping_address text,
  add column if not exists target_areas    jsonb not null default '[]'::jsonb,
  add column if not exists flyer_events    jsonb not null default '[]'::jsonb;

-- Backfill first/last from existing full_name where missing
update public.profiles
set
  first_name = coalesce(first_name, split_part(full_name, ' ', 1)),
  last_name  = coalesce(
    last_name,
    nullif(trim(substring(full_name from position(' ' in full_name) + 1)), '')
  )
where first_name is null or last_name is null;

-- ── submissions: add flyer_count for events; relax old fields ───────────────
alter table public.submissions
  add column if not exists flyer_count int;

-- Convert platform from enum to plain text so we can use any platform string
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'submissions'
      and column_name = 'platform'
      and udt_name = 'social_platform'
  ) then
    alter table public.submissions alter column platform type text using platform::text;
  end if;
end $$;

-- The enum is no longer referenced by any column — safe to drop
drop type if exists public.social_platform;

-- ── material_requests: ambassadors request more posters / flyers ────────────
do $$ begin
  create type public.material_type as enum ('poster', 'flyer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('pending', 'fulfilled', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.material_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.material_type not null,
  quantity int not null check (quantity > 0),
  notes text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  fulfilled_by uuid references public.profiles(id)
);

create index if not exists material_requests_user_idx on public.material_requests(user_id, created_at desc);
create index if not exists material_requests_status_idx on public.material_requests(status, created_at desc);

alter table public.material_requests enable row level security;

drop policy if exists material_requests_select on public.material_requests;
create policy material_requests_select on public.material_requests
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists material_requests_insert on public.material_requests;
create policy material_requests_insert on public.material_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists material_requests_update_admin on public.material_requests;
create policy material_requests_update_admin on public.material_requests
  for update using (public.is_admin());

-- ── handle_new_user: read the new metadata fields on signup ─────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fname text := nullif(new.raw_user_meta_data->>'first_name', '');
  lname text := nullif(new.raw_user_meta_data->>'last_name', '');
  fall  text := coalesce(new.raw_user_meta_data->>'full_name', new.email);
begin
  insert into public.profiles (
    id, email, full_name, first_name, last_name,
    phone, shipping_address, school, hometown, instagram_handle,
    target_areas, flyer_events
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(coalesce(fname, '') || ' ' || coalesce(lname, '')), ''),
      fall
    ),
    coalesce(fname, split_part(fall, ' ', 1)),
    coalesce(lname, nullif(trim(substring(fall from position(' ' in fall) + 1)), '')),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'shipping_address', ''),
    nullif(new.raw_user_meta_data->>'school', ''),
    nullif(new.raw_user_meta_data->>'hometown', ''),
    nullif(new.raw_user_meta_data->>'instagram_handle', ''),
    coalesce((new.raw_user_meta_data->'target_areas')::jsonb, '[]'::jsonb),
    coalesce((new.raw_user_meta_data->'flyer_events')::jsonb, '[]'::jsonb)
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ── per-user material counts (for the admin team table) ─────────────────────
-- Drop first because CREATE OR REPLACE VIEW can't reorder/add-in-middle columns
drop view if exists public.user_progress cascade;
create view public.user_progress as
select
  p.id as user_id,
  p.full_name,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.shipping_address,
  p.school,
  p.hometown,
  p.target_areas,
  p.flyer_events,
  coalesce(sum(case when s.status = 'approved' then s.points else 0 end), 0)::int as approved_points,
  coalesce(sum(case when s.status = 'approved' then 1 else 0 end), 0)::int as approved_count,
  coalesce(sum(case when s.status = 'pending'  then 1 else 0 end), 0)::int as pending_count,
  coalesce(sum(case when s.status = 'approved' and s.type = 'poster' then 1 else 0 end), 0)::int as posters_sent,
  coalesce(sum(case when s.status = 'approved' and s.type = 'event'  then coalesce(s.flyer_count, 0) else 0 end), 0)::int as flyers_sent,
  max(s.created_at) as last_activity
from public.profiles p
left join public.submissions s on s.user_id = p.id
where p.role = 'ambassador'
group by p.id;

grant select on public.user_progress to anon, authenticated, service_role;
grant all on public.material_requests to anon, authenticated, service_role;
