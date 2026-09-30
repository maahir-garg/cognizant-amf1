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
    <section className="flex flex-col gap-12">
      <div className="max-w-3xl">
        <p className="label">The whole ESG picture</p>
        <h2 className="font-serif font-medium leading-[1.05] tracking-tight mt-3 text-4xl sm:text-6xl">Evidence across every impact area.</h2>
        <p className="mt-5 max-w-2xl text-ink-2">Open any figure to inspect its status, report source and original wording.</p>
      </div>
      {PILLARS.map((pillar) => (
        <div key={pillar} className="grid gap-5 border-t border-line pt-6 lg:grid-cols-[14rem_1fr]">
          <p className="label text-ink-2">{PILLAR_LABEL[pillar]}</p>
          <div className="grid overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
            {PILLAR_KPIS[pillar].map((k) => (
              <div key={k.factId} className="flex min-h-52 min-w-0 flex-col justify-between gap-6 bg-surface p-5 transition-colors hover:bg-surface-2">
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
