import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMessageAction } from "@/app/admin/actions";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MessageThreadPage({
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

  const { data: ambassador } = await supabase
    .from("profiles")
    .select("id, full_name, school, email")
    .eq("id", id)
    .single();
  if (!ambassador) notFound();

  const { data: messages } = await supabase
    .from("admin_messages")
    .select("*")
    .or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${id}),and(from_user_id.eq.${id},to_user_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-border pb-3">
        <Link
          href="/admin/messages"
          className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="font-medium">{ambassador.full_name}</p>
          <p className="text-xs text-fg-muted">{ambassador.school || ambassador.email}</p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {(messages ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-fg-muted">
            No messages yet — say hi.
          </p>
        ) : (
          (messages ?? []).map((m) => {
            const fromMe = m.from_user_id === user.id;
            return (
              <div
                key={m.id}
                className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] ${
                    fromMe
                      ? "bg-ember text-bg"
                      : "border border-border bg-surface-2 text-fg"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      fromMe ? "text-bg/60" : "text-fg-subtle"
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

      <form
        action={sendMessageAction}
        className="flex items-center gap-2 border-t border-border pt-3"
      >
        <input type="hidden" name="to_user_id" value={ambassador.id} />
        <input
          name="body"
          placeholder="Message…"
          required
          autoComplete="off"
          className="h-11 flex-1 rounded-xl border border-border bg-surface-2 px-4 text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
        />
        <button
          type="submit"
          className="grid h-11 w-11 place-items-center rounded-xl bg-ember text-bg transition-colors hover:bg-ember-hover"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
