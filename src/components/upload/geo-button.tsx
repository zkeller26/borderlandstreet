"use client";

import { useState } from "react";
import { MapPin, Loader2, Check } from "lucide-react";

export function GeoButton({ required = false }: { required?: boolean }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function grab() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported on this device.");
      return;
    }
    setBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
      },
      (err) => {
        setError(err.message);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div>
      <input
        type="hidden"
        name="lat"
        value={coords?.lat ?? ""}
        required={required}
      />
      <input
        type="hidden"
        name="lng"
        value={coords?.lng ?? ""}
        required={required}
      />
      <button
        type="button"
        onClick={grab}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
          coords
            ? "border-success/40 bg-success/10 text-success"
            : "border-ember/40 bg-ember/10 text-ember hover:bg-ember/15"
        }`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : coords ? (
          <Check className="h-4 w-4" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {coords
          ? `Pinned · ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
          : busy
            ? "Getting location…"
            : required
              ? "Drop a pin (required)"
              : "Drop a pin (optional)"}
      </button>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {required && !coords && !busy && (
        <p className="mt-1.5 text-xs text-fg-muted">
          GPS is required so admins can map where posters were placed.
        </p>
      )}
    </div>
  );
}
