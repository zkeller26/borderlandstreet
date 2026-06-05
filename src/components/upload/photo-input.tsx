"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export function PhotoInput({ name = "photo" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  }

  return (
    <div>
      {/*
        NOTE: no `capture` attribute on purpose. On iOS Safari `capture="environment"`
        forces the rear camera and HIDES the photo library, so users can't pick an
        existing photo. Omitting it lets iOS show its native "Take Photo / Photo
        Library / Choose Files" picker.
      */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        required
        onChange={onChange}
        className="sr-only"
        id="photo-input"
      />
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-64 w-full object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-bg/80 text-fg backdrop-blur hover:bg-bg"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="photo-input"
          className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong bg-surface-2/40 text-fg-muted transition-colors hover:border-ember/40 hover:bg-surface-2 hover:text-fg"
        >
          <Camera className="h-7 w-7" />
          <span className="text-sm font-medium">
            Take photo or choose from library
          </span>
          <span className="text-xs text-fg-subtle">JPG / PNG · max 10 MB</span>
        </label>
      )}
    </div>
  );
}
