import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PhotoInput } from "@/components/upload/photo-input";
import { GeoButton } from "@/components/upload/geo-button";

export const dynamic = "force-dynamic";

import { UploadForm } from "@/components/upload/upload-form";
import { SubmitButton } from "@/components/upload/submit-button";
import { POINTS } from "@/lib/points";

export default function PosterUploadPage() {
  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Poster Proof
      </h1>
      <p className="mb-6 text-sm text-fg-muted">
        Snap the poster on the wall, board, or pole.{" "}
        <span className="text-ember">+{POINTS.poster} pts when approved.</span>
      </p>

      <UploadForm type="poster">
        <PhotoInput />

        <Field label="Location name">
          <Input
            name="location_name"
            placeholder="Spot Coffee, Elmwood"
            required
          />
        </Field>

        <GeoButton required />

        <Field label="Notes" hint="optional">
          <Textarea
            name="notes"
            placeholder="On the bulletin board near the door"
          />
        </Field>

        <SubmitButton>Submit poster</SubmitButton>
      </UploadForm>
    </div>
  );
}
