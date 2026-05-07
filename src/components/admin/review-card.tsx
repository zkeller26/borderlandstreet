"use client";

import { useState } from "react";
import { Check, X, MapPin, Link2 } from "lucide-react";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { TYPE_LABEL } from "@/lib/points";
import { formatRelative } from "@/lib/utils";
import type { Submission } from "@/types/database";

export function ReviewCard({
  submission,
  ambassadorName,
  photoUrl,
}: {
  submission: Submission;
  ambassadorName: string;
  photoUrl: string | null;
}) {
  const [showReject, setShowReject] = useState(false);

  const subtitle =
    submission.event_name ||
    submission.location_name ||
    submission.platform?.replace(/_/g, " ") ||
    null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={subtitle || "Submission"}
          className="h-72 w-full object-cover"
        />
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-fg">
              {ambassadorName}
            </p>
            <p className="text-xs text-fg-muted">
              {TYPE_LABEL[submission.type]} ·{" "}
              {formatRelative(submission.created_at)}
            </p>
          </div>
          <Badge tone="ember">+{submission.points} pts</Badge>
        </div>

        {subtitle && (
          <p className="text-sm text-fg">{subtitle}</p>
        )}

        {submission.address && (
          <p className="flex items-start gap-1.5 text-xs text-fg-muted">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {submission.address}
          </p>
        )}

        {submission.venue && (
          <p className="text-xs text-fg-muted">at {submission.venue}</p>
        )}

        {submission.post_url && (
          <a
            href={submission.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-ember hover:underline"
          >
            <Link2 className="h-3.5 w-3.5" /> Open post
          </a>
        )}

        {submission.notes && (
          <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-fg-muted">
            {submission.notes}
          </p>
        )}

        {!showReject ? (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <form action={approveSubmissionAction}>
              <input type="hidden" name="id" value={submission.id} />
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-success/20 text-sm font-medium text-success transition-colors hover:bg-success/30"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
            </form>
            <button
              type="button"
              onClick={() => setShowReject(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-danger/15 text-sm font-medium text-danger transition-colors hover:bg-danger/25"
            >
              <X className="h-4 w-4" /> Reject
            </button>
          </div>
        ) : (
          <form
            action={rejectSubmissionAction}
            className="flex flex-col gap-2 pt-2"
          >
            <input type="hidden" name="id" value={submission.id} />
            <input
              name="reason"
              placeholder="Reason (optional)"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm placeholder:text-fg-subtle focus:border-danger/60 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowReject(false)}
                className="h-10 rounded-xl border border-border text-sm text-fg-muted hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-danger/20 text-sm font-medium text-danger hover:bg-danger/30"
              >
                Confirm reject
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
