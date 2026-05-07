"use client";

import dynamic from "next/dynamic";
import type { CoverageCell } from "@/lib/coords";

const CoverageMap = dynamic(() => import("./coverage-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[70vh] place-items-center rounded-2xl border border-border bg-surface text-sm text-fg-muted">
      Loading coverage…
    </div>
  ),
});

export function CoverageMapLoader({ covered }: { covered: CoverageCell[] }) {
  return <CoverageMap covered={covered} />;
}
