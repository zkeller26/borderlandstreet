"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Not authorized");
  return { supabase, userId: user.id };
}

export async function approveSubmissionAction(formData: FormData) {
  const id = formData.get("id") as string;
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "approved",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      reject_reason: null,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

export async function rejectSubmissionAction(formData: FormData) {
  const id = formData.get("id") as string;
  const reason = (formData.get("reason") as string) || null;
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      reject_reason: reason,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

export async function deleteTeamMemberAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing member id");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_delete_member", {
    member_id: id,
  });
  if (error) throw error;
  revalidatePath("/admin/team");
  revalidatePath("/admin");
  redirect("/admin/team?deleted=1");
}

export async function markThreadReadAction(ambassadorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.rpc("mark_thread_read", { ambassador_id: ambassadorId });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function sendMessageAction(formData: FormData) {
  const toUserId = formData.get("to_user_id") as string;
  const body = ((formData.get("body") as string) || "").trim();
  if (!toUserId || !body) return;
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("admin_messages").insert({
    from_user_id: userId,
    to_user_id: toUserId,
    body,
  });
  if (error) throw error;
  revalidatePath(`/admin/messages`);
  revalidatePath(`/admin/messages/${toUserId}`);
  revalidatePath(`/admin/team/${toUserId}`);
}

export async function broadcastMessageAction(formData: FormData) {
  const body = ((formData.get("body") as string) || "").trim();
  if (!body) return { sent: 0 };
  const { supabase, userId } = await requireAdmin();

  const { data: recipients } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "ambassador");

  if (!recipients || recipients.length === 0) return { sent: 0 };

  const rows = recipients.map((r) => ({
    from_user_id: userId,
    to_user_id: r.id,
    body,
  }));

  const { error } = await supabase.from("admin_messages").insert(rows);
  if (error) throw error;

  revalidatePath(`/admin/messages`);
  return { sent: rows.length };
}

export async function updateTeamMemberAction(formData: FormData) {
  const id = formData.get("id") as string;
  const { supabase } = await requireAdmin();

  const update = {
    first_name: (formData.get("first_name") as string) || null,
    last_name: (formData.get("last_name") as string) || null,
    full_name: `${formData.get("first_name") || ""} ${formData.get("last_name") || ""}`.trim(),
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    shipping_address: (formData.get("shipping_address") as string) || null,
    target_areas: JSON.parse(
      (formData.get("target_areas") as string) || "[]",
    ),
    flyer_events: JSON.parse(
      (formData.get("flyer_events") as string) || "[]",
    ),
  };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${id}`);
}

export async function fulfillRequestAction(formData: FormData) {
  const id = formData.get("id") as string;
  const { supabase, userId } = await requireAdmin();

  const { data: req } = await supabase
    .from("material_requests")
    .select("user_id, type, quantity")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("material_requests")
    .update({
      status: "fulfilled",
      fulfilled_at: new Date().toISOString(),
      fulfilled_by: userId,
    })
    .eq("id", id);
  if (error) throw error;

  // Auto-notify the ambassador that their materials have shipped
  if (req) {
    await supabase.from("admin_messages").insert({
      from_user_id: userId,
      to_user_id: req.user_id,
      body: `📦 Your ${req.quantity} ${req.type}${req.quantity > 1 ? "s" : ""} have been sent! They should arrive shortly.`,
    });
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function cancelRequestAction(formData: FormData) {
  const id = formData.get("id") as string;
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("material_requests")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/messages");
}
