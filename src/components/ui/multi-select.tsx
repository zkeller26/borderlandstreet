"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectGroup = {
  region: string;
  cities: readonly string[] | string[];
};

export function MultiSelect({
  options,
  groups,
  selected,
  onChange,
  placeholder = "Select…",
}: {
  /** Flat list of options (use this OR groups, not both) */
  options?: readonly string[] | string[];
  /** Grouped options with section headers */
  groups?: readonly MultiSelectGroup[] | MultiSelectGroup[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // autofocus the search and reset filter on open
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [open]);

  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  const q = query.trim().toLowerCase();
  const matches = (s: string) => s.toLowerCase().includes(q);

  // Pre-filter so we know if anything matches
  const filteredGroups = groups
    ? groups
        .map((g) => ({
          region: g.region,
          cities: (g.cities as readonly string[]).filter(
            (c) => !q || matches(c),
          ),
        }))
        .filter((g) => g.cities.length > 0)
    : [];
  const filteredOptions = !groups
    ? (options ?? []).filter((o) => !q || matches(o))
    : [];

  const hasResults = groups
    ? filteredGroups.length > 0
    : filteredOptions.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition-colors hover:border-border-strong focus:border-ember/60 focus:outline-none"
      >
        <span
          className={cn(
            "flex flex-wrap gap-1.5",
            selected.length === 0 && "text-fg-subtle",
          )}
        >
          {selected.length === 0
            ? placeholder
            : selected.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-ember/15 px-2 py-0.5 text-xs text-ember"
                >
                  {s}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(s);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle(s);
                      }
                    }}
                    className="cursor-pointer rounded-full p-0.5 hover:bg-ember/30"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-fg-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {/* Search bar */}
          <div className="flex items-center gap-2 border-b border-border bg-surface-2/40 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-fg-subtle" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              placeholder="Search cities or schools…"
              className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-fg-subtle hover:bg-surface hover:text-fg"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {!hasResults ? (
              <p className="px-4 py-6 text-center text-sm text-fg-muted">
                No matches for "{query}"
              </p>
            ) : groups ? (
              filteredGroups.map((group) => (
                <div key={group.region}>
                  <div className="sticky top-0 border-b border-border bg-surface-2/95 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-fg-muted backdrop-blur">
                    {group.region}
                  </div>
                  {group.cities.map((opt) => {
                    const checked = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
                      >
                        <span>{opt}</span>
                        {checked && <Check className="h-4 w-4 text-ember" />}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
                  >
                    <span>{opt}</span>
                    {checked && <Check className="h-4 w-4 text-ember" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
