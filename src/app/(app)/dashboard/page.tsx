import Link from "next/link";
import { Ticket, CheckCircle2, Clock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/photos";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Empty } from "@/components/ui/empty";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SubmissionList } from "@/components/dashboard/submission-list";
import { MyPinMap } from "@/components/dashboard/my-pin-map";
import { TICKET_GOAL } from "@/lib/points";
import type { Submission } from "@/types/database";
import type { MapPin as MapPinT } from "@/components/admin/poster-map";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: submissions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, full_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const subs = (submissions ?? []) as Submission[];
  const approved = subs.filter((s) => s.status === "approved");
  const pending = subs.filter((s) => s.status === "pending");
  const totalPoints = approved.reduce((sum, s) => sum + s.points, 0);
  const remaining = Math.max(0, TICKET_GOAL - totalPoints);
  const unlocked = totalPoints >= TICKET_GOAL;
  const firstName =
    profile?.first_name ||
    profile?.full_name?.split(" ")[0] ||
    "ambassador";

  const myPosterPins = subs.filter(
    (s) => s.type === "poster" && s.lat !== null && s.lng !== null,
  );
  const photoMap = await signedPhotoUrls(myPosterPins.map((s) => s.photo_path));
  const pins: MapPinT[] = myPosterPins.map((s) => ({
    id: s.id,
    lat: s.lat!,
    lng: s.lng!,
    title: s.location_name || "Poster",
    status: s.status,
    photoUrl: s.photo_path ? photoMap[s.photo_path] ?? null : null,
  }));

  return (
    <div className="space-y-6">
      {sp.submitted && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Submission received — admins will review it shortly.
        </div>
      )}

      <header>
        <p className="text-sm text-fg-muted">Hey {firstName} 👋</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Your Street Team Dashboard
        </h1>
      </header>

      <Card className="bg-gradient-to-br from-surface to-surface-2">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-fg-muted">
              Progress to free ticket
            </p>
            <p className="mt-1 font-display text-4xl font-semibold tracking-tight">
              {totalPoints}
              <span className="text-fg-subtle"> / {TICKET_GOAL}</span>
            </p>
          </div>
          <Ticket
            className={`h-8 w-8 ${unlocked ? "text-ember" : "text-fg-subtle"}`}
          />
        </div>
        <ProgressBar value={totalPoints} max={TICKET_GOAL} className="mt-4" />
        <p className="mt-3 text-sm text-fg-muted">
          {unlocked
            ? "🎟️  You've unlocked your free Borderland ticket!"
            : `${remaining} pts to go — keep posting.`}
        </p>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-muted">
          Log a quick action
        </h2>
        <QuickActions />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-success/15 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-semibold">{approved.length}</p>
            <p className="text-xs text-fg-muted">Approved actions</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-warn/15 text-warn">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-semibold">{pending.length}</p>
            <p className="text-xs text-fg-muted">Pending review</p>
          </div>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-ember" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-fg-muted">
            Your poster pins
          </h2>
          <span className="ml-auto text-xs text-fg-subtle">
            {pins.length} pin{pins.length === 1 ? "" : "s"}
          </span>
        </div>
        {pins.length === 0 ? (
          <Empty
            title="No pins yet"
            description="Drop a GPS pin when you upload your first poster."
          />
        ) : (
          <MyPinMap pins={pins} />
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-fg-muted">
            Recent submissions
          </h2>
          <span className="text-xs text-fg-subtle">{subs.length} total</span>
        </div>

        {subs.length === 0 ? (
          <Empty
            title="No submissions yet"
            description="Hang up your first poster, snap a photo, and tap Poster Proof above."
          />
        ) : (
          <SubmissionList submissions={subs} />
        )}
      </section>
    </div>
  );
}
