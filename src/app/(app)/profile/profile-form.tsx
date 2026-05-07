"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input, Textarea } from "@/components/ui/input";
import { TargetAreasInput } from "@/components/ui/target-areas-input";
import { ChipList } from "@/components/ui/chip-list";
import { Button } from "@/components/ui/button";
import { updateProfileAction, type ActionState } from "@/app/(app)/actions";
import type { Profile } from "@/types/database";

const initial: ActionState = { ok: false };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, initial);
  const [targetAreas, setTargetAreas] = useState<string[]>(
    profile.target_areas ?? [],
  );
  const [flyerEvents, setFlyerEvents] = useState<string[]>(
    profile.flyer_events ?? [],
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input
            name="first_name"
            defaultValue={profile.first_name ?? ""}
            required
          />
        </Field>
        <Field label="Last name">
          <Input
            name="last_name"
            defaultValue={profile.last_name ?? ""}
            required
          />
        </Field>
      </div>

      <Field label="Phone number">
        <Input
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          required
        />
      </Field>

      <Field label="Shipping address">
        <Textarea
          name="shipping_address"
          defaultValue={profile.shipping_address ?? ""}
          required
        />
      </Field>

      <Field label="Target areas">
        <TargetAreasInput value={targetAreas} onChange={setTargetAreas} />
        <input
          type="hidden"
          name="target_areas"
          value={JSON.stringify(targetAreas)}
        />
      </Field>

      <Field label="Concerts / events you can flyer at">
        <ChipList values={flyerEvents} onChange={setFlyerEvents} />
        <input
          type="hidden"
          name="flyer_events"
          value={JSON.stringify(flyerEvents)}
        />
      </Field>

      <Field label="Instagram" hint="optional">
        <Input
          name="instagram_handle"
          defaultValue={profile.instagram_handle ?? ""}
          placeholder="@yourhandle"
        />
      </Field>

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Saved.
        </p>
      )}

      <SaveButton />
    </form>
  );
}
