import Link from "next/link";
import { ArrowLeft, MessageCircle, AtSign } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/photos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { TICKET_GOAL, TYPE_LABEL } from "@/lib/points";
import { formatRelative } from "@/lib/utils";
import type { Submission } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
} as const;

export default async function AmbassadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("submissions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const submissions = (subs ?? []) as Submission[];
  const approved = submissions.filter((s) => s.status === "approved");
  const total = approved.reduce((sum, s) => sum + s.points, 0);
  const photoMap = await signedPhotoUrls(submissions.map((s) => s.photo_path));

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Overview
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {profile.full_name}
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              {[profile.school, profile.hometown].filter(Boolean).join(" · ") ||
                profile.email}
            </p>
            {profile.instagram_handle && (
              <a
                href={`https://instagram.com/${profile.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-ember hover:underline"
              >
                <AtSign className="h-3.5 w-3.5" /> {profile.instagram_handle}
              </a>
            )}
          </div>
          <Link
            href={`/admin/messages/${profile.id}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-sm hover:bg-surface-2"
          >
            <MessageCircle className="h-4 w-4" /> Message
          </Link>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wider text-fg-muted">
              Progress
            </p>
            <p className="font-display text-xl font-semibold">
              {total}
              <span className="text-fg-subtle">/{TICKET_GOAL}</span>
            </p>
          </div>
          <ProgressBar value={total} max={TICKET_GOAL} className="mt-2" />
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-muted">
          All submissions ({submissions.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {submissions.map((s) => {
            const url = s.photo_path ? photoMap[s.photo_path] : null;
            const title =
              s.event_name ||
              s.location_name ||
              s.platform?.replace(/_/g, " ") ||
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
                    <span className="truncate text-sm font-medium">{title}</span>
                    <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-fg-muted">
                    {TYPE_LABEL[s.type]} · {formatRelative(s.created_at)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
