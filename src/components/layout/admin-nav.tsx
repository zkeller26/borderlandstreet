"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/team", label: "Team Members" },
  { href: "/admin/map", label: "Action Map" },
  { href: "/admin/messages", label: "Messages & Requests" },
] as const;

export function AdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  return (
    <div className="border-b border-border bg-surface/50">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 no-scrollbar">
        {TABS.map((tab) => {
          const active =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(tab.href);
          const showDot = tab.href === "/admin/messages" && pendingCount > 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-ember text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {tab.label}
              {showDot && (
                <span className="absolute right-0.5 top-1.5 h-2 w-2 rounded-full bg-ember ring-2 ring-bg" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
