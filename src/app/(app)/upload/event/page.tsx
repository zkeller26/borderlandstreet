import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PhotoInput } from "@/components/upload/photo-input";
import { UploadForm } from "@/components/upload/upload-form";
import { SubmitButton } from "@/components/upload/submit-button";
import { POINTS } from "@/lib/points";

export const dynamic = "force-dynamic";

export default function EventUploadPage() {
  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Event Promotion
      </h1>
      <p className="mb-6 text-sm text-fg-muted">
        Upload a photo of yourself at the show with flyers.{" "}
        <span className="text-ember">+{POINTS.event} pts when approved.</span>
      </p>

      <UploadForm type="event">
        <PhotoInput />

        <Field label="Event name">
          <Input
            name="event_name"
            placeholder="Magdalena Bay @ Town Ballroom"
            required
          />
        </Field>

        <Field label="Venue">
          <Input name="venue" placeholder="Town Ballroom, Buffalo" required />
        </Field>

        <Field label="Estimated # of flyers handed out">
          <Input
            name="flyer_count"
            type="number"
            min={0}
            placeholder="50"
            required
          />
        </Field>

        <Field
          label="Notes"
          hint="how were the interactions and reactions?"
        >
          <Textarea
            name="notes"
            placeholder="Crowd was hyped, ~30 people asked when tickets drop, two guys recognized the lineup..."
            required
          />
        </Field>

        <SubmitButton>Submit event promo</SubmitButton>
      </UploadForm>
    </div>
  );
}
