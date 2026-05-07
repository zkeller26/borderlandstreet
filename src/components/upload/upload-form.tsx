"use client";

import { useActionState } from "react";
import {
  createSubmissionAction,
  type ActionState,
} from "@/app/(app)/actions";

const initial: ActionState = { ok: false };

export function UploadForm({
  type,
  children,
}: {
  type: "poster" | "event" | "social";
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(createSubmissionAction, initial);
  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      {children}
      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
