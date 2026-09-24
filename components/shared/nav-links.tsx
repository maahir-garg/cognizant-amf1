"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/start", label: "Fan lap", match: ["/start", "/lap", "/share", "/act"] },
  { href: "/weekend/singapore-2026", label: "Singapore GP", match: ["/weekend"] },
  { href: "/partners", label: "Partners", match: ["/partners"] },
  { href: "/sources", label: "Sources", match: ["/sources"] },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="-mx-2 flex min-w-0 items-center gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.match.some((m) => pathname.startsWith(m));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative shrink-0 px-2 py-4 text-sm font-medium text-ink-2 transition-colors hover:text-ink",
              active && "text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-lime",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
