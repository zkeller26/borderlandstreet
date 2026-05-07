"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./poster-map";

const PosterMap = dynamic(() => import("./poster-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[70vh] place-items-center rounded-2xl border border-border bg-surface text-sm text-fg-muted">
      Loading map…
    </div>
  ),
});

export function PosterMapLoader({ pins }: { pins: MapPin[] }) {
  return <PosterMap pins={pins} />;
}
