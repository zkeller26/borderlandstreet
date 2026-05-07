import Link from "next/link";
import { Camera, Megaphone, Smartphone } from "lucide-react";

const ACTIONS = [
  {
    href: "/upload/poster",
    icon: Camera,
    label: "Poster Proof",
    points: "+5 pts",
  },
  {
    href: "/upload/event",
    icon: Megaphone,
    label: "Event Promo",
    points: "+10 pts",
  },
  {
    href: "/upload/social",
    icon: Smartphone,
    label: "Social Post",
    points: "+5–10 pts",
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map(({ href, icon: Icon, label, points }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:bg-surface-2"
        >
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-ember/15 text-ember transition-colors group-hover:bg-ember/25">
            <Icon className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium text-fg">{label}</span>
          <span className="text-xs text-fg-muted">{points}</span>
        </Link>
      ))}
    </div>
  );
}
