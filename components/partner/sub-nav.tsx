"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/partners", label: "Overview" },
  { href: "/partners/narratives", label: "Narratives" },
  { href: "/partners/scenarios", label: "Scenarios" },
  { href: "/partners/story-kit", label: "Story kit" },
];

export function PartnerSubNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Partner dashboard"
      className="sticky top-14 z-30 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-bg/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-bg/80 sm:-mx-6 sm:px-6"
    >
      {LINKS.map((l) => {
        const active = l.href === "/partners" ? pathname === "/partners" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "label relative shrink-0 px-3 py-3 text-ink-2 transition-colors hover:text-ink",
              active && "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-lime",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
