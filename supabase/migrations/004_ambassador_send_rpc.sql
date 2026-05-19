-- ============================================================================
-- v4 — Fix ambassador-to-admin messaging (silent failure bug)
--
-- Bug: profiles_select RLS only lets ambassadors see their OWN profile row.
-- So when an ambassador's send action ran SELECT id FROM profiles WHERE
-- role='admin', the result was always empty (their own row isn't admin),
-- adminId was undefined, and the action returned silently without inserting.
-- Result: every ambassador message vanished.
--
-- Fix: a SECURITY DEFINER function that picks a recipient admin and inserts
-- the message in one server-side call, bypassing RLS for the lookup.
-- ============================================================================

create or replace function public.send_message_to_admins(message_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sender uuid := auth.uid();
  target_admin_id uuid;
  new_id uuid;
begin
  if sender is null then
    raise exception 'Not authenticated';
  end if;
  if message_body is null or length(trim(message_body)) = 0 then
    raise exception 'Message body is empty';
  end if;

  -- Pick a single admin recipient (consistent — earliest-joined wins).
  -- Migration 003 already lets every admin read every message, so it
  -- doesn't matter which admin is the technical to_user_id.
  select id into target_admin_id
  from public.profiles
  where role = 'admin'
  order by created_at asc
  limit 1;

  if target_admin_id is null then
    raise exception 'No admin available to receive the message';
  end if;

  insert into public.admin_messages (from_user_id, to_user_id, body)
  values (sender, target_admin_id, trim(message_body))
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.send_message_to_admins(text)
  to authenticated;

-- ─── Mark-read helpers ───────────────────────────────────────────────────
-- Used by the notification system. Same SECURITY DEFINER pattern so
-- ambassadors can mark THEIR inbound messages (from any admin) as read
-- without needing broad UPDATE permissions on admin_messages.

create or replace function public.mark_messages_from_admin_read()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  updated_count int;
begin
  if me is null then return 0; end if;
  update public.admin_messages
  set read_at = now()
  where to_user_id = me
    and read_at is null;
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.mark_messages_from_admin_read() to authenticated;

-- Mark every message in a thread with a specific ambassador as read,
-- on behalf of the entire admin team (so all admins clear together).
create or replace function public.mark_thread_read(ambassador_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  updated_count int;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role is null or caller_role <> 'admin' then
    raise exception 'Only admins can mark threads read';
  end if;

  update public.admin_messages
  set read_at = now()
  where from_user_id = ambassador_id
    and read_at is null;
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.mark_thread_read(uuid) to authenticated;
