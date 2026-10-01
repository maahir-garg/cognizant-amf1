import type { Metadata } from "next";
import { DeskHeader, DeskSection } from "@/components/partner/desk-header";
import { TILE_CELL, TILE_GRID, TILE_NUMBER } from "@/components/partner/fact-tiles";
import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { DataGap } from "@/components/shared/status-badge";
import { getFact } from "@/lib/data/load";
import { deskCaption } from "@/lib/partner/labels";
import { PILOT_COST_ASSUMPTION, PILOT_METRICS, pilotCostRange, ROI_BASELINES } from "@/lib/partner/roi";

const AUDIENCE = { partner: "Partner desk", charity: "Charity partners", fan: "Fan story" } as const;
const gbp = (n: number) => `£${new Intl.NumberFormat("en-GB").format(n)}`;
const gbpShort = (n: number) => `£${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(n / 1e6)}m`;

export const metadata: Metadata = { title: "Impact desk: ROI" };


export default function RoiPage() {
  return (
    <>
      <DeskHeader
        kicker="Impact desk · Return on the partnership"
        title="What is published, and what a pilot would measure"
        dek="On the left, what the team has already reported about how far its impact stories travel. On the right, the measures a pilot would add. None of those has been measured yet, so none shows a number. The one cost range here is our own planning assumption, with its working shown."
      />

      <div className="grid gap-x-12 gap-y-12 pt-8 lg:grid-cols-12">
        <DeskSection id="baselines" title="Published baselines" note="From the team's reports" className="lg:col-span-7">
          <div className="overflow-hidden">
            <ul className={TILE_GRID}>
              {ROI_BASELINES.map((b) => (
                <li key={b.factId} className={TILE_CELL}>
                  <FactValue id={b.factId} size="lg" caption={deskCaption(b.factId)} className={TILE_NUMBER} />
                  <p className="text-[0.875em] leading-snug text-ink-3">{b.why}</p>
                </li>
              ))}
            </ul>
          </div>

          <CostAssumption />
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

/**
 * The pilot's first-year cost as a range with its working shown. It is our
 * planning assumption, not a figure from the team or Cognizant, so it is set
 * apart from the published baselines and labelled on every line.
 */
function CostAssumption() {
  const a = PILOT_COST_ASSUMPTION;
  const range = pilotCostRange();
  return (
    <section aria-labelledby="cost-heading" className="mt-6 flex flex-col gap-3 rounded-md border-2 border-dashed border-line-strong p-5">
      <p className="kicker text-ink-2">Assumption · not a team or Cognizant figure</p>
      <h3 id="cost-heading" className="text-[1.0625rem] font-semibold text-ink">
        First-year pilot cost: about {gbpShort(range.low)} to {gbpShort(range.high)}
      </h3>
      <p className="text-ink-2">
        Our planning range for the 2027 pilot, to be replaced with real rates when it is scoped with Cognizant. It covers people and
        running costs only; no revenue is claimed.
      </p>
      <dl className="grid gap-x-6 gap-y-1 text-[0.875em] sm:grid-cols-[minmax(0,1fr)_auto]">
        {a.people.map((p) => (
          <div key={p.role} className="contents">
            <dt className="text-ink-2">{p.role}</dt>
            <dd className="num text-ink sm:text-right">{p.fte} full time</dd>
          </div>
        ))}
        <dt className="text-ink-2">Assumed cost per full-time person a year</dt>
        <dd className="num text-ink sm:text-right">
          {gbp(a.perPerson.low)} to {gbp(a.perPerson.high)}
        </dd>
        <dt className="text-ink-2">Assumed model, hosting and tools for the season</dt>
        <dd className="num text-ink sm:text-right">
          {gbp(a.running.low)} to {gbp(a.running.high)}
        </dd>
        <dt className="border-t border-line pt-1 font-semibold text-ink">
          {range.fte} people × cost per person + running costs
        </dt>
        <dd className="num border-t border-line pt-1 font-semibold text-ink sm:text-right">
          {gbp(range.low)} to {gbp(range.high)}
        </dd>
      </dl>
    </section>
  );
}
