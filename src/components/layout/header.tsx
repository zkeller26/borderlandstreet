import { HamburgerMenu } from "./hamburger-menu";
import { Logo } from "./logo";
import type { Profile } from "@/types/database";

export function AppHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo href="/dashboard" />
        <HamburgerMenu profile={profile} />
      </div>
    </header>
  );
}
