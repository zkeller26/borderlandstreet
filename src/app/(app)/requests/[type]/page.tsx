import Link from "next/link";
import { ArrowLeft, FileText, Package } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Card } from "@/components/ui/card";
import { RequestForm } from "./request-form";
import { formatRelative } from "@/lib/utils";
import type { MaterialRequest } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  pending: "pending",
  fulfilled: "approved",
  cancelled: "rejected",
} as const;

const META = {
  posters: {
    type: "poster" as const,
    title: "Request posters",
    icon: FileText,
    blurb:
      "Need more posters shipped to your address? Tell us how many and we'll get them out.",
  },
  flyers: {
    type: "flyer" as const,
    title: "Request flyers",
    icon: Package,
    blurb:
      "Heading to a show? Request a stack of flyers and we'll ship them in time.",
  },
};

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { type: slug } = await params;
  const sp = await searchParams;
  const meta = META[slug as keyof typeof META];
  if (!meta) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: requests } = await supabase
    .from("material_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", meta.type)
    .order("created_at", { ascending: false });

  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-6 w-6 text-ember" />
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {meta.title}
        </h1>
      </div>
      <p className="mb-6 text-sm text-fg-muted">{meta.blurb}</p>

      {sp.submitted === meta.type && (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Request received — we'll ship out as soon as we can.
        </div>
      )}

      <Card>
        <RequestForm
          type={meta.type}
          defaultQuantity={meta.type === "poster" ? 25 : 100}
          notesPlaceholder={
            meta.type === "poster"
              ? "Hitting Allentown coffee shops this weekend"
              : "Need by Friday — Lord Huron at Asbury on Saturday"
          }
        />
      </Card>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-muted">
          Your past requests
        </h2>
        {!requests || requests.length === 0 ? (
          <Empty title="No requests yet" />
        ) : (
          <ul className="space-y-2">
            {(requests as MaterialRequest[]).map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {r.quantity} × {meta.type}
                    {r.quantity > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {formatRelative(r.created_at)}
                    {r.notes && ` · ${r.notes}`}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
