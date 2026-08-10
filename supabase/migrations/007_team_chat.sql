-- ============================================================================
-- v7 — Team-wide chat channel
--
-- A single shared thread every ambassador AND admin can read + post to.
-- Rendered on /dashboard (above the map) and /admin (above the leaderboard).
-- No topics, no threads — one live feed keeps it simple.
-- ============================================================================

create table if not exists public.team_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0 and length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists team_chat_created_idx
  on public.team_chat_messages(created_at desc);

alter table public.team_chat_messages enable row level security;

-- Any signed-in user (ambassador or admin) can read every message
drop policy if exists team_chat_select on public.team_chat_messages;
create policy team_chat_select on public.team_chat_messages
  for select
  to authenticated
  using (true);

-- Users can only insert their OWN messages
drop policy if exists team_chat_insert on public.team_chat_messages;
create policy team_chat_insert on public.team_chat_messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own messages; admins can delete any
drop policy if exists team_chat_delete on public.team_chat_messages;
create policy team_chat_delete on public.team_chat_messages
  for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

grant all on public.team_chat_messages to authenticated, service_role;
