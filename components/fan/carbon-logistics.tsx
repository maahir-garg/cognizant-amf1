import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { getFact, initiatives } from "@/lib/data/load";
import { EquivalentsPanel } from "./equivalents-panel";

/** A3: the estimated per-round freight and logistics figure, its assumption, and travel/SAF context. */
export function CarbonLogistics() {
  const freight = getFact("est-freight-per-round");
  const assumption = freight.derivation?.assumptions[0];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="label">Carbon and logistics</p>
        <FactValue id="est-freight-per-round" size="xl" showMetric label="Freight and logistics per race weekend" />
        {assumption && <p className="max-w-prose text-sm text-ink-2">{assumption}</p>}
      </div>

      {freight.value !== null && <EquivalentsPanel tCO2e={freight.value} factLabel={freight.metric} />}

      <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <FactValue id="est-travel-per-round" size="md" showMetric />
        <FactValue id="est-saf-per-round" size="md" showMetric />
      </div>
    </section>
  );
}

/** Verified, report-published change figures — never a year-on-year figure we compute ourselves. */
export function ChangeVsEarlier() {
  const safInitiative = initiatives.find((i) => i.id === "saf-freight");
  const freightFact = getFact("e25-freight-logistics");
  const restatementFlag = freightFact.flags.find((f) => f.kind === "not-comparable");

  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6">
      <p className="label">Change vs earlier</p>
      <p className="max-w-prose text-ink-2">
        In 2025 the team cut travel and logistics emissions by <InlineFact id="e25-travel-logistics-cut" /> versus 2024
        {safInitiative && safInitiative.partners.length >= 2 && (
          <>
            , helped by its first Sustainable Aviation Fuel investment for air freight — bought through {safInitiative.partners[0]}&apos;s SAF
            programme with logistics partner {safInitiative.partners[1]}
          </>
        )}
        , which cut associated air-freight emissions by <InlineFact id="e25-saf-airfreight-cut" />.
      </p>
      {restatementFlag && (
        <p className="max-w-prose text-xs text-ink-3">{restatementFlag.note}</p>
      )}
    </section>
  );
}
