"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ALL_CITIES, type CoverageCell } from "@/lib/coords";

// Cities that have at least 1 ambassador on them appear in `covered` —
// every other city in CITY_COORDS gets a faint "uncovered" dot so the admin
// can see gaps at a glance.
export default function CoverageMap({
  covered,
  height = "70vh",
}: {
  covered: CoverageCell[];
  height?: string;
}) {
  const coveredByCity = new Map(covered.map((c) => [c.city, c]));
  const maxCount = Math.max(1, ...covered.map((c) => c.ambassadorCount));

  // Center on the rough middle of WNY/Ontario region
  const center: [number, number] = [42.9, -78.5];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%", background: "#0d100c" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Uncovered cities — small gray dots */}
        {ALL_CITIES.filter((c) => !coveredByCity.has(c.city)).map((c) => (
          <CircleMarker
            key={`uncovered-${c.city}`}
            center={[c.lat, c.lng]}
            radius={4}
            pathOptions={{
              color: "#3b4536",
              fillColor: "#1d231b",
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {c.city}
                </strong>
                <div style={{ fontSize: 12, color: "#999" }}>
                  No ambassadors yet
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Covered cities — ember-colored, scaled by ambassador count */}
        {covered.map((c) => {
          const radius = 8 + (c.ambassadorCount / maxCount) * 14;
          return (
            <CircleMarker
              key={`covered-${c.city}`}
              center={[c.lat, c.lng]}
              radius={radius}
              pathOptions={{
                color: "#e88a3a",
                fillColor: "#e88a3a",
                fillOpacity: 0.45,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong style={{ display: "block", marginBottom: 4 }}>
                    {c.city}
                  </strong>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                    {c.ambassadorCount} ambassador
                    {c.ambassadorCount === 1 ? "" : "s"}
                  </div>
                  <div style={{ fontSize: 12, color: "#444" }}>
                    {c.ambassadorNames.join(", ")}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
