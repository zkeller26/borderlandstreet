import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminNav } from "@/components/layout/admin-nav";
import type { Profile } from "@/types/database";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if ((profile as Profile | null)?.role !== "admin") redirect("/admin/login");

  // Notification dot reflects work pending for the admin team as a whole:
  // (a) any pending material requests, and (b) any unread message from an
  // ambassador to any admin. Ambassador IDs are pre-resolved so admin↔admin
  // chatter doesn't inflate the count.
  const [
    { count: pendingRequestsCount },
    { data: ambassadors },
  ] = await Promise.all([
    supabase
      .from("material_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("profiles").select("id").eq("role", "ambassador"),
  ]);

  let unreadCount = 0;
  const ambassadorIds = (ambassadors ?? []).map((a) => a.id);
  if (ambassadorIds.length > 0) {
    const { count } = await supabase
      .from("admin_messages")
      .select("id", { count: "exact", head: true })
      .in("from_user_id", ambassadorIds)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  const pendingCount = (pendingRequestsCount ?? 0) + unreadCount;

  return (
    <div className="min-h-dvh">
      <AdminHeader profile={(profile as Profile | null) ?? null} />
      <AdminNav pendingCount={pendingCount} />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:py-8">
        {children}
      </main>
    </div>
  );
}
