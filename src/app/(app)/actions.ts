"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pointsFor, SOCIAL_PLATFORMS } from "@/lib/points";
import type { SubmissionType, MaterialType } from "@/types/database";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ActionState = {
  ok: boolean;
  error?: string;
};

export async function createSubmissionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not signed in" };

    const type = formData.get("type") as SubmissionType;
    if (!type || !["poster", "event", "social"].includes(type)) {
      return { ok: false, error: "Invalid submission type" };
    }

    const file = formData.get("photo") as File | null;
    if (!file || file.size === 0) {
      return { ok: false, error: "Please attach a photo" };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, error: "Photo must be under 10 MB" };
    }

    const lat = formData.get("lat");
    const lng = formData.get("lng");
    if (type === "poster" && (!lat || !lng)) {
      return { ok: false, error: "Drop a GPS pin to submit a poster" };
    }

    const platform = (formData.get("platform") as string | null) || null;
    if (
      type === "social" &&
      (!platform || !SOCIAL_PLATFORMS.some((p) => p.value === platform))
    ) {
      return { ok: false, error: "Pick a social platform" };
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const month = new Date().toISOString().slice(0, 7);
    const path = `${user.id}/${type}/${month}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("submission-photos")
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (uploadErr) {
      console.error("[createSubmissionAction] upload failed", uploadErr);
      return { ok: false, error: `Upload failed: ${uploadErr.message}` };
    }

    const points = pointsFor(type);

    const row: Record<string, unknown> = {
      user_id: user.id,
      type,
      status: "pending",
      points,
      photo_path: path,
      notes: (formData.get("notes") as string) || null,
    };

    if (type === "poster") {
      row.location_name = (formData.get("location_name") as string) || null;
      row.lat = Number(lat);
      row.lng = Number(lng);
    } else if (type === "event") {
      row.event_name = (formData.get("event_name") as string) || null;
      row.venue = (formData.get("venue") as string) || null;
      const flyers = formData.get("flyer_count");
      row.flyer_count = flyers ? Number(flyers) : null;
    } else if (type === "social") {
      row.platform = platform;
    }

    const { error: insertErr } = await supabase.from("submissions").insert(row);
    if (insertErr) {
      console.error("[createSubmissionAction] insert failed", insertErr);
      return { ok: false, error: `Save failed: ${insertErr.message}` };
    }

    revalidatePath("/dashboard");
  } catch (err) {
    // The special NEXT_REDIRECT "error" MUST re-throw for the redirect below
    // to work — anything else is a real failure we want to surface.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("[createSubmissionAction] unexpected error", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
    };
  }

  // Redirect must be OUTSIDE the try/catch — Next.js implements it by throwing
  // a special error that would otherwise be swallowed by the catch above.
  redirect("/dashboard?submitted=1");
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const targetAreasJson = formData.get("target_areas") as string;
  const flyerEventsJson = formData.get("flyer_events") as string;

  const update = {
    first_name: (formData.get("first_name") as string) || null,
    last_name: (formData.get("last_name") as string) || null,
    full_name: `${formData.get("first_name") || ""} ${formData.get("last_name") || ""}`.trim(),
    phone: (formData.get("phone") as string) || null,
    shipping_address: (formData.get("shipping_address") as string) || null,
    instagram_handle:
      ((formData.get("instagram_handle") as string) || "").replace(/^@/, "") ||
      null,
    target_areas: targetAreasJson ? JSON.parse(targetAreasJson) : [],
    flyer_events: flyerEventsJson ? JSON.parse(flyerEventsJson) : [],
  };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createMaterialRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const type = formData.get("type") as MaterialType;
  if (!type || !["poster", "flyer"].includes(type)) {
    return { ok: false, error: "Invalid request type" };
  }

  const quantity = Number(formData.get("quantity"));
  if (!quantity || quantity <= 0) {
    return { ok: false, error: "Quantity must be greater than 0" };
  }

  const { error } = await supabase.from("material_requests").insert({
    user_id: user.id,
    type,
    quantity,
    notes: (formData.get("notes") as string) || null,
    status: "pending",
  });

  if (error) return { ok: false, error: error.message };

  const slug = `${type}s`;
  revalidatePath(`/requests/${slug}`);
  redirect(`/requests/${slug}?submitted=${type}`);
}

export async function sendAmbassadorMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const body = ((formData.get("body") as string) || "").trim();
  if (!body) return { ok: false, error: "Write a message before sending." };

  const { error } = await supabase.rpc("send_message_to_admins", {
    message_body: body,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/messages");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function markMyMessagesReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.rpc("mark_messages_from_admin_read");
  revalidatePath("/messages");
  revalidatePath("/dashboard");
}

export type TeamChatState = {
  ok: boolean;
  error?: string;
};

export async function sendTeamChatAction(
  _prev: TeamChatState,
  formData: FormData,
): Promise<TeamChatState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const body = ((formData.get("body") as string) || "").trim();
  if (!body) return { ok: false, error: "Write a message." };
  if (body.length > 2000) {
    return { ok: false, error: "Message is too long (2000 char max)." };
  }

  const { error } = await supabase
    .from("team_chat_messages")
    .insert({ user_id: user.id, body });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true };
}
