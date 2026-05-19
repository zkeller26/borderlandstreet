import Link from "next/link";
import { MessageCircle, Package, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import {
  fulfillRequestAction,
  cancelRequestAction,
} from "@/app/admin/actions";
import { ComposeMessage } from "@/components/admin/compose-message";
import type { MaterialRequest, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MessagesAndRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: ambassadors }, { data: recent }, { data: requestRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, school")
        .eq("role", "ambassador")
        .order("full_name"),
      // Fetch ALL recent messages (admin RLS allows it). We'll match each
      // one to its ambassador in JS below, so threads stay unified even
      // when a different admin sent/received the original.
      supabase
        .from("admin_messages")
        .select("from_user_id, to_user_id, body, created_at, read_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("material_requests")
        .select(
          "*, profiles!material_requests_user_id_fkey(full_name, shipping_address, phone)",
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ]);

  type Joined = MaterialRequest & {
    profiles:
      | Pick<Profile, "full_name" | "shipping_address" | "phone">
      | null;
  };
  const pendingRequests = (requestRows ?? []) as Joined[];

  // For each message find the ambassador party (either sender or recipient).
  // Anything that doesn't involve an ambassador (e.g. admin-to-admin) is skipped.
  const ambassadorIds = new Set((ambassadors ?? []).map((a) => a.id));
  const lastByAmbassador = new Map<
    string,
    { body: string; created_at: string; unread: boolean }
  >();
  for (const m of recent ?? []) {
    const ambId = ambassadorIds.has(m.from_user_id)
      ? m.from_user_id
      : ambassadorIds.has(m.to_user_id)
        ? m.to_user_id
        : null;
    if (!ambId) continue;
    // "Unread" means the message came FROM the ambassador and hasn't been read yet
    const isInbound = m.from_user_id === ambId && !m.read_at;
    const existing = lastByAmbassador.get(ambId);
    if (!existing) {
      lastByAmbassador.set(ambId, {
        body: m.body,
        created_at: m.created_at,
        unread: isInbound,
      });
    } else if (!existing.unread && isInbound) {
      existing.unread = true;
    }
  }
  // Keep the existing variable name used below
  const lastByOther = lastByAmbassador;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Messages & Requests
          </h1>
          <p className="text-sm text-fg-muted">
            {pendingRequests.length > 0
              ? `${pendingRequests.length} pending request${pendingRequests.length === 1 ? "" : "s"}`
              : "All caught up"}
          </p>
        </div>
        <ComposeMessage
          ambassadors={(ambassadors ?? []).map((a) => ({
            id: a.id,
            full_name: a.full_name,
          }))}
        />
      </header>

      {/* ── REQUESTS ───────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-fg-muted">
          <Package className="h-4 w-4" /> Requests
          {pendingRequests.length > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[10px] font-semibold text-bg">
              {pendingRequests.length}
            </span>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <Empty title="No pending requests" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {pendingRequests.map((r) => {
              const Icon = r.type === "poster" ? FileText : Package;
              return (
                <Card key={r.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-ember/15 text-ember">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold">
                          {r.profiles?.full_name}
                        </p>
                        <p className="text-xs text-fg-muted">
                          {formatRelative(r.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge tone="ember">
                      {r.quantity} × {r.type}
                    </Badge>
                  </div>

                  {r.profiles?.shipping_address && (
                    <div className="rounded-lg bg-surface-2 px-3 py-2 text-xs">
                      <p className="mb-1 font-medium text-fg-muted">Ship to</p>
                      <p className="whitespace-pre-line text-fg">
                        {r.profiles.shipping_address}
                      </p>
                      {r.profiles.phone && (
                        <p className="mt-1 text-fg-muted">
                          📞 {r.profiles.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {r.notes && (
                    <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-fg-muted">
                      {r.notes}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <form action={fulfillRequestAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="h-10 w-full rounded-xl bg-success/20 text-sm font-medium text-success transition-colors hover:bg-success/30"
                      >
                        Mark sent ✓
                      </button>
                    </form>
                    <form action={cancelRequestAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="h-10 w-full rounded-xl border border-border text-sm text-fg-muted transition-colors hover:bg-surface-2"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── MESSAGES ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-fg-muted">
          <MessageCircle className="h-4 w-4" /> Messages by team member
        </h2>

        {!ambassadors || ambassadors.length === 0 ? (
          <Empty title="No team members yet" />
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {ambassadors.map((a) => {
                const last = lastByOther.get(a.id);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/admin/messages/${a.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 sm:px-5"
                    >
                      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted">
                        <MessageCircle className="h-4 w-4" />
                        {last?.unread && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-ember ring-2 ring-bg" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-[15px] ${last?.unread ? "font-semibold text-fg" : "font-medium text-fg"}`}
                          >
                            {a.full_name}
                          </span>
                          {last && (
                            <span className="shrink-0 text-xs text-fg-subtle">
                              {formatRelative(last.created_at)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-0.5 truncate text-xs ${last?.unread ? "text-fg" : "text-fg-muted"}`}
                        >
                          {last?.body ?? a.school ?? "No messages yet"}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
