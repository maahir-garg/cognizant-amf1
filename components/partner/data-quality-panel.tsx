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
  const examples = flagged.slice(0, 3);

  return (
    <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="flex flex-col items-start gap-5">
        <p className="label">Data quality · governance</p>
        <h2 className="display text-4xl sm:text-6xl">Trust includes the difficult parts.</h2>
        <p className="max-w-xl text-sm leading-relaxed text-ink-2">
          The evidence layer audits the team&apos;s published reports before a figure reaches a partner brief. Conflicts,
          restatements and limits stay visible so the output can be challenged and corrected.
        </p>
        <Link href="/sources" className="label text-lime underline-offset-4 hover:underline">
          Browse every flag →
        </Link>
      </div>
      {examples.length > 0 && (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
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
