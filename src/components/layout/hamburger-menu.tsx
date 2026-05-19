"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  UserCog,
  MessageCircle,
  Package,
  FileText,
  BookOpen,
  LogOut,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";
import type { Profile } from "@/types/database";

const ITEMS = [
  { href: "/profile", label: "Edit profile", icon: UserCog, key: "profile" as const },
  { href: "/messages", label: "Message admin", icon: MessageCircle, key: "messages" as const },
  { href: "/requests/posters", label: "Request posters", icon: FileText, key: "posters" as const },
  { href: "/requests/flyers", label: "Request flyers", icon: Package, key: "flyers" as const },
  { href: "/guide", label: "Street Team Guide", icon: BookOpen, key: "guide" as const },
] as const;

export function HamburgerMenu({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          {profile && (
            <div className="border-b border-border bg-surface-2/50 px-4 py-3">
              <p className="truncate text-sm font-medium text-fg">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-fg-muted">{profile.email}</p>
            </div>
          )}

          <ul className="py-2">
            {ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  <Icon className="h-4 w-4 text-fg-muted" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <form action={signOutAction} className="border-t border-border">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
