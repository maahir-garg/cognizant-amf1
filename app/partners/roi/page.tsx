import type { Metadata } from "next";
import { DeskHeader, DeskSection } from "@/components/partner/desk-header";
import { FactValue } from "@/components/shared/fact-value";
import { DataGap } from "@/components/shared/status-badge";
import { PILOT_METRICS, ROI_BASELINES } from "@/lib/partner/roi";

export const metadata: Metadata = { title: "Impact desk: ROI" };

const TILE_NUMBER = "[&_.big-num]:text-[length:clamp(3rem,2.25rem+1.25vw,4rem)]";

export default function RoiPage() {
  return (
    <>
      <DeskHeader
        kicker="Impact desk · Return on the partnership"
        title="What is published, and what a pilot would measure"
        dek="On the left, what the team has already reported about how far its impact stories travel. On the right, the measures a pilot would add. None of those has been measured yet, so none shows a number."
      />

      <div className="grid gap-x-12 gap-y-12 pt-8 lg:grid-cols-12">
        <DeskSection id="baselines" title="Published baselines" note="From the team's reports" className="lg:col-span-7">
          <div className="overflow-hidden">
            <ul className="-mt-px -ml-px grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))]">
              {ROI_BASELINES.map((b) => (
                <li key={b.factId} className="flex flex-col gap-3 border-t border-l border-line px-5 py-5">
                  <FactValue id={b.factId} size="lg" showMetric className={TILE_NUMBER} />
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
                <DataGap label={`Not measured yet · ${m.audience === "partner" ? "Partner desk" : "Fan story"}`}>
                  <span className="block font-semibold text-ink">{m.name}</span>
                  <span className="block">{m.definition}</span>
                  <span className="mt-1 block text-ink-3">How: {m.method}</span>
                </DataGap>
              </li>
            ))}
          </ul>
        </DeskSection>
      </div>
    </>
  );
}
