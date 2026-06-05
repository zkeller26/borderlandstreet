import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Field, Select, Textarea } from "@/components/ui/input";
import { PhotoInput } from "@/components/upload/photo-input";
import { UploadForm } from "@/components/upload/upload-form";
import { SubmitButton } from "@/components/upload/submit-button";
import { POINTS, SOCIAL_PLATFORMS } from "@/lib/points";

export const dynamic = "force-dynamic";

export default function SocialUploadPage() {
  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Social Post
      </h1>
      <p className="mb-6 text-sm text-fg-muted">
        Share a screenshot of your post.{" "}
        <span className="text-ember">+{POINTS.social} pts when approved.</span>
      </p>

      <UploadForm type="social">
        <PhotoInput />

        <Field label="Platform">
          <Select name="platform" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Notes"
          hint='describe the post — e.g. "Shared lineup graphic in Rochester Grateful Dead Fans group"'
        >
          <Textarea
            name="notes"
            placeholder="Shared lineup graphic in Rochester Grateful Dead Fans group"
            required
          />
        </Field>

        <SubmitButton>Submit social post</SubmitButton>
      </UploadForm>
    </div>
  );
}
