import Link from "next/link";
import { ArrowLeft, Send, Package, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/photos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Empty } from "@/components/ui/empty";
import { TICKET_GOAL, TYPE_LABEL } from "@/lib/points";
import { formatRelative } from "@/lib/utils";
import { sendMessageAction } from "@/app/admin/actions";
import { TeamMemberEditor } from "./team-member-editor";
import { DeleteMemberButton } from "./delete-member-button";
import type {
  Submission,
  Profile,
  MaterialRequest,
} from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
} as const;

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: subs },
    { data: messages },
    { data: matReqs },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("submissions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_messages")
      .select("*")
      .or(`from_user_id.eq.${id},to_user_id.eq.${id}`)
      .order("created_at", { ascending: true }),
    supabase
      .from("material_requests")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const submissions = (subs ?? []) as Submission[];
  const approved = submissions.filter((s) => s.status === "approved");
  const total = approved.reduce((sum, s) => sum + s.points, 0);
  const photoMap = await signedPhotoUrls(submissions.map((s) => s.photo_path));

  const byType = {
    poster: submissions.filter((s) => s.type === "poster"),
    event: submissions.filter((s) => s.type === "event"),
    social: submissions.filter((s) => s.type === "social"),
  };
  const flyersTotal = byType.event
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + (s.flyer_count ?? 0), 0);

  // Materials shipped/requested tracker
  const matRequests = (matReqs ?? []) as MaterialRequest[];
  const postersShipped = matRequests
    .filter((r) => r.type === "poster" && r.status === "fulfilled")
    .reduce((sum, r) => sum + r.quantity, 0);
  const flyersShipped = matRequests
    .filter((r) => r.type === "flyer" && r.status === "fulfilled")
    .reduce((sum, r) => sum + r.quantity, 0);
  const pendingRequests = matRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/team"
        className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Team Members
      </Link>

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {(profile as Profile).full_name}
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              {(profile as Profile).email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-fg-muted">
              Progress
            </p>
            <p className="font-display text-2xl font-semibold">
              {total}
              <span className="text-fg-subtle">/{TICKET_GOAL}</span>
            </p>
          </div>
        </div>
        <ProgressBar value={total} max={TICKET_GOAL} className="mt-3" />

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Approved", value: approved.length },
            { label: "Pending", value: submissions.length - approved.length - submissions.filter((s) => s.status === "rejected").length },
            { label: "Posters", value: byType.poster.filter((s) => s.status === "approved").length },
            { label: "Flyers handed out", value: flyersTotal },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-surface-2/40 px-3 py-3"
            >
              <p className="text-xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-xs text-fg-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-fg-muted">
            Materials shipped
          </h2>
          {pendingRequests > 0 && (
            <Link
              href="/admin/messages"
              className="text-xs text-warn hover:underline"
            >
              {pendingRequests} pending request
              {pendingRequests === 1 ? "" : "s"} →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ember/15 text-ember">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {postersShipped}
              </p>
              <p className="text-xs text-fg-muted">posters shipped</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ember/15 text-ember">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {flyersShipped}
              </p>
              <p className="text-xs text-fg-muted">flyers shipped</p>
            </div>
          </div>
        </div>

        {matRequests.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {matRequests.slice(0, 8).map((r) => {
              const Icon = r.type === "poster" ? FileText : Package;
              const tone =
                r.status === "fulfilled"
                  ? "approved"
                  : r.status === "cancelled"
                    ? "rejected"
                    : "pending";
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-fg-muted" />
                    <div className="min-w-0">
                      <p>
                        <span className="font-medium tabular-nums">
                          {r.quantity}
                        </span>{" "}
                        <span className="text-fg-muted">
                          {r.type}
                          {r.quantity > 1 ? "s" : ""}
                        </span>
                      </p>
                      <p className="text-xs text-fg-subtle">
                        {r.status === "fulfilled" && r.fulfilled_at
                          ? `shipped ${formatRelative(r.fulfilled_at)}`
                          : `requested ${formatRelative(r.created_at)}`}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge tone={tone}>{r.status}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-fg-muted">
          Member info
        </h2>
        <TeamMemberEditor profile={profile as Profile} />
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-muted">
          Actions by type
        </h2>
        {(["poster", "event", "social"] as const).map((type) => {
          const list = byType[type];
          if (list.length === 0) return null;
          return (
            <div key={type} className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-fg">
                {TYPE_LABEL[type]} ({list.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {list.map((s) => {
                  const url = s.photo_path ? photoMap[s.photo_path] : null;
                  const title =
                    s.event_name ||
                    s.location_name ||
                    s.platform ||
                    TYPE_LABEL[s.type];
                  return (
                    <Card key={s.id} className="overflow-hidden p-0">
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={title}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                      <div className="space-y-1 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {title}
                          </span>
                          <Badge tone={STATUS_TONE[s.status]}>
                            {s.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-fg-muted">
                          {formatRelative(s.created_at)}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
        {submissions.length === 0 && <Empty title="No submissions yet" />}
      </section>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-muted">
          Chat
        </h2>
        <div className="mb-3 max-h-80 space-y-2 overflow-y-auto">
          {(messages ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-fg-muted">
              No messages yet.
            </p>
          ) : (
            (messages ?? []).map((m) => {
              const fromAdmin = m.from_user_id !== id;
              return (
                <div
                  key={m.id}
                  className={`flex ${fromAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      fromAdmin
                        ? "bg-ember text-bg"
                        : "border border-border bg-surface-2 text-fg"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        fromAdmin ? "text-bg/60" : "text-fg-subtle"
                      }`}
                    >
                      {formatRelative(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form action={sendMessageAction} className="flex items-center gap-2">
          <input type="hidden" name="to_user_id" value={profile.id} />
          <input
            name="body"
            placeholder="Message…"
            required
            autoComplete="off"
            className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-4 text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
          />
          <button
            type="submit"
            className="grid h-10 w-10 place-items-center rounded-xl bg-ember text-bg transition-colors hover:bg-ember-hover"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </Card>

      <Card className="border-danger/20 bg-danger/[0.02]">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-danger">
          Danger zone
        </h2>
        <p className="mb-4 text-sm text-fg-muted">
          Permanently remove this team member and all their submissions,
          messages, and material requests. Their auth account is also deleted,
          so they can sign up again with the same email later if needed.
        </p>
        <DeleteMemberButton
          memberId={(profile as Profile).id}
          memberName={(profile as Profile).full_name}
        />
      </Card>
    </div>
  );
}
