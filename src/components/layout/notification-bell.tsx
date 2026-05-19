import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const hasUnread = unreadCount > 0;
  return (
    <Link
      href="/messages"
      aria-label={
        hasUnread
          ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
          : "Messages"
      }
      className="relative grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Bell className="h-5 w-5" />
      {hasUnread && (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ember px-1 text-[9px] font-semibold text-bg ring-2 ring-bg">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
