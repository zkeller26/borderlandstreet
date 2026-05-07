"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

export function ChipList({
  values,
  onChange,
  placeholder = "Add an item…",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-3 text-fg outline-none placeholder:text-fg-subtle focus:border-ember/60"
        />
        <button
          type="button"
          onClick={add}
          className="grid h-12 w-12 place-items-center rounded-xl bg-ember text-bg transition-colors hover:bg-ember-hover"
          aria-label="Add"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {values.length > 0 && (
        <ul className="mt-3 space-y-2">
          {values.map((v) => (
            <li
              key={v}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm"
            >
              <span className="truncate">{v}</span>
              <button
                type="button"
                onClick={() => remove(v)}
                className="grid h-7 w-7 place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-danger"
                aria-label={`Remove ${v}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
