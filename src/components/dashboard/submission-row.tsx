import { Badge } from "@/components/ui/badge";
import { TYPE_LABEL } from "@/lib/points";
import { formatRelative } from "@/lib/utils";
import type { Submission } from "@/types/database";

const STATUS_TONE = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
} as const;

export function SubmissionRow({ submission }: { submission: Submission }) {
  const title =
    submission.event_name ||
    submission.location_name ||
    submission.platform?.replace(/_/g, " ") ||
    TYPE_LABEL[submission.type];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-surface-2/40 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-medium text-fg">
            {title}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-fg-muted">
          {TYPE_LABEL[submission.type]} · {formatRelative(submission.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {submission.status === "approved" && (
          <span className="text-sm font-semibold text-ember">
            +{submission.points}
          </span>
        )}
        <Badge tone={STATUS_TONE[submission.status]}>
          {submission.status}
        </Badge>
      </div>
    </div>
  );
}
