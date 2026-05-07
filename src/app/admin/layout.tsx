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

  // Count things that should drive the notification dot:
  // pending material requests + unread inbound messages to this admin
  const [{ count: pendingRequestsCount }, { count: unreadCount }] =
    await Promise.all([
      supabase
        .from("material_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("admin_messages")
        .select("id", { count: "exact", head: true })
        .eq("to_user_id", user.id)
        .is("read_at", null),
    ]);

  const pendingCount = (pendingRequestsCount ?? 0) + (unreadCount ?? 0);

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
