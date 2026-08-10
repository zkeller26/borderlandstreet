-- ============================================================================
-- v6 — Manage admin members from /admin/team
--
-- 1. Expand `user_progress` view to include admin profiles (was ambassadors-
--    only) plus a `role` column so the team page can filter/badge.
-- 2. `admin_change_member_role(uuid, text)` — SECURITY DEFINER RPC that
--    lets an admin promote an ambassador → admin or demote an admin →
--    ambassador. Callers cannot change their own role (would risk locking
--    the last admin out).
-- ============================================================================

-- ── Expand user_progress to include admins ──────────────────────────────
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
  p.role,
  coalesce(sum(case when s.status = 'approved' then s.points else 0 end), 0)::int as approved_points,
  coalesce(sum(case when s.status = 'approved' then 1 else 0 end), 0)::int as approved_count,
  coalesce(sum(case when s.status = 'pending'  then 1 else 0 end), 0)::int as pending_count,
  coalesce(sum(case when s.status = 'approved' and s.type = 'poster' then 1 else 0 end), 0)::int as posters_sent,
  coalesce(sum(case when s.status = 'approved' and s.type = 'event'  then coalesce(s.flyer_count, 0) else 0 end), 0)::int as flyers_sent,
  max(s.created_at) as last_activity
from public.profiles p
left join public.submissions s on s.user_id = p.id
group by p.id;

grant select on public.user_progress to anon, authenticated, service_role;

-- ── Role change RPC ─────────────────────────────────────────────────────
create or replace function public.admin_change_member_role(
  member_id uuid,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  admin_count int;
begin
  if new_role not in ('admin', 'ambassador') then
    raise exception 'Role must be admin or ambassador';
  end if;

  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role is null or caller_role <> 'admin' then
    raise exception 'Only admins can change roles';
  end if;

  if member_id = auth.uid() then
    raise exception 'Use Settings to change your own role';
  end if;

  -- Guard against removing the last admin
  if new_role = 'ambassador' then
    select count(*) into admin_count from public.profiles where role = 'admin';
    if admin_count <= 1 then
      raise exception 'Cannot demote the last admin';
    end if;
  end if;

  update public.profiles
  set role = new_role
  where id = member_id;
end;
$$;

grant execute on function public.admin_change_member_role(uuid, text)
  to authenticated;
