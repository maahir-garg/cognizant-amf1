import Link from "next/link";
import { FactValue } from "@/components/shared/fact-value";
import { DataGap, StatusBadge } from "@/components/shared/status-badge";
import { findFact } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { hasTrackside, raceShortName, raceTitle } from "@/lib/fan/race";
import { europeanTracksideRows, missingLabel } from "@/lib/fan/trackside";
import { UpdatedLine } from "./other-races";
import { SectionHead } from "./section-head";
import { SourceButton } from "./source-button";
import { TracksideChart } from "./trackside-chart";

const SOURCE_LABELS = { hvo: "from HVO biofuel generators", grid: "from renewable grid supply", solar: "from solar" } as const;
const SOURCE_NAMES = { hvo: "HVO generators", grid: "renewable grid supply", solar: "solar" } as const;

/** Trackside energy facts for one race, keyed by source. */
function tracksideFacts(race: Race) {
  return (["hvo", "grid", "solar"] as const).map((key) => ({
    key,
    id: race.factIds.find((id) => id.startsWith("e25-trackside-") && id.endsWith(`-${key}`) && findFact(id)) ?? null,
  }));
}

/** "What the team has published for this race": trackside energy where it exists, a data gap where it doesn't. */
export function RacePublished({ race }: { race: Race }) {
  const name = raceShortName(race);
  const singapore = race.cityId === "singapore";
  const own = hasTrackside(race) ? tracksideFacts(race) : null;
  const rows = europeanTracksideRows();
  const solarGap = missingLabel(rows, "solar");

  return (
    <section aria-labelledby="published-title" id="published" className="wrap scroll-mt-20 pt-[clamp(64px,10vw,128px)] pb-[clamp(48px,6vw,80px)]">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
        <SectionHead
          id="published-title"
          className="lg:col-span-5"
          kicker="What the team has published"
          title={`Energy at the ${name} Grand Prix`}
          dek={own ? "The team reports the electricity its garage used at this round, by source." : "What the team reports about power in the paddock, and what it doesn't."}
        />

        <div className="flex flex-col gap-10 lg:col-span-7 lg:col-start-6">
          {own ? (
            <>
              <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
                {own.map(({ key, id }) => (
                  <div key={key} className="bg-bg p-5">
                    {id ? (
                      <FactValue id={id} size="md" caption={`Trackside electricity ${SOURCE_LABELS[key]}`} />
                    ) : (
                      <DataGap label="Not published" className="h-full">
                        The team didn&apos;t report {SOURCE_NAMES[key]} for this round. That is a gap, not a zero.
                      </DataGap>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <p className="prose-body">
                  European rounds run on the paddock&apos;s shared low-carbon power: solar, HVO biofuel, renewable grid supply and batteries.
                </p>
                <FactValue id="e25-event-energy-cut" size="lg" caption="cut in event-energy emissions in paddock areas at European races, against previous set-ups" />
              </div>
            </>
          ) : (
            <>
              <DataGap label="Data gap: trackside energy">
                The team hasn&apos;t published trackside energy for the {raceTitle(race)}.
                {singapore
                  ? " Singapore is a night race, and the paddock energy cut the team reports applies to European races only."
                  : " It reports trackside energy for European rounds only."}
              </DataGap>
              <div className="flex flex-col gap-4">
                <p className="prose-body">
                  At European races, the paddock runs on shared low-carbon power: solar, HVO biofuel, renewable grid supply and batteries.
                  {singapore && " It is not a Singapore figure."}
                </p>
                <FactValue id="e25-event-energy-cut" size="lg" caption="cut in event-energy emissions in paddock areas at European races, against previous set-ups" />
              </div>
              <details className="group rounded-md border border-line-strong bg-card">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-sans text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  See the European rounds the team did publish
                  <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-180">
                    ↓
                  </span>
                </summary>
                <div className="flex flex-col gap-3 border-t border-line px-5 pt-4 pb-5">
                  <TracksideChart rows={rows} />
                  {solarGap && <p className="font-sans text-xs text-ink-3">Solar isn&apos;t published for {solarGap}: shown as a gap, not a zero.</p>}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StatusBadge status="verified" />
                    <SourceButton id="e25-trackside-gbr-hvo" mark={false} />
                    <Link href="/weekend/gbr-2025#published" className="link font-sans text-[0.8125rem]">
                      One round in detail: Silverstone →
                    </Link>
                  </div>
                </div>
              </details>
            </>
          )}
        </div>
      </div>
      <div className="mt-12 border-t border-line pt-4 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7 lg:col-start-6">
          <UpdatedLine />
        </div>
      </div>
    </section>
  );
}
