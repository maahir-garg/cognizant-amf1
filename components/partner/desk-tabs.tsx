"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const DESK_TABS = [
  { href: "/partners", label: "This race week" },
  { href: "/partners/narratives", label: "Narratives" },
  { href: "/partners/check", label: "Check my draft" },
  { href: "/partners/scenarios", label: "Scenarios" },
  { href: "/partners/story-kit", label: "Story kit" },
  { href: "/partners/data-quality", label: "Data quality" },
  { href: "/partners/measures", label: "Measures" },
  { href: "/partners/export", label: "Export" },
] as const;

/**
 * The desk's tabs, sticky under the site header. On a phone the strip
 * scrolls sideways inside itself; the page never does.
 */
export function DeskTabs() {
  const pathname = usePathname();
  return (
    <div data-tone="paper" className="sticky top-14 z-30 border-b border-line">
      <nav aria-label="Impact desk" className="wrap-desk flex items-stretch gap-6 overflow-x-auto [scrollbar-width:none]">
        {DESK_TABS.map((t) => {
          const active = t.href === "/partners" ? pathname === "/partners" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-12 shrink-0 items-center text-[0.9375rem] font-medium whitespace-nowrap text-ink-2 transition-colors hover:text-ink",
                active && "font-semibold text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
