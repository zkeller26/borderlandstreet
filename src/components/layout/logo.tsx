import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/borderland-logo.svg"
        alt="Borderland"
        className="h-8 w-auto"
      />
      <span className="font-display text-[22px] uppercase leading-none tracking-wide text-fg">
        Borderland<span className="text-ember">.</span>Street
      </span>
    </Link>
  );
}
