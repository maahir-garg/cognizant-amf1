import { FactValue } from "@/components/shared/fact-value";

/**
 * The detail layer: how the team moves its cars and kit across a season.
 * The per-round figures are the only place the even-split estimates appear,
 * worded as the season total divided evenly, never as this race's figure.
 */
export function SeasonContext() {
  return (
    <section aria-labelledby="season-title" id="season" className="wrap scroll-mt-20 pb-[clamp(48px,6vw,80px)]">
      <details className="group border-y border-line-strong">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
          <span className="flex flex-col gap-2">
            <span className="kicker">The detail</span>
            <span id="season-title" className="h3">
              Season context: moving the team between races
            </span>
          </span>
          <span aria-hidden className="font-sans text-2xl text-ink-3 transition-transform group-open:rotate-180">
            ↓
          </span>
        </summary>
        <div className="flex flex-col gap-12 pt-4 pb-10">
          <p className="prose-body">
            The team publishes freight and travel for the whole season, not race by race. These are its own figures for moving cars,
            parts and garage kit, and what cleaner fuel and shipping changed.
          </p>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            <FactValue id="e25-freight-logistics" size="lg" caption="from moving cars, parts and garage kit round the world in a season, before fuel certificates" />
            <FactValue id="e25-saf-avoided" size="lg" caption="of air-freight emissions avoided with the team's first Sustainable Aviation Fuel purchase" />
            <FactValue id="e25-saf-laps" size="lg" caption="around Silverstone in a petrol road car: the team's own comparison for that saving" />
            <FactValue id="e25-saf-airfreight-cut" size="lg" caption="cut in the emissions tied to that air freight" />
            <FactValue id="e25-travel-logistics-cut" size="lg" caption="fall in travel and logistics emissions on the year before, in the team's own comparison" />
            <FactValue id="e24-sea-freight-shift" size="lg" caption="saved in one year by moving freight from air to sea" />
          </div>

          <div className="flex flex-col gap-6 border-t border-line pt-8">
            <div className="flex flex-col gap-2">
              <p className="kicker">The season total, divided evenly</p>
              <p className="prose-body text-ink-2">
                For a sense of scale only: the season&apos;s totals split equally across every round. They are averages, not figures for
                any one race; long-haul rounds very likely carry more than European ones reached by road.
              </p>
            </div>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-3">
              <FactValue id="est-freight-per-round" size="md" caption="freight and logistics per round, on an even split" />
              <FactValue id="est-travel-per-round" size="md" caption="business travel per round, on an even split" />
              <FactValue id="est-saf-per-round" size="md" caption="Sustainable Aviation Fuel saving per round, on an even split" />
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}
