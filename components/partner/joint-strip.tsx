import { FactValue } from "@/components/shared/fact-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { jointCognizantFacts } from "@/lib/partner/kpis";

/** The facts tagged partner:cognizant: the joint activity a partner reader looks for first. */
export function JointStrip() {
  const facts = jointCognizantFacts();
  const quantitative = facts.filter((f) => f.value !== null);
  const qualitative = facts.filter((f) => f.value === null);

  return (
    <section className="flex flex-col gap-4">
      <p className="label">Joint with Cognizant</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quantitative.map((f) => (
          <div key={f.id} className="min-w-0 rounded-md border border-line bg-surface p-4">
            <FactValue id={f.id} size="sm" showMetric />
          </div>
        ))}
      </div>
      {qualitative.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {qualitative.map((f) => (
            <li key={f.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-sm text-ink">
                {f.metric}: <span className="text-ink-2">{f.valueText}</span>
              </span>
              <StatusBadge status={f.status} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
