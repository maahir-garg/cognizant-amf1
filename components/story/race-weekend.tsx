import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getRace, getSource, sourceShortName } from "@/lib/data/load";
import { formatDate } from "@/lib/format";
import { formatDateRange } from "@/lib/story/dates";
import { QuickCheckTitle } from "./quick-check-title";

const EXITS = [
  {
    label: "Take part",
    title: "Real programmes around the race",
    line: "STEM Racing and Unearth Your Greatness, the programmes the team runs with young people, and how to join in.",
    href: "#take-part",
    cta: "See the programmes",
  },
  {
    label: "Getting there",
    title: "Your trip to Marina Bay",
    line: "Pick your home city and compare the MRT, a taxi and driving for the trip to the circuit.",
    href: "#getting-there",
    cta: "Plan your trip",
  },
  {
    label: "Quick check",
    title: null,
    line: "Questions on what you have just read, with a badge for your race-week card. No score, no ranking.",
    href: "/quiz",
    cta: "Take the quick check",
  },
];

/** The ending: the Singapore Grand Prix weekend, with three exits and one primary action. */
export function RaceWeekend({ raceId }: { raceId: string }) {
  const race = getRace(raceId);
  const report = getSource("esg-2025");
  return (
    <section id="race-weekend" data-tone="paper" aria-labelledby="race-weekend-title" className="border-t border-line">
      <div className="wrap py-[clamp(64px,10vw,128px)]">
        <p className="kicker kicker-rule">
          {race.name.replace(/\s*\d{4}$/, "")}
          {race.start && ` · ${formatDateRange(race.start, race.end ?? race.start)}`}
        </p>
        <h2 id="race-weekend-title" className="h2-chapter mt-3 max-w-[20ch]">
          Your race weekend at Marina Bay
        </h2>
        <p className="dek mt-4 max-w-[40ch]">
          The car you have followed races under the lights at {race.circuit ? `the ${race.circuit}` : "Marina Bay"}. Here is how to be part of the weekend.
        </p>

        <ul className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-3 lg:mt-14">
          {EXITS.map((x) => {
            const href = x.href.startsWith("#") ? `/weekend/${race.id}${x.href}` : x.href;
            return (
              <li key={x.label} className="flex flex-col gap-2 border-t-2 border-ink pt-4">
                <span className="kicker text-ink-3">{x.label}</span>
                <h3 className="h3">{x.title ?? <QuickCheckTitle />}</h3>
                <p className="font-serif text-lg leading-snug text-ink-2">{x.line}</p>
                <Link href={href} className="link mt-auto pt-2 font-sans text-base font-semibold">
                  {x.cta} →
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex flex-col items-start gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <div className="flex flex-col gap-1">
            <p className="font-serif text-xl leading-snug text-ink">Take the weekend with you.</p>
            <p className="text-[0.9375rem] text-ink-2">Your travel plan, your quiz badge and one sourced team fact, on a card sized for stories.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/share">Make your race-week card</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem]">
          <Link href="/sources" className="link">
            Check every figure
          </Link>
          <Link href="/partners" className="link">
            For partners
          </Link>
          <span className="text-[0.8125rem] text-ink-3">
            Figures from the {sourceShortName(report.id)} (retrieved {formatDate(report.retrieved)}). Updated when the team publishes.
          </span>
        </div>
      </div>
    </section>
  );
}
