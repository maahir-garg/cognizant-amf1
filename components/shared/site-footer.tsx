import Link from "next/link";
import { FOOTER_LABEL } from "@/lib/config";
import { DataGap, StatusLegend } from "./status-badge";

export function SiteFooter() {
  return (
    <footer data-tone="green" className="mt-auto">
      <div className="wrap grid gap-10 py-12 md:grid-cols-3 md:gap-8 lg:py-16">
        <section aria-labelledby="footer-about" className="flex flex-col gap-3">
          <h2 id="footer-about" className="kicker kicker-rule">
            About the prototype
          </h2>
          <p className="font-serif text-lg leading-snug text-ink">
            A concept built for the Cognizant × Aston Martin Aramco Gen-AI Ideathon. Not an official team product.
          </p>
          <p className="text-sm text-ink-2">{FOOTER_LABEL}</p>
        </section>

        <section aria-labelledby="footer-sources" className="flex flex-col gap-3">
          <h2 id="footer-sources" className="kicker kicker-rule">
            Sources and method
          </h2>
          <p className="text-sm leading-relaxed text-ink-2">
            Figures come from the team&apos;s Make A Mark reports and named public references. Updated when the team publishes.
          </p>
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            <li>
              <Link href="/sources" className="link">
                Every figure and its page
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="link">
                How the AI is checked
              </Link>
            </li>
            <li>
              <a href="/api/partner/metrics" className="link">
                Metrics as JSON
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="footer-legend" className="flex flex-col gap-3">
          <h2 id="footer-legend" className="kicker kicker-rule">
            Reading the labels
          </h2>
          <StatusLegend variant="list" />
          <DataGap className="mt-1">The team has not published this figure, so we show nothing rather than guess.</DataGap>
        </section>
      </div>
      <div className="border-t border-line">
        <p className="wrap py-4 text-xs text-ink-3">Car imagery: Aston Martin Aramco. Used for this collaboration prototype.</p>
      </div>
    </footer>
  );
}
