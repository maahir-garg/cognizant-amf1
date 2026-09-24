import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { NavLinks } from "./nav-links";

export function SiteHeader({ demo }: { demo: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${APP_NAME} home`}>
          <span aria-hidden className="block h-4 w-1.5 bg-lime" />
          <span className="display text-xl">{APP_NAME}</span>
        </Link>
        <NavLinks />
        {demo && (
          <span className="label ml-auto hidden shrink-0 rounded-sm border border-line px-2 py-1 sm:inline" title="AI text is served from the offline cache; no network needed">
            Offline demo
          </span>
        )}
      </div>
    </header>
  );
}
