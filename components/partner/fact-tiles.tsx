import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { factCitation, getFact } from "@/lib/data/load";
import { cn } from "@/lib/utils";

/** Desk tiles set figures at 48 to 64px, smaller than the story's hero numbers. */
const TILE_NUMBER = "[&_.big-num]:text-[length:clamp(3rem,2.25rem+1.25vw,4rem)]";

/**
 * KPI tiles in a hairline grid: 1px lines between cells, no boxes. The
 * outer edge is clipped so only the lines between tiles show, including
 * when the last row is short.
 */
export function FactTiles({
  ids,
  captions = {},
  showFlags = true,
  className,
}: {
  ids: string[];
  /** Short, number-free captions by fact id; the fact's metric otherwise. */
  captions?: Record<string, string>;
  showFlags?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <ul className="-mt-px -ml-px grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))]">
        {ids.map((id) => (
          <li key={id} className="flex min-w-0 border-t border-l border-line py-5 sm:px-5">
            <FactValue id={id} size="lg" caption={captions[id] ?? getFact(id).metric} showFlags={showFlags} className={TILE_NUMBER} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Qualitative facts (a role, a venue, a rating) as a definition list with status and source. */
export function FactNotes({ ids, className }: { ids: string[]; className?: string }) {
  if (ids.length === 0) return null;
  return (
    <dl className={cn("flex flex-col divide-y divide-line border-y border-line", className)}>
      {ids.map((id) => {
        const f = getFact(id);
        return (
          <div key={id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
            <dt className="text-[0.875em] text-ink-3">{f.metric}</dt>
            <dd className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <InlineFact id={id} className="font-medium" />
              <span className="text-[0.8125rem] text-ink-3">{factCitation(f).label}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** A compact row for a figure in a list: label, then the figure with its status and source. */
export function FactRow({ id, label }: { id: string; label?: string }) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <span className="text-[0.875em] leading-snug text-ink-2">{label ?? getFact(id).metric}</span>
      <FactValue id={id} size="sm" />
    </div>
  );
}
