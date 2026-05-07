"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createMaterialRequestAction,
  type ActionState,
} from "@/app/(app)/actions";
import type { MaterialType } from "@/types/database";

const initial: ActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send request"}
    </Button>
  );
}

export function RequestForm({
  type,
  defaultQuantity,
  notesPlaceholder,
}: {
  type: MaterialType;
  defaultQuantity: number;
  notesPlaceholder: string;
}) {
  const [state, formAction] = useActionState(
    createMaterialRequestAction,
    initial,
  );
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <Field label="How many?">
        <Input
          type="number"
          name="quantity"
          min={1}
          defaultValue={defaultQuantity}
          required
        />
      </Field>
      <Field
        label="Notes"
        hint="optional — events, deadlines, special requests"
      >
        <Textarea name="notes" placeholder={notesPlaceholder} />
      </Field>
      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
