import { createClient } from "@/lib/supabase/server";
import type { TeamChatItem } from "@/components/dashboard/team-chat";

/**
 * Fetch the last N team-chat messages joined with author name + role.
 * Returned oldest-first so the UI scrolls to the newest at the bottom.
 */
export async function fetchTeamChat(
  currentUserId: string,
  limit = 50,
): Promise<TeamChatItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_chat_messages")
    .select(
      "id, body, created_at, user_id, profiles!team_chat_messages_user_id_fkey(full_name, role)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  type Row = {
    id: string;
    body: string;
    created_at: string;
    user_id: string;
    profiles: { full_name: string; role: "admin" | "ambassador" } | null;
  };

  const rows = (data ?? []) as Row[];
  // Oldest first for chat rendering
  rows.reverse();

  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    created_at: r.created_at,
    author_id: r.user_id,
    author_name: r.profiles?.full_name ?? "Unknown",
    author_role: r.profiles?.role ?? "ambassador",
    is_me: r.user_id === currentUserId,
  }));
}
