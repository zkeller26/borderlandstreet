"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  ambassador?: string;
  status: string;
  photoUrl: string | null;
  address?: string | null;
};

const emberIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#e88a3a;border:2px solid #161a14;box-shadow:0 0 0 2px rgba(232,138,58,0.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function PosterMap({
  pins,
  height = "70vh",
}: {
  pins: MapPin[];
  height?: string;
}) {
  const center: [number, number] =
    pins.length > 0
      ? [
          pins.reduce((s, p) => s + p.lat, 0) / pins.length,
          pins.reduce((s, p) => s + p.lng, 0) / pins.length,
        ]
      : [42.8864, -78.8784];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={pins.length > 1 ? 10 : 12}
        style={{ height: "100%", width: "100%", background: "#0d100c" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={emberIcon}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {pin.title}
                </strong>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {pin.ambassador ? `by ${pin.ambassador} · ` : ""}
                  {pin.status}
                </div>
                {pin.address && (
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {pin.address}
                  </div>
                )}
                {pin.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pin.photoUrl}
                    alt=""
                    style={{
                      width: "100%",
                      marginTop: 8,
                      borderRadius: 6,
                      maxHeight: 140,
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
