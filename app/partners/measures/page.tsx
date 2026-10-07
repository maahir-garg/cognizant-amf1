import type { Metadata } from "next";
import { DeskHeader, DeskSection } from "@/components/partner/desk-header";
import { TILE_CELL, TILE_GRID, TILE_NUMBER } from "@/components/partner/fact-tiles";
import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { DataGap } from "@/components/shared/status-badge";
import { getFact } from "@/lib/data/load";
import { deskCaption } from "@/lib/partner/labels";
import { PILOT_METRICS, PUBLISHED_BASELINES } from "@/lib/partner/measures";

const AUDIENCE = { partner: "Partner desk", charity: "Charity partners", fan: "Fan story" } as const;

export const metadata: Metadata = { title: "Impact desk: Measures" };

export default function MeasuresPage() {
  return (
    <>
      <DeskHeader
        kicker="Impact desk · Measures"
        title="What is published, and what a pilot would measure"
        dek="On the left, what the team has already reported about how far its impact stories travel. On the right, the measures a pilot would add. None of those has been measured yet, so none shows a number."
      />

      <div className="grid gap-x-12 gap-y-12 pt-8 lg:grid-cols-12">
        <DeskSection id="baselines" title="Published baselines" note="From the team's reports" className="lg:col-span-7">
          <div className="overflow-hidden">
            <ul className={TILE_GRID}>
              {PUBLISHED_BASELINES.map((b) => (
                <li key={b.factId} className={TILE_CELL}>
                  <FactValue id={b.factId} size="lg" caption={deskCaption(b.factId)} className={TILE_NUMBER} />
                  <p className="text-[0.875em] leading-snug text-ink-3">{b.why}</p>
                </li>
              ))}
            </ul>
          </div>
        </DeskSection>

        <DeskSection id="pilot" title="Measured in the pilot" note="Definitions agreed before launch" className="lg:col-span-5">
          <ul className="flex flex-col gap-3">
            {PILOT_METRICS.map((m) => (
              <li key={m.id}>
                <DataGap label={`Not measured yet · ${AUDIENCE[m.audience]}`}>
                  <span className="block font-semibold text-ink">{m.name}</span>
                  <span className="block">{m.definition}</span>
                  <span className="mt-1 block text-ink-3">How: {m.method}</span>
                  {m.baselineFactId && (
                    <span className="mt-1 flex flex-wrap items-baseline gap-x-2 text-ink-3">
                      Read against the published <InlineFact id={m.baselineFactId} /> ({getFact(m.baselineFactId).period})
                    </span>
                  )}
                </DataGap>
              </li>
            ))}
          </ul>
        </DeskSection>
      </div>
    </>
  );
}
