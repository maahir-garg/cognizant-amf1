import { FactValue } from "@/components/shared/fact-value";
import { PILLARS, type Pillar } from "@/lib/data/schemas";
import { PILLAR_KPIS } from "@/lib/partner/kpis";

const PILLAR_LABEL: Record<Pillar, string> = {
  environment: "S1 · Environment",
  belong: "S2 · Belong",
  community: "S3 · Community",
  governance: "Scrutineering · Governance",
};

/** The curated KPI set, grouped by pillar, in a hairline grid. */
export function KpiGrid() {
  return (
    <section className="flex flex-col gap-8">
      <p className="label">Key metrics by pillar</p>
      {PILLARS.map((pillar) => (
        <div key={pillar} className="flex flex-col gap-4">
          <p className="label text-ink-2">{PILLAR_LABEL[pillar]}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PILLAR_KPIS[pillar].map((k) => (
              <div key={k.factId} className="flex min-w-0 flex-col gap-3 rounded-md border border-line bg-surface p-4">
                <FactValue id={k.factId} size="md" showMetric />
                <p className="text-xs leading-relaxed text-ink-3">{k.why}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
