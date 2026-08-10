import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TICKET_GOAL } from "@/lib/points";
import { cn } from "@/lib/utils";
import type { ProgressRow, Role } from "@/types/database";

export const dynamic = "force-dynamic";

type Filter = "all" | "ambassador" | "admin";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const filter: Filter =
    sp.filter === "admin" || sp.filter === "ambassador" ? sp.filter : "all";

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("user_progress")
    .select("*")
    .order("approved_points", { ascending: false });

  const all = (rows ?? []) as ProgressRow[];
  const ambassadors = all.filter((r) => r.role === "ambassador");
  const admins = all.filter((r) => r.role === "admin");
  const team =
    filter === "admin" ? admins : filter === "ambassador" ? ambassadors : all;

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    { key: "ambassador", label: "Ambassadors", count: ambassadors.length },
    { key: "admin", label: "Admins", count: admins.length },
  ];

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
          {ambassadors.length} ambassador{ambassadors.length === 1 ? "" : "s"} ·{" "}
          {admins.length} admin{admins.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/team" : `/admin/team?filter=${f.key}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.key
                ? "border-ember/40 bg-ember/15 text-ember"
                : "border-border bg-surface-2/40 text-fg-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            {f.label}
            <span className="text-[10px] opacity-70">{f.count}</span>
          </Link>
        ))}
      </div>

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
                <TeamRow key={m.user_id} member={m} />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function TeamRow({ member: m }: { member: ProgressRow }) {
  const isAdmin: boolean = m.role === "admin";
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-2/30">
      <td className="px-4 py-3 font-medium">
        <Link
          href={`/admin/team/${m.user_id}`}
          className="inline-flex items-center gap-2 hover:text-ember"
        >
          {m.full_name}
          {isAdmin && (
            <Badge tone="ember" className="gap-1">
              <Shield className="h-3 w-3" /> Admin
            </Badge>
          )}
        </Link>
      </td>
      <td className="px-4 py-3 text-fg-muted">
        <a href={`mailto:${m.email}`} className="hover:text-ember">
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
        {isAdmin ? "—" : m.posters_sent}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {isAdmin ? "—" : m.flyers_sent}
      </td>
      <td className="min-w-[160px] px-4 py-3">
        {isAdmin ? (
          <span className="text-xs text-fg-subtle">n/a</span>
        ) : (
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
        )}
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
  );
}
