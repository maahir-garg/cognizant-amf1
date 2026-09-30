import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { HeaderFrame, MobileMenu, NavLinks } from "./nav-links";

/** Solid 56px paper bar. No blur or transparency: the story's sticky stage sits directly beneath it. */
export function SiteHeader({ demo }: { demo: boolean }) {
  return (
    <header data-tone="paper" className="sticky top-0 z-40 h-14 border-b border-line">
      <HeaderFrame>
        <Wordmark />
        <NavLinks className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-3">
          {demo && <DemoPill />}
          <MobileMenu demo={demo} className="md:hidden" />
        </div>
      </HeaderFrame>
    </header>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${APP_NAME}, the story`}>
      <span aria-hidden className="block h-4 w-1.5 bg-lime" />
      <span className="font-serif text-xl leading-none font-semibold text-ink">{APP_NAME}</span>
    </Link>
  );
}

function DemoPill() {
  return (
    <span
      className="kicker shrink-0 rounded-sm border border-line-strong px-2 py-0.5 text-ink-2"
      title="Runs with no network: generated text is served from the offline cache"
    >
      Offline demo
    </span>
  );
}
