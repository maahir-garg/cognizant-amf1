import type { Metadata } from "next";
import { FactTable } from "@/components/shared/fact-table";
import { StatusLegend } from "@/components/shared/status-badge";
import { facts, sources } from "@/lib/data/load";

export const metadata: Metadata = { title: "Sources" };

export default function SourcesPage() {
  const flagged = facts.filter((f) => f.flags.length > 0);
  const byKind = flagged.reduce<Record<string, number>>((acc, f) => {
    for (const fl of f.flags) acc[fl.kind] = (acc[fl.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label">Governance · Scrutineering</p>
        <h1 className="display text-5xl sm:text-7xl">Every number, traced.</h1>
        <p className="max-w-2xl text-ink-2">
          Impact Lap only shows figures that are printed in a source document, calculated from those with a visible formula, or
          clearly marked as demo data. Verified quotes are re-checked against the page text on every build.
        </p>
        <StatusLegend />
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="label">Documents</h2>
        <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          {sources.map((s) => (
            <li key={s.id} className="flex flex-col gap-1 bg-surface p-4">
              <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-ink underline-offset-4 hover:underline">
                {s.title}
              </a>
              <p className="text-sm text-ink-2">{s.publisher}</p>
              <p className="label">
                {s.id} · retrieved {s.retrieved} · {facts.filter((f) => f.sourceId === s.id).length} facts
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="label">Data-quality flags found in the source reports</h2>
        <p className="max-w-2xl text-sm text-ink-2">
          Extracting the reports fact by fact surfaced places where they disagree with themselves: {byKind["source-conflict"] ?? 0}{" "}
          source conflicts, {byKind["restated"] ?? 0} restated figures, {byKind["not-comparable"] ?? 0} not-comparable pairs and{" "}
          {byKind["inconsistent-equivalence"] ?? 0} inconsistent equivalences. A production pipeline would route these to the
          team&apos;s data owners before anything is published.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="label">All facts</h2>
        <FactTable />
      </section>
    </div>
  );
}
