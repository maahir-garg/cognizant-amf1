import { FactValue } from "@/components/shared/fact-value";
import { facts } from "@/lib/data/load";
import type { Fact, QualityFlag } from "@/lib/data/schemas";

type Kind = QualityFlag["kind"];

const KINDS: { kind: Kind; title: string; dek: string }[] = [
  {
    kind: "source-conflict",
    title: "Two values printed for one figure",
    dek: "The same report, or the report and the team's website, print different numbers for the same thing.",
  },
  {
    kind: "restated",
    title: "Restated after the method changed",
    dek: "Earlier totals were recalculated in the 2025 report, so the original figures are superseded.",
  },
  {
    kind: "not-comparable",
    title: "Not comparable across years",
    dek: "Figures calculated under different methods. Use the report's own change figures instead.",
  },
  {
    kind: "inconsistent-equivalence",
    title: "Comparisons that do not agree",
    dek: "Two reports turn emissions into laps of Silverstone at very different rates.",
  },
  {
    kind: "ambiguous-layout",
    title: "Ambiguous layout",
    dek: "The page layout leaves it unclear which figure belongs to which label.",
  },
];

type Case = { kind: Kind; facts: Fact[]; note: string };

/**
 * Flagged facts grouped into cases: facts whose flags point at each other are
 * one disagreement, shown side by side with the fullest note.
 */
function buildCases(): Case[] {
  const flagged = facts.filter((f) => f.flags.length > 0);
  const byId = new Map(flagged.map((f) => [f.id, f]));
  const seen = new Set<string>();
  const cases: Case[] = [];
  for (const start of flagged) {
    if (seen.has(start.id)) continue;
    const group: Fact[] = [];
    const queue = [start];
    while (queue.length) {
      const f = queue.shift()!;
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      group.push(f);
      for (const flag of f.flags) for (const id of flag.relatedFactIds) if (byId.has(id) && !seen.has(id)) queue.push(byId.get(id)!);
    }
    const flags = group.flatMap((f) => f.flags);
    const note = flags.map((fl) => fl.note).sort((a, b) => b.length - a.length)[0];
    cases.push({ kind: start.flags[0].kind, facts: group, note });
  }
  return cases;
}

export function FlagCases() {
  const cases = buildCases();
  return (
    <div className="flex flex-col gap-16">
      {KINDS.map(({ kind, title, dek }) => {
        const list = cases.filter((c) => c.kind === kind);
        if (!list.length) return null;
        return (
          <section key={kind} aria-labelledby={`flag-${kind}`} className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
              <h3 id={`flag-${kind}`} className="h3 flex flex-wrap items-baseline gap-x-3">
                {title}
                <span className="num text-base font-medium text-ink-3">
                  {list.length} {list.length === 1 ? "case" : "cases"}
                </span>
              </h3>
              <p className="max-w-[65ch] text-base leading-relaxed text-ink-2">{dek}</p>
            </header>
            <ol className="flex flex-col border-t border-line-strong">
              {list.map((c) => (
                <li key={c.facts[0].id} className="grid gap-5 border-b border-line py-6 lg:grid-cols-12 lg:gap-6">
                  <div className="lg:col-span-5">
                    <p className="font-serif text-[length:clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-relaxed text-ink">{c.note}</p>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
                    {c.facts.map((f) => (
                      <FactValue key={f.id} id={f.id} size="md" caption={f.metric} showFlags className="border-t border-line pt-3" />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
