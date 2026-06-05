"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const emberIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#e88a3a;border:3px solid #161a14;box-shadow:0 0 0 3px rgba(232,138,58,0.45)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickableLayer({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Re-pans the Leaflet map whenever the target lat/lng changes.
 * MapContainer only honors `center`/`zoom` on initial mount — without this
 * the map would never follow a pin dropped via the GPS button.
 */
function RecenterOnChange({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

export default function PinPickerMap({
  initial,
  centerOn,
  onPick,
}: {
  /** Pre-existing pin — both centers map AND drops a visible marker */
  initial?: { lat: number; lng: number } | null;
  /** Center the view here, but don't drop a marker (e.g., user's GPS for context) */
  centerOn?: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}) {
  // Internal marker state — seeded from `initial` and kept in sync with it
  // so a pin dropped via the GPS button (which updates `initial`) shows up
  // automatically on the map.
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initial ?? null,
  );

  useEffect(() => {
    if (initial) setMarker(initial);
  }, [initial?.lat, initial?.lng]);

  const center: [number, number] = marker
    ? [marker.lat, marker.lng]
    : centerOn
      ? [centerOn.lat, centerOn.lng]
      : [42.8864, -78.8784]; // default Buffalo

  const zoom = marker || centerOn ? 15 : 11;

  return (
    <div className="h-[55vh] overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#0d100c" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ClickableLayer
          onPick={(lat, lng) => {
            setMarker({ lat, lng });
            onPick(lat, lng);
          }}
        />
        {marker && (
          <>
            <Marker position={[marker.lat, marker.lng]} icon={emberIcon} />
            <RecenterOnChange lat={marker.lat} lng={marker.lng} zoom={15} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
