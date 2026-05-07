import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sendAmbassadorMessageAction } from "@/app/(app)/actions";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AmbassadorMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: messages } = await supabase
    .from("admin_messages")
    .select("*")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] max-w-md flex-col">
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <header className="mb-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Message admin
        </h1>
        <p className="text-sm text-fg-muted">
          Questions, updates, or asking for more materials? Send a note.
        </p>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto py-2">
        {(messages ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-fg-muted">
            No messages yet — start the conversation below.
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
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-[15px] ${
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
        action={sendAmbassadorMessageAction}
        className="flex items-center gap-2 border-t border-border pt-3"
      >
        <input
          name="body"
          placeholder="Message admin…"
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
