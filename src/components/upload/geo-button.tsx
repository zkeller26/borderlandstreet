"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Check, Map, AlertTriangle } from "lucide-react";

const PinPickerMap = dynamic(() => import("./pin-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[55vh] place-items-center rounded-2xl border border-border bg-surface text-sm text-fg-muted">
      Loading map…
    </div>
  ),
});

type Coords = { lat: number; lng: number };

const SILENT_FAIL_TIMEOUT_MS = 6000;
const GEO_TIMEOUT_MS = 15000;

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
  return isIOS && isSafari;
}

function describeError(err: GeolocationPositionError): {
  short: string;
  hint: string;
} {
  switch (err.code) {
    case 1:
      return {
        short: "Location permission denied",
        hint: isIOSSafari()
          ? "Tap the 'aA' button in your URL bar → Website Settings → Location → Allow. Or just drop your pin on the map below."
          : "Allow location for this site in your browser, or use the map below.",
      };
    case 2:
      return {
        short: "Couldn't determine your location",
        hint: "GPS may be weak. Try moving outside, or drop your pin on the map below.",
      };
    case 3:
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
  const [error, setError] = useState<{ short: string; hint: string } | null>(
    null,
  );
  const silentFailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSilentFailTimer() {
    if (silentFailTimerRef.current) {
      clearTimeout(silentFailTimerRef.current);
      silentFailTimerRef.current = null;
    }
  }

  useEffect(() => () => clearSilentFailTimer(), []);

  function grab() {
    if (!navigator.geolocation) {
      setError({
        short: "Geolocation isn't supported on this device",
        hint: "Drop your pin on the map below.",
      });
      return;
    }

    // Fire the API call FIRST inside the user-gesture handler so iOS Safari
    // ties it to the click. Anything else (setState, etc.) goes after.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearSilentFailTimer();
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
        setError(null);
      },
      (err) => {
        clearSilentFailTimer();
        setError(describeError(err));
        setBusy(false);
      },
      {
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 0,
      },
    );

    setBusy(true);
    setError(null);

    // Safari sometimes silently no-ops when a site permission was previously
    // denied — neither callback fires. Surface our own error after 6s so the
    // UI doesn't hang on a spinner.
    clearSilentFailTimer();
    silentFailTimerRef.current = setTimeout(() => {
      setError({
        short: "No response from your browser",
        hint: isIOSSafari()
          ? "iOS Safari may have silently blocked the request. Tap 'aA' in URL bar → Website Settings → Location → Allow, then try again. Or drop your pin on the map below."
          : "Drop your pin on the map below to continue.",
      });
      setBusy(false);
    }, SILENT_FAIL_TIMEOUT_MS);
  }

  function handleManualPick(lat: number, lng: number) {
    setCoords({ lat, lng });
    setError(null);
  }

  return (
    <div className="space-y-3">
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
            : "Use my GPS"}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div>
            <p className="font-medium text-danger">{error.short}</p>
            <p className="mt-0.5 text-fg-muted">{error.hint}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 right-0 top-1/2 -translate-y-1/2">
          <div className="border-t border-border" />
        </div>
        <p className="relative mx-auto inline-block bg-bg px-2 text-center text-[10px] uppercase tracking-wider text-fg-subtle">
          or
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2/30 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs text-fg-muted">
          <Map className="h-3.5 w-3.5 text-ember" />
          <span>
            <span className="font-medium text-fg">Tap the map</span> to drop a
            pin where the poster is
          </span>
        </div>
        <PinPickerMap initial={coords ?? null} onPick={handleManualPick} />
        {coords && (
          <p className="mt-2 text-center text-xs text-success">
            ✓ Pin placed · {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        )}
      </div>

      {required && !coords && !busy && !error && (
        <p className="text-xs text-fg-muted">
          A pin is required so admins can map where posters were placed.
        </p>
      )}
    </div>
  );
}
