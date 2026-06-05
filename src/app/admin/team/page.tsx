import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { ProgressBar } from "@/components/ui/progress";
import { TICKET_GOAL } from "@/lib/points";
import type { ProgressRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("user_progress")
    .select("*")
    .order("approved_points", { ascending: false });

  const team = (rows ?? []) as ProgressRow[];

  return (
    <div className="space-y-6">
      {sp.deleted && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Team member deleted.
        </div>
      )}
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Team Members
        </h1>
        <p className="text-sm text-fg-muted">
          {team.length} ambassador{team.length === 1 ? "" : "s"} on the roster
        </p>
      </header>

      {team.length === 0 ? (
        <Empty title="No team members yet" />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2/40 text-left text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Target areas</th>
                <th className="px-4 py-3 font-medium">Flyer events</th>
                <th className="px-4 py-3 text-right font-medium">Posters</th>
                <th className="px-4 py-3 text-right font-medium">Flyers</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="w-8 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr
                  key={m.user_id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-2/30"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/team/${m.user_id}`}
                      className="hover:text-ember"
                    >
                      {m.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    <a
                      href={`mailto:${m.email}`}
                      className="hover:text-ember"
                    >
                      {m.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {m.phone ? (
                      <a href={`tel:${m.phone}`} className="hover:text-ember">
                        {m.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {(m.target_areas ?? []).length > 0
                      ? (m.target_areas ?? []).join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {(m.flyer_events ?? []).length > 0
                      ? `${(m.flyer_events ?? []).length} event${(m.flyer_events ?? []).length === 1 ? "" : "s"}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {m.posters_sent}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {m.flyers_sent}
                  </td>
                  <td className="min-w-[160px] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs tabular-nums text-fg-muted">
                        {m.approved_points}/{TICKET_GOAL}
                      </span>
                      <ProgressBar
                        value={m.approved_points}
                        max={TICKET_GOAL}
                        className="flex-1"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/team/${m.user_id}`}
                      className="text-fg-subtle hover:text-fg"
                      aria-label="Open"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
