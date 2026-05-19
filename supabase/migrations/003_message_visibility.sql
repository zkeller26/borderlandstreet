-- ============================================================================
-- v3 — Multi-admin message visibility fix
--
-- Before: an ambassador's message goes to "the first admin in the profiles
-- table" (one specific row). If a different admin opens the thread, they
-- can't see the message because RLS only lets them read messages where
-- they're personally the sender or recipient.
--
-- After: any admin can read every row in admin_messages. The thread query
-- then filters by ambassador only, so all admins see the unified thread
-- regardless of which admin row the message was technically addressed to.
-- ============================================================================

drop policy if exists admin_messages_select on public.admin_messages;
create policy admin_messages_select on public.admin_messages
  for select using (
    auth.uid() = from_user_id
    or auth.uid() = to_user_id
    or public.is_admin()
  );
