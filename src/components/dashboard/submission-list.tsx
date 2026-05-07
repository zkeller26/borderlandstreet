"use client";

import { useState } from "react";
import { SubmissionRow } from "./submission-row";
import { cn } from "@/lib/utils";
import type { Submission, SubmissionType } from "@/types/database";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "poster", label: "Posters" },
  { value: "event", label: "Event Flyers" },
  { value: "social", label: "Social" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export function SubmissionList({ submissions }: { submissions: Submission[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.type === (filter as SubmissionType));

  const counts = {
    all: submissions.length,
    poster: submissions.filter((s) => s.type === "poster").length,
    event: submissions.filter((s) => s.type === "event").length,
    social: submissions.filter((s) => s.type === "social").length,
  };

  return (
    <div>
      <div className="mb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-ember/40 bg-ember/15 text-ember"
                  : "border-border bg-surface-2/40 text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                {counts[f.value]}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong bg-surface/50 px-4 py-6 text-center text-sm text-fg-muted">
          No {filter === "all" ? "" : `${filter} `}submissions yet
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <SubmissionRow key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}
