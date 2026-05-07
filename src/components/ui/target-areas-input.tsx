"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MultiSelect } from "./multi-select";
import { TARGET_CITY_GROUPS, TARGET_CITIES } from "@/lib/points";

export function TargetAreasInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  // Anything in `value` not in our preset list is a custom add — surface it for review
  const presetSet = new Set<string>(TARGET_CITIES);
  const customs = value.filter((v) => !presetSet.has(v));

  function addCustom() {
    const v = draft.trim();
    if (!v || value.includes(v)) {
      setDraft("");
      setAdding(false);
      return;
    }
    onChange([...value, v]);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      <MultiSelect
        groups={TARGET_CITY_GROUPS}
        selected={value}
        onChange={onChange}
        placeholder="Choose cities/towns…"
      />

      {customs.length > 0 && (
        <div className="rounded-xl border border-ember/20 bg-ember/5 px-3 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
            Custom areas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {customs.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full bg-ember/15 px-2 py-0.5 text-xs text-ember"
              >
                {c}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((x) => x !== c))}
                  className="grid h-4 w-4 place-items-center rounded-full hover:bg-ember/30"
                  aria-label={`Remove ${c}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
              if (e.key === "Escape") {
                setAdding(false);
                setDraft("");
              }
            }}
            placeholder="e.g. Findley Lake, NY"
            className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-xl bg-ember px-4 text-sm font-medium text-bg hover:bg-ember-hover"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
            className="rounded-xl border border-border px-3 text-sm text-fg-muted hover:bg-surface-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border-strong bg-transparent px-3 py-2 text-sm text-fg-muted transition-colors hover:border-ember/40 hover:text-ember"
        >
          <Plus className="h-3.5 w-3.5" />
          Custom Target Area
        </button>
      )}
    </div>
  );
}
