import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "approved" | "pending" | "rejected" | "ember";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg-muted border-border",
  approved: "bg-success/15 text-success border-success/30",
  pending: "bg-warn/15 text-warn border-warn/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
  ember: "bg-ember/15 text-ember border-ember/30",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
