import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { facts } from "@/lib/data/load";

/**
 * Frames data-quality flags as a governance strength: we find and flag
 * inconsistencies in the team's own reports before anything is published,
 * rather than hiding them.
 */
export function DataQualityPanel() {
  const flagged = facts.filter((f) => f.flags.length > 0);
  const byKind = flagged.reduce<Record<string, number>>((acc, f) => {
    for (const fl of f.flags) acc[fl.kind] = (acc[fl.kind] ?? 0) + 1;
    return acc;
  }, {});
  const examples = flagged.slice(0, 3);
  const summary = Object.entries(byKind)
    .map(([k, v]) => `${v} ${k.replace(/-/g, " ")}`)
    .join(", ");

  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="label">Data quality · governance</p>
        <Link href="/sources" className="label text-lime underline-offset-4 hover:underline">
          Browse every flag →
        </Link>
      </div>
      <p className="max-w-2xl text-sm text-ink-2">
        We audit the team&apos;s own published reports for internal inconsistencies before a figure reaches a partner deck:{" "}
        <span className="num text-ink">{flagged.length}</span> of <span className="num text-ink">{facts.length}</span> facts
        currently carry a flag{summary ? ` (${summary})` : ""}. Surfacing this here, rather than hiding it, is the governance
        value: a partner sees exactly where the source data disagrees with itself and why.
      </p>
      {examples.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {examples.map((f) => (
            <li key={f.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-ink">{f.metric}</span>
                <StatusBadge status="conflict" />
                <span className="label">{f.flags[0]?.kind.replace(/-/g, " ")}</span>
              </div>
              <p className="text-xs text-ink-3">{f.flags[0]?.note}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
