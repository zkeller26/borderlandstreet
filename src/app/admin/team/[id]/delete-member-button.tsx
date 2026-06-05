"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deleteTeamMemberAction } from "@/app/admin/actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-danger px-4 text-sm font-medium text-bg transition-colors hover:bg-danger/90 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting…" : "Yes, delete"}
    </button>
  );
}

export function DeleteMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-danger/30 bg-danger/10 px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
      >
        <Trash2 className="h-4 w-4" /> Delete member
      </button>
    );
  }

  const canConfirm = confirmText.trim().toLowerCase() === "delete";

  return (
    <div className="space-y-3 rounded-2xl border border-danger/30 bg-danger/5 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div className="text-sm">
          <p className="font-medium text-fg">
            Delete <span className="text-danger">{memberName}</span>?
          </p>
          <p className="mt-1 text-fg-muted">
            This permanently removes their account, all of their submissions,
            their message history with you, and any open material requests.
            This can&apos;t be undone.
          </p>
        </div>
      </div>

      <label className="block text-xs text-fg-muted">
        Type <span className="font-mono text-fg">delete</span> to confirm
      </label>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="delete"
        autoCapitalize="off"
        autoCorrect="off"
        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-danger/60"
      />

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setConfirmText("");
          }}
          className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm text-fg-muted hover:bg-surface-2"
        >
          Cancel
        </button>
        <form action={deleteTeamMemberAction}>
          <input type="hidden" name="id" value={memberId} />
          <fieldset disabled={!canConfirm} className="contents">
            <ConfirmButton />
          </fieldset>
        </form>
      </div>
    </div>
  );
}
