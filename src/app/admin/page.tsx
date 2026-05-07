import Link from "next/link";
import { Trophy, Users, Inbox, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Empty } from "@/components/ui/empty";
import { TICKET_GOAL } from "@/lib/points";
import { formatRelative } from "@/lib/utils";
import type { ProgressRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ data: progress }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("user_progress")
      .select("*")
      .order("approved_points", { ascending: false }),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const rows = (progress ?? []) as ProgressRow[];
  const totalAmbassadors = rows.length;
  const unlocked = rows.filter((r) => r.approved_points >= TICKET_GOAL).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Street Team Overview
        </h1>
        <p className="text-sm text-fg-muted">
          Borderland Festival ambassador tracker
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ember/15 text-ember">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-semibold">{totalAmbassadors}</p>
            <p className="text-xs text-fg-muted">Ambassadors</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <Link
            href="/admin/submissions"
            className="flex w-full items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-warn/15 text-warn">
              <Inbox className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{pendingCount ?? 0}</p>
              <p className="text-xs text-fg-muted">Pending review</p>
            </div>
          </Link>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-success/15 text-success">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-semibold">{unlocked}</p>
            <p className="text-xs text-fg-muted">Tickets unlocked</p>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-muted">
          Leaderboard
        </h2>
        {rows.length === 0 ? (
          <Empty
            title="No ambassadors yet"
            description="Once people sign up they'll show up here."
          />
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {rows.map((row, i) => (
                <li
                  key={row.user_id}
                  className="flex items-center gap-4 px-4 py-3 sm:px-5"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-fg-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/admin/team/${row.user_id}`}
                        className="truncate text-[15px] font-medium text-fg hover:text-ember"
                      >
                        {row.full_name}
                      </Link>
                      <span className="shrink-0 text-sm font-semibold text-ember">
                        {row.approved_points}
                        <span className="text-fg-subtle">/{TICKET_GOAL}</span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-fg-muted">
                      <span>{(row.target_areas ?? [])[0] || row.school || "—"}</span>
                      <span>·</span>
                      <span>{row.approved_count} approved</span>
                      {row.pending_count > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-warn">
                            {row.pending_count} pending
                          </span>
                        </>
                      )}
                      {row.last_activity && (
                        <>
                          <span>·</span>
                          <span>
                            active {formatRelative(row.last_activity)}
                          </span>
                        </>
                      )}
                    </div>
                    <ProgressBar
                      value={row.approved_points}
                      max={TICKET_GOAL}
                      className="mt-2"
                    />
                  </div>
                  <Link
                    href={`/admin/messages/${row.user_id}`}
                    className="hidden shrink-0 rounded-lg p-2 text-fg-subtle hover:bg-surface-2 hover:text-fg sm:inline-flex"
                    aria-label="Message ambassador"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
