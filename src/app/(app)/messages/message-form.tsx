"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import {
  sendAmbassadorMessageAction,
  type ActionState,
} from "@/app/(app)/actions";

const initial: ActionState = { ok: false };

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ember text-bg transition-colors hover:bg-ember-hover disabled:opacity-50"
      aria-label="Send"
    >
      <Send className="h-4 w-4" />
    </button>
  );
}

export function MessageForm() {
  const [state, formAction] = useActionState(
    sendAmbassadorMessageAction,
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the input after a successful send
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="border-t border-border pt-3">
      {state.error && (
        <p className="mb-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
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
          placeholder="Message admin…"
          required
          autoComplete="off"
          className="h-11 flex-1 rounded-xl border border-border bg-surface-2 px-4 text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
        />
        <SendButton />
      </form>
    </div>
  );
}
