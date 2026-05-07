import { Shield, LogOut } from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";
import { Logo } from "./logo";
import type { Profile } from "@/types/database";

export function AdminHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo href="/admin" />
          <span className="inline-flex items-center gap-1 rounded-full border border-ember/30 bg-ember/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
            <Shield className="h-3 w-3" /> Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <span className="hidden text-sm text-fg-muted sm:inline">
              {profile.full_name}
            </span>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
