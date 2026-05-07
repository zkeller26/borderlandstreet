"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const ALL_RECIPIENTS = "__ALL__";

export function RecipientPicker({
  ambassadors,
  value,
  onChange,
}: {
  ambassadors: { id: string; full_name: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    requestAnimationFrame(() => searchRef.current?.focus());
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? ambassadors.filter((a) => a.full_name.toLowerCase().includes(q))
    : ambassadors;

  const selectedLabel =
    value === ALL_RECIPIENTS
      ? `All team members (${ambassadors.length})`
      : ambassadors.find((a) => a.id === value)?.full_name;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition-colors hover:border-border-strong focus:border-ember/60 focus:outline-none"
      >
        <span
          className={cn(
            "flex items-center gap-2 truncate",
            !selectedLabel && "text-fg-subtle",
          )}
        >
          {value === ALL_RECIPIENTS && <Users className="h-4 w-4 text-ember" />}
          {selectedLabel ?? "Choose a team member…"}
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
          <div className="flex items-center gap-2 border-b border-border bg-surface-2/40 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-fg-subtle" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team members…"
              className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Pinned: Message ALL */}
            <button
              type="button"
              onClick={() => {
                onChange(ALL_RECIPIENTS);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 border-b border-border bg-ember/10 px-4 py-2.5 text-left text-sm text-ember transition-colors hover:bg-ember/20"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Message ALL team members ({ambassadors.length})
              </span>
              {value === ALL_RECIPIENTS && <Check className="h-4 w-4" />}
            </button>

            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-fg-muted">
                No matches for "{query}"
              </p>
            ) : (
              filtered.map((a) => {
                const checked = value === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onChange(a.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
                  >
                    <span>{a.full_name}</span>
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
