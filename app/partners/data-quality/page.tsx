import type { Metadata } from "next";
import Link from "next/link";
import { DeskHeader } from "@/components/partner/desk-header";
import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { facts, findFact } from "@/lib/data/load";
import { QUALITY_FLAGS } from "@/lib/data/schemas";

export const metadata: Metadata = { title: "Impact desk: data quality" };

const KIND: Record<(typeof QUALITY_FLAGS)[number], { title: string; advice: string }> = {
  "source-conflict": {
    title: "Printed differently in different places",
    advice: "Use neither figure on its own without saying the reports disagree, or pick a figure the reports print consistently.",
  },
  restated: {
    title: "Restated",
    advice: "Earlier figures were recalculated. Don't compare them with later years; use the report's own progress figures.",
  },
  "not-comparable": {
    title: "Not comparable across years",
    advice: "The method changed between reports. Quote each year on its own terms.",
  },
  "inconsistent-equivalence": {
    title: "Inconsistent equivalence",
    advice: "The reports' everyday comparisons disagree. Only the 2025 laps comparisons are used anywhere in the product.",
  },
  "ambiguous-layout": {
    title: "Ambiguous on the page",
    advice: "Check the page before quoting.",
  },
};

export default function DataQualityPage() {
  const flagged = facts.filter((f) => f.flags.length > 0);
  const groups = QUALITY_FLAGS.map((kind) => ({
    kind,
    rows: flagged.flatMap((f) => f.flags.filter((fl) => fl.kind === kind).map((fl) => ({ fact: f, flag: fl }))),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <DeskHeader
        kicker="Impact desk · Data quality"
        title="Where the reports disagree with themselves"
        dek="Every figure the fact base flags, and why. These notes stay on the desk and on the sources page. The story on fan pages uses two of them, the footprint total and the restated baseline, as the report's own target-chart values, without the notes. Check this list before quoting any of them."
        aside={
          <p className="text-[0.875em] text-ink-3">
            {flagged.length} flagged figures · <Link href="/sources" className="link">Browse every fact</Link>
          </p>
        }
      />

      <div className="flex flex-col gap-12 pt-8">
        {groups.map((g) => (
          <section key={g.kind} aria-labelledby={`${g.kind}-heading`} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 border-t-2 border-ink pt-3 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8">
              <h2 id={`${g.kind}-heading`} className="flex items-center gap-3 text-[1.0625rem] font-semibold">
                {g.kind === "source-conflict" && <StatusBadge status="conflict" compact />}
                {KIND[g.kind].title}
                <span className="font-mono text-[0.75rem] font-normal text-ink-3">{g.kind}</span>
              </h2>
              <p className="max-w-[70ch] text-[0.875em] text-ink-2">{KIND[g.kind].advice}</p>
            </div>
            <div className="relative overflow-x-auto">
              <table className="w-full border-collapse max-md:block md:min-w-[52rem] text-left text-[0.875rem] min-[1800px]:text-[0.9375rem]">
                <thead className="border-b border-line-strong max-md:hidden">
                  <tr>
                    <th scope="col" className="kicker h-10 w-[30%] pr-6 font-semibold">
                      Figure
                    </th>
                    <th scope="col" className="kicker h-10 pr-6 font-semibold">
                      What the reports say
                    </th>
                    <th scope="col" className="kicker h-10 w-[22%] font-semibold">
                      Related
                    </th>
                  </tr>
                </thead>
                <tbody className="max-md:block">
                  {g.rows.map(({ fact, flag }) => (
                    <tr key={`${fact.id}-${flag.kind}`} className="border-b border-line align-top max-md:flex max-md:flex-col max-md:gap-2 max-md:py-3">
                      <td className="py-3 pr-6 max-md:p-0">
                        <div className="flex flex-col gap-1.5">
                          <span className="leading-snug text-ink">{fact.metric}</span>
                          <FactValue id={fact.id} size="sm" showFlags />
                          <span className="font-mono text-[0.75rem] text-ink-3">{fact.id}</span>
                        </div>
                      </td>
                      <td className="max-w-[65ch] py-3 pr-6 leading-relaxed text-ink-2 max-md:p-0">{flag.note}</td>
                      <td className="py-3 max-md:p-0">
                        <ul className="flex flex-col gap-2">
                          {flag.relatedFactIds
                            .filter((id) => findFact(id))
                            .map((id) => (
                              <li key={id} className="flex flex-col">
                                <InlineFact id={id} />
                                <span className="text-[0.8125rem] leading-snug text-ink-3">{findFact(id)!.metric}</span>
                              </li>
                            ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
