import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/photos";
import { Empty } from "@/components/ui/empty";
import { ReviewCard } from "@/components/admin/review-card";
import type { Submission, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function SubmissionsQueuePage() {
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from("submissions")
    .select("*, profiles!submissions_user_id_fkey(id, full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  type Joined = Submission & {
    profiles: Pick<Profile, "id" | "full_name"> | null;
  };
  const rows = (subs ?? []) as Joined[];

  const photoMap = await signedPhotoUrls(rows.map((r) => r.photo_path));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Pending Submissions
          </h1>
          <p className="text-sm text-fg-muted">
            {rows.length} waiting on review
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <Empty
          title="Inbox zero 🎉"
          description="No pending submissions right now."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((s) => (
            <ReviewCard
              key={s.id}
              submission={s}
              ambassadorName={s.profiles?.full_name ?? "Unknown"}
              photoUrl={s.photo_path ? photoMap[s.photo_path] ?? null : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
