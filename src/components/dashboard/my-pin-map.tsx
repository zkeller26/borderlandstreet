"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/components/admin/poster-map";

const PosterMap = dynamic(() => import("@/components/admin/poster-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-64 place-items-center rounded-2xl border border-border bg-surface text-sm text-fg-muted">
      Loading map…
    </div>
  ),
});

export function MyPinMap({ pins }: { pins: MapPin[] }) {
  return <PosterMap pins={pins} height="16rem" />;
}
