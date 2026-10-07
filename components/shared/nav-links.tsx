"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "The story", match: (p: string) => p === "/" },
  // The quick check and the card are part of race week, so they sit under Singapore GP.
  {
    href: "/weekend/singapore-2026",
    label: "Singapore GP",
    match: (p: string) => p.startsWith("/weekend") || p.startsWith("/share") || p.startsWith("/quiz"),
  },
  { href: "/partners", label: "Partners", match: (p: string) => p.startsWith("/partners") },
] as const;

/**
 * The method pages stay one tap away for judges but are not headline tabs:
 * the footer carries them, and the phone menu lists them in the same words at footer size.
 */
const SECONDARY_LINKS = [
  { href: "/sources", label: "Every figure and its page" },
  { href: "/how-it-works", label: "How the AI is checked" },
] as const;

/** The header's frame matches the page below it: the partner desk runs wider (1680) than fan pages (1440). */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const desk = pathname.startsWith("/partners");
  return <div className={cn(desk ? "wrap-desk" : "wrap", "flex h-full items-center gap-6")}>{children}</div>;
}

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={cn("h-full min-w-0 items-stretch gap-5 lg:gap-7", className)}>
      {NAV_LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              active && "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Below md: a "Menu" text button opening a full-screen paper sheet. */
export function MobileMenu({ demo, className }: { demo: boolean; className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn("-mr-2 h-11 px-2 text-[0.9375rem] font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus", className)}
        >
          Menu
        </button>
      </SheetTrigger>
      <SheetContent
        side="top"
        showCloseButton={false}
        data-tone="paper"
        className="h-dvh gap-0 border-0 bg-bg p-0 data-[side=top]:h-dvh"
      >
        <div className="wrap flex h-14 shrink-0 items-center justify-between border-b border-line">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl leading-none font-semibold text-ink">
            <span aria-hidden className="block h-4 w-1.5 bg-lime" />
            {APP_NAME}
          </SheetTitle>
          <SheetClose asChild>
            <button type="button" className="-mr-2 h-11 px-2 text-[0.9375rem] font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              Close
            </button>
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav aria-label="Main" className="wrap flex flex-col pt-4">
          {NAV_LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 items-center border-b border-line font-serif text-[1.75rem] leading-tight text-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  active && "font-semibold text-ink",
                )}
              >
                {active && <span aria-hidden className="mr-3 block h-5 w-1.5 bg-lime outline outline-1 outline-ink" />}
                {l.label}
              </Link>
            );
          })}
        </nav>
        <nav aria-label="Sources and method" className="wrap mt-8">
          <ul className="flex flex-col gap-3 text-[0.9375rem]">
            {SECONDARY_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                  className="link"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {demo && (
          <p className="wrap mt-8 text-sm text-ink-3">
            Offline demo: generated text comes from a local cache, so this runs with no network.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
