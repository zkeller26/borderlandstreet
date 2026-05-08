"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Check, X, Map } from "lucide-react";

const PinPickerMap = dynamic(() => import("./pin-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[55vh] place-items-center rounded-2xl border border-border bg-surface text-sm text-fg-muted">
      Loading map…
    </div>
  ),
});

type Coords = { lat: number; lng: number };

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
  return isIOS && isSafari;
}

function describeError(err: GeolocationPositionError): {
  short: string;
  hint: string | null;
} {
  switch (err.code) {
    case 1: // PERMISSION_DENIED
      return {
        short: "Location permission denied",
        hint: isIOSSafari()
          ? "Tap the 'aA' button in the URL bar → Website Settings → Location → Allow. Or use the map below."
          : "Allow location for this site in your browser settings, or use the map below.",
      };
    case 2: // POSITION_UNAVAILABLE
      return {
        short: "Couldn't determine your location",
        hint: "GPS may be weak — try moving outside, or drop your pin on the map below.",
      };
    case 3: // TIMEOUT
      return {
        short: "Location request timed out",
        hint: "Try again, or drop your pin on the map below.",
      };
    default:
      return { short: err.message, hint: "Drop your pin on the map below." };
  }
}

export function GeoButton({ required = false }: { required?: boolean }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ short: string; hint: string | null } | null>(
    null,
  );
  const [showMap, setShowMap] = useState(false);
  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);

  // Probe Permissions API on mount so we can warn proactively if denied
  useEffect(() => {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) return;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        setPermissionState(status.state);
        status.onchange = () => setPermissionState(status.state);
      })
      .catch(() => {});
  }, []);

  function grab() {
    if (!navigator.geolocation) {
      setError({
        short: "Geolocation isn't supported on this device.",
        hint: "Drop your pin on the map below.",
      });
      return;
    }
    // Call geolocation FIRST inside the user-gesture handler so Safari
    // recognises this as an authentic user-initiated request.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
        setError(null);
      },
      (err) => {
        setError(describeError(err));
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    setBusy(true);
    setError(null);
  }

  function handleManualPick(lat: number, lng: number) {
    setCoords({ lat, lng });
    setError(null);
  }

  return (
    <div className="space-y-2">
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
              ? "Use my GPS (required)"
              : "Use my GPS"}
      </button>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs">
          <p className="font-medium text-danger">{error.short}</p>
          {error.hint && <p className="mt-0.5 text-fg-muted">{error.hint}</p>}
        </div>
      )}

      {permissionState === "denied" && !error && !coords && (
        <p className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          Location is blocked for this site.{" "}
          {isIOSSafari()
            ? "Tap 'aA' in URL bar → Website Settings → Location → Allow."
            : "Allow it in browser settings,"}{" "}
          or drop your pin on the map below.
        </p>
      )}

      {/* Always-available manual fallback */}
      {!showMap ? (
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-transparent px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-ember/40 hover:text-ember"
        >
          <Map className="h-4 w-4" />
          {coords ? "Adjust pin on map" : "Drop a pin on the map instead"}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-fg-muted">
            <span>Tap anywhere on the map to drop your pin.</span>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="grid h-6 w-6 place-items-center rounded-md text-fg-subtle hover:bg-surface hover:text-fg"
              aria-label="Close map"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <PinPickerMap initial={coords ?? null} onPick={handleManualPick} />
          {coords && (
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-success/15 px-4 py-2.5 text-sm font-medium text-success hover:bg-success/25"
            >
              <Check className="h-4 w-4" /> Confirm pin
            </button>
          )}
        </div>
      )}

      {required && !coords && !busy && !error && (
        <p className="text-xs text-fg-muted">
          GPS is required so admins can map where posters were placed.
        </p>
      )}
    </div>
  );
}
