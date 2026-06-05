-- ============================================================================
-- v5 — Admin can delete a team member
--
-- Deleting from auth.users cascades through profiles → submissions →
-- admin_messages → material_requests (all set up with ON DELETE CASCADE in
-- 001/002), so one delete cleanly removes the user and every artifact tied
-- to them.
--
-- SECURITY DEFINER because:
-- - public RPCs can't touch auth schema with anon/authenticated grants
-- - we want to keep the admin check (auth.uid()) at the function entry
--
-- Storage files in submission-photos are NOT removed — clean them up via
-- the Supabase dashboard if you care about space.
-- ============================================================================

create or replace function public.admin_delete_member(member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  select role into caller_role
  from public.profiles
  where id = auth.uid();

  if caller_role is null or caller_role <> 'admin' then
    raise exception 'Only admins can delete team members';
  end if;

  -- Don't let an admin accidentally nuke their own account through the team UI
  if member_id = auth.uid() then
    raise exception 'Use Settings to delete your own account';
  end if;

  -- Cascading FKs handle profiles/submissions/admin_messages/material_requests
  delete from auth.users where id = member_id;
end;
$$;

grant execute on function public.admin_delete_member(uuid) to authenticated;
