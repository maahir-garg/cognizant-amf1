import Link from "next/link";
import { getSource } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { hasTrackside, latestTeamSource, orderedRaces, raceDates, raceProgrammes, raceTitle } from "@/lib/fan/race";

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
  if (hasTrackside(race)) parts.push("Trackside energy");
  if (raceProgrammes(race).some((p) => p.where !== "online")) parts.push("Programmes");
  return parts.length ? parts.join(" · ") : "Calendar only";
}

/** Every other race page, as a plain list: name, circuit, dates and what the team published for it. */
export function OtherRaces({ current }: { current: Race }) {
  const others = orderedRaces().filter((r) => r.id !== current.id);
  return (
    <section aria-labelledby="other-races-title" id="other-races" className="scroll-mt-20 border-t border-line bg-paper-2">
      <div className="wrap flex flex-col gap-8 py-[clamp(64px,10vw,128px)]">
        <div className="flex flex-col gap-3">
          <p className="kicker kicker-rule">More race weekends</p>
          <h2 id="other-races-title" className="h2-chapter">
            Other races
          </h2>
        </div>
        <ul className="grid border-t border-line-strong sm:grid-cols-2 sm:gap-x-6 xl:grid-cols-3">
          {others.map((r) => (
            <li key={r.id} className="border-b border-line">
              <Link href={`/weekend/${r.id}`} className="group flex flex-col gap-1 py-4">
                <span className="font-serif text-xl font-medium text-ink underline decoration-transparent decoration-1 underline-offset-4 group-hover:decoration-ink">
                  {raceTitle(r)} <span className="num text-ink-3">{r.season}</span>
                </span>
                <span className="font-sans text-sm text-ink-2">
                  {[r.circuit, r.start ? raceDates(r) : null].filter(Boolean).join(" · ")}
                </span>
                <span className="kicker text-ink-3">{whatsPublished(r)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="font-sans text-xs text-ink-3">Race dates: {getSource("f1-calendar-2026").publisher} calendars.</p>
      </div>
    </section>
  );
}
