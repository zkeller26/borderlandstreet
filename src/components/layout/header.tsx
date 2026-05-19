import { HamburgerMenu } from "./hamburger-menu";
import { Logo } from "./logo";
import { NotificationBell } from "./notification-bell";
import type { Profile } from "@/types/database";

export function AppHeader({
  profile,
  unreadCount = 0,
}: {
  profile: Profile | null;
  unreadCount?: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-1">
          <NotificationBell unreadCount={unreadCount} />
          <HamburgerMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
