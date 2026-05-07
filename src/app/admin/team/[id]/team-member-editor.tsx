"use client";

import { useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { TargetAreasInput } from "@/components/ui/target-areas-input";
import { ChipList } from "@/components/ui/chip-list";
import { Button } from "@/components/ui/button";
import { updateTeamMemberAction } from "@/app/admin/actions";
import type { Profile } from "@/types/database";

export function TeamMemberEditor({ profile }: { profile: Profile }) {
  const [targetAreas, setTargetAreas] = useState<string[]>(
    profile.target_areas ?? [],
  );
  const [flyerEvents, setFlyerEvents] = useState<string[]>(
    profile.flyer_events ?? [],
  );
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (fd) => {
        await updateTeamMemberAction(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={profile.id} />
      <input
        type="hidden"
        name="target_areas"
        value={JSON.stringify(targetAreas)}
      />
      <input
        type="hidden"
        name="flyer_events"
        value={JSON.stringify(flyerEvents)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input name="first_name" defaultValue={profile.first_name ?? ""} />
        </Field>
        <Field label="Last name">
          <Input name="last_name" defaultValue={profile.last_name ?? ""} />
        </Field>
      </div>

      <Field label="Email">
        <Input name="email" type="email" defaultValue={profile.email} />
      </Field>

      <Field label="Phone number">
        <Input name="phone" type="tel" defaultValue={profile.phone ?? ""} />
      </Field>

      <Field label="Shipping address">
        <Textarea
          name="shipping_address"
          defaultValue={profile.shipping_address ?? ""}
        />
      </Field>

      <Field label="Target areas">
        <TargetAreasInput value={targetAreas} onChange={setTargetAreas} />
      </Field>

      <Field label="Flyer events">
        <ChipList values={flyerEvents} onChange={setFlyerEvents} />
      </Field>

      <div className="flex items-center justify-between">
        {saved && <span className="text-sm text-success">Saved.</span>}
        <Button type="submit" size="md" className="ml-auto">
          Save changes
        </Button>
      </div>
    </form>
  );
}
