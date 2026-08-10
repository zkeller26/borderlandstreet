"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Send, Shield, MessagesSquare } from "lucide-react";
import {
  sendTeamChatAction,
  type TeamChatState,
} from "@/app/(app)/actions";
import { formatRelative } from "@/lib/utils";

const initial: TeamChatState = { ok: false };

export type TeamChatItem = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_role: "admin" | "ambassador";
  is_me: boolean;
};

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember text-bg transition-colors hover:bg-ember-hover disabled:opacity-50"
      aria-label="Send"
    >
      <Send className="h-4 w-4" />
    </button>
  );
}

export function TeamChat({ messages }: { messages: TeamChatItem[] }) {
  const [state, formAction] = useActionState(sendTeamChatAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear input after successful send + scroll to bottom
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex items-center gap-2 border-b border-border bg-surface-2/40 px-4 py-3">
        <MessagesSquare className="h-4 w-4 text-ember" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-fg-muted">
          Team Chat
        </h2>
        <span className="ml-auto text-[10px] text-fg-subtle">
          Visible to all team members
        </span>
      </header>

      <div
        ref={scrollRef}
        className="max-h-80 min-h-32 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-fg-muted">
            Nothing here yet — say hi to the team.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={m.is_me ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-left text-[15px] ${
                  m.is_me
                    ? "bg-ember text-bg"
                    : "border border-border bg-surface-2 text-fg"
                }`}
              >
                <div
                  className={`mb-0.5 flex items-center gap-1.5 text-[11px] ${
                    m.is_me ? "text-bg/70" : "text-fg-muted"
                  }`}
                >
                  <span className="font-medium">
                    {m.is_me ? "You" : m.author_name}
                  </span>
                  {m.author_role === "admin" && !m.is_me && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-ember/20 px-1.5 text-[9px] font-semibold uppercase text-ember">
                      <Shield className="h-2.5 w-2.5" /> admin
                    </span>
                  )}
                  <span
                    className={m.is_me ? "text-bg/60" : "text-fg-subtle"}
                  >
                    · {formatRelative(m.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-3">
        {state.error && (
          <p className="mb-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger">
            {state.error}
          </p>
        )}
        <form
          ref={formRef}
          action={formAction}
          className="flex items-center gap-2"
        >
          <input
            name="body"
            placeholder="Message the team…"
            required
            maxLength={2000}
            autoComplete="off"
            className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-4 text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
          />
          <SendButton />
        </form>
      </div>
    </div>
  );
}
