import Image from "next/image";
import Link from "next/link";
import { InlineFact } from "@/components/shared/fact-value";
import { getFact } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { raceCityName, raceDates, raceTitle, roundFactId } from "@/lib/fan/race";

export type RaceSection = { id: string; label: string };

/**
 * Title block on paper, then the car as a full-width band beneath it: the
 * picture never carries text. The section links double as a table of
 * contents on phones.
 */
export function RaceHeader({ race, upcoming, sections }: { race: Race; upcoming: boolean; sections: RaceSection[] }) {
  const round = roundFactId(race);
  return (
    <header className="flex flex-col">
      <div className="wrap flex flex-col gap-5 pt-8 pb-10 sm:pt-12 lg:pt-16 lg:pb-14">
        <Link href="/" className="kicker w-fit text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink">
          ← The story
        </Link>
        <p className="kicker kicker-rule mt-4">
          {upcoming ? "Race weekend" : `Past race · ${race.season} season`}
        </p>
        <h1 className="h1-feature">{raceTitle(race)}</h1>
        <p className="dek">
          {upcoming
            ? "What the team has published for this race, programmes you can join, and an easy way to the circuit."
            : "What the team published for this round, and the programmes it reported here."}
        </p>
        <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3 font-sans text-[0.9375rem]">
          {race.circuit && (
            <div className="flex flex-col gap-0.5">
              <dt className="kicker text-ink-3">Circuit</dt>
              <dd className="text-ink">{race.circuit}</dd>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <dt className="kicker text-ink-3">Dates</dt>
            <dd className="num text-ink">{raceDates(race)}</dd>
          </div>
          {round && (
            <div className="flex flex-col gap-0.5">
              <dt className="kicker text-ink-3">Round</dt>
              {/* The mark after the number is its trust status; the label beside it says so. */}
              <dd className="flex items-baseline gap-2 text-ink">
                <InlineFact id={round} hideUnit />
                <span className={getFact(round).status === "verified" ? "kicker text-verified" : "kicker text-estimated"}>{getFact(round).status === "verified" ? "Verified" : "Estimated"}</span>
              </dd>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <dt className="kicker text-ink-3">City</dt>
            <dd className="text-ink">{raceCityName(race)}</dd>
          </div>
        </dl>
        <nav aria-label="On this page" className="mt-4 border-t border-line pt-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.9375rem] font-medium">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-2 underline decoration-line-strong decoration-1 underline-offset-[5px] hover:text-ink hover:decoration-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <figure className="flex flex-col">
        <div className="relative h-[clamp(220px,42vw,640px)] w-full overflow-hidden bg-paper-2">
          <Image
            src="/brand/amr26-render-rear.jpg"
            alt="The AMR26 seen from behind on a pale blue ground"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[54%_55%] lg:object-[52%_55%]"
          />
        </div>
        <figcaption className="wrap pt-2 text-right font-sans text-xs text-ink-3">Image: Aston Martin Aramco</figcaption>
      </figure>
    </header>
  );
}
