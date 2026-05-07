"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Send, X } from "lucide-react";
import {
  sendMessageAction,
  broadcastMessageAction,
} from "@/app/admin/actions";
import {
  RecipientPicker,
  ALL_RECIPIENTS,
} from "./recipient-picker";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ember px-4 text-sm font-medium text-bg transition-colors hover:bg-ember-hover disabled:opacity-50"
    >
      <Send className="h-4 w-4" />
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

export function ComposeMessage({
  ambassadors,
}: {
  ambassadors: { id: string; full_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    setConfirmation(null);
    setRecipientId("");
    formRef.current?.reset();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={ambassadors.length === 0}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ember px-4 text-sm font-medium text-bg transition-colors hover:bg-ember-hover disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        Send message
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h3
              id="compose-title"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Send a message
            </h3>
            <p className="mt-1 text-sm text-fg-muted">
              Search a team member or message everyone at once.
            </p>

            <form
              ref={formRef}
              action={async (fd) => {
                const isAll = recipientId === ALL_RECIPIENTS;
                const body = (fd.get("body") as string)?.trim();
                if (!body || !recipientId) return;

                if (isAll) {
                  const result = await broadcastMessageAction(fd);
                  setConfirmation(
                    `✓ Sent to ${result?.sent ?? ambassadors.length} team member${
                      (result?.sent ?? ambassadors.length) === 1 ? "" : "s"
                    }`,
                  );
                } else {
                  fd.set("to_user_id", recipientId);
                  await sendMessageAction(fd);
                  const recipient = ambassadors.find(
                    (a) => a.id === recipientId,
                  );
                  setConfirmation(
                    `✓ Sent to ${recipient?.full_name ?? "ambassador"}`,
                  );
                }

                formRef.current?.reset();
                setTimeout(() => {
                  close();
                }, 1500);
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Recipient
                </label>
                <RecipientPicker
                  ambassadors={ambassadors}
                  value={recipientId}
                  onChange={setRecipientId}
                />
              </div>

              <div>
                <label
                  htmlFor="compose-body"
                  className="mb-1.5 block text-sm font-medium text-fg"
                >
                  Message
                </label>
                <textarea
                  id="compose-body"
                  name="body"
                  required
                  rows={5}
                  placeholder="Hey — we just shipped your posters. Watch for a package this week."
                  className="w-full resize-y rounded-xl border border-border bg-surface-2 px-4 py-3 text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                {confirmation ? (
                  <span className="text-sm text-success">{confirmation}</span>
                ) : (
                  <button
                    type="button"
                    onClick={close}
                    className="text-sm text-fg-muted hover:text-fg"
                  >
                    Cancel
                  </button>
                )}
                <SendButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
