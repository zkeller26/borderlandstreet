import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Edit profile
      </h1>
      <p className="mb-6 text-sm text-fg-muted">
        Keep your shipping address and target areas up to date.
      </p>

      <ProfileForm profile={profile as Profile} />
    </div>
  );
}
