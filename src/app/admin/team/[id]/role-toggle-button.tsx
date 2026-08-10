"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Shield, ArrowDown, AlertTriangle } from "lucide-react";
import { changeMemberRoleAction } from "@/app/admin/actions";
import type { Role } from "@/types/database";

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ember px-4 text-sm font-medium text-bg transition-colors hover:bg-ember-hover disabled:opacity-50"
    >
      {pending ? "Updating…" : label}
    </button>
  );
}

export function RoleToggleButton({
  memberId,
  memberName,
  currentRole,
}: {
  memberId: string;
  memberName: string;
  currentRole: Role;
}) {
  const [confirming, setConfirming] = useState(false);
  const promote = currentRole === "ambassador";
  const nextRole: Role = promote ? "admin" : "ambassador";
  const label = promote ? "Promote to admin" : "Demote to ambassador";

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg transition-colors hover:border-ember/40 hover:text-ember"
      >
        {promote ? (
          <Shield className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-ember/30 bg-ember/5 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
        <div className="text-sm">
          <p className="font-medium text-fg">
            {promote ? "Promote" : "Demote"}{" "}
            <span className="text-ember">{memberName}</span> to{" "}
            <span className="font-mono">{nextRole}</span>?
          </p>
          <p className="mt-1 text-fg-muted">
            {promote
              ? "They'll gain access to the admin panel: submissions queue, team management, messages, and material requests."
              : "They'll lose admin access and return to the ambassador dashboard. Their profile, submissions, and message history stay intact."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm text-fg-muted hover:bg-surface-2"
        >
          Cancel
        </button>
        <form action={changeMemberRoleAction}>
          <input type="hidden" name="id" value={memberId} />
          <input type="hidden" name="role" value={nextRole} />
          <ConfirmButton label={promote ? "Yes, promote" : "Yes, demote"} />
        </form>
      </div>
    </div>
  );
}
