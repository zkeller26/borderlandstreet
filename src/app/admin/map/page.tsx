import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/photos";
import { PosterMapLoader } from "@/components/admin/poster-map-loader";
import { CoverageMapLoader } from "@/components/admin/coverage-map-loader";
import { aggregateCoverage } from "@/lib/coords";
import type { Submission, Profile } from "@/types/database";
import type { MapPin } from "@/components/admin/poster-map";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const supabase = await createClient();

  const [{ data: subs }, { data: ambassadors }] = await Promise.all([
    supabase
      .from("submissions")
      .select("*, profiles!submissions_user_id_fkey(full_name)")
      .not("lat", "is", null)
      .not("lng", "is", null)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("profiles")
      .select("id, full_name, target_areas")
      .eq("role", "ambassador"),
  ]);

  type Joined = Submission & {
    profiles: Pick<Profile, "full_name"> | null;
  };
  const rows = (subs ?? []) as Joined[];

  const photoMap = await signedPhotoUrls(rows.map((r) => r.photo_path));

  const TYPE_LABEL = {
    poster: "Poster",
    event: "Event Promo",
    social: "Social Post",
  } as const;

  const pins: MapPin[] = rows
    .filter((r) => r.lat !== null && r.lng !== null)
    .map((r) => ({
      id: r.id,
      lat: r.lat!,
      lng: r.lng!,
      title:
        TYPE_LABEL[r.type] +
        (r.location_name ? ` · ${r.location_name}` : ""),
      ambassador: r.profiles?.full_name ?? "Unknown",
      status: r.status,
      address:
        r.notes ||
        (r.event_name ? `Event: ${r.event_name}` : null) ||
        (r.venue ? `Venue: ${r.venue}` : null),
      photoUrl: r.photo_path ? photoMap[r.photo_path] ?? null : null,
    }));

  const covered = aggregateCoverage(
    (ambassadors ?? []).map((a) => ({
      id: a.id,
      full_name: a.full_name,
      target_areas: (a.target_areas as string[] | null) ?? [],
    })),
  );

  const totalActions = pins.length;
  const totalCovered = covered.length;
  const totalAmbassadors = (ambassadors ?? []).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Action Map
        </h1>
        <p className="text-sm text-fg-muted">
          {totalActions} pin{totalActions === 1 ? "" : "s"} dropped by the team
        </p>
      </header>

      <PosterMapLoader pins={pins} />

      <div>
        <header className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Coverage Map
            </h2>
            <p className="text-sm text-fg-muted">
              {totalCovered} cities covered by {totalAmbassadors} ambassador
              {totalAmbassadors === 1 ? "" : "s"} · gray dots are gaps
            </p>
          </div>
          <Legend />
        </header>
        <CoverageMapLoader covered={covered} />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="hidden items-center gap-3 text-xs text-fg-muted sm:flex">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-ember/50 ring-1 ring-ember" />
        Covered
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full border border-border-strong bg-surface-2" />
        Gap
      </span>
    </div>
  );
}
