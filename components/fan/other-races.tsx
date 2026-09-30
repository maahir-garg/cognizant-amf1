import Link from "next/link";
import { getSource } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { hasTrackside, isUpcoming, latestTeamSource, orderedRaces, raceDates, raceProgrammes, raceTitle } from "@/lib/fan/race";

/** "Updated when the team publishes": the product never claims live data. */
export function UpdatedLine() {
  const { source, checked } = latestTeamSource();
  return (
    <p className="font-sans text-[0.9375rem] text-ink-2">
      <span className="font-semibold text-ink">Updated when the team publishes.</span> Latest source: {source.title}
      {source.published ? ` (published ${source.published})` : ""}, checked {checked}. Nothing on this page is live data.{" "}
      <Link href="/sources" className="link">
        All sources
      </Link>
    </p>
  );
}

function whatsPublished(race: Race): string {
  const parts: string[] = [];
  if (hasTrackside(race)) parts.push("trackside energy");
  if (raceProgrammes(race).some((p) => p.where !== "online")) parts.push("programmes");
  return parts.length ? parts.join(", ") : "race dates only";
}

function RaceList({ items, past }: { items: Race[]; past: boolean }) {
  return (
    <ul className="grid border-t border-line-strong sm:grid-cols-2 sm:gap-x-6 xl:grid-cols-3">
      {items.map((r) => (
        <li key={r.id} className="border-b border-line">
          <Link href={`/weekend/${r.id}`} className="group flex flex-col gap-1 py-4">
            {past && <span className="kicker text-ink-3">Past race</span>}
            <span className="font-serif text-xl font-medium text-ink underline decoration-transparent decoration-1 underline-offset-4 group-hover:decoration-ink">
              {raceTitle(r)} <span className="num text-ink-3">{r.season}</span>
            </span>
            <span className="font-sans text-sm text-ink-2">{[r.circuit, r.start ? raceDates(r) : null].filter(Boolean).join(" · ")}</span>
            <span className="font-sans text-sm text-ink-3">Published: {whatsPublished(r)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Every other race page: upcoming weekends first, then past rounds, each
 * labelled, so Singapore 2025 never reads as this year's race.
 */
export function OtherRaces({ current }: { current: Race }) {
  const others = orderedRaces().filter((r) => r.id !== current.id);
  const upcoming = others.filter((r) => isUpcoming(r));
  const past = others.filter((r) => !isUpcoming(r));
  return (
    <section aria-labelledby="other-races-title" id="other-races" className="scroll-mt-20 border-t border-line bg-paper-2">
      <div className="wrap flex flex-col gap-8 py-[clamp(64px,10vw,128px)]">
        <div className="flex flex-col gap-3">
          <p className="kicker kicker-rule">More race weekends</p>
          <h2 id="other-races-title" className="h2-chapter">
            Other races
          </h2>
        </div>
        {upcoming.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="kicker">Coming up</h3>
            <RaceList items={upcoming} past={false} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h3 className="kicker">Past races: what the team published</h3>
          <RaceList items={past} past />
        </div>
        <p className="font-sans text-xs text-ink-3">Race dates: {getSource("f1-calendar-2026").publisher} calendars.</p>
      </div>
    </section>
  );
}
