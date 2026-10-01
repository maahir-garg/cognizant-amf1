import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { factCitation, getFact } from "@/lib/data/load";
import { deskCaption } from "@/lib/partner/labels";
import { cn } from "@/lib/utils";

/** Desk tiles set figures at 48 to 64px, smaller than the story's hero numbers. */
export const TILE_NUMBER = "[&_.big-num]:text-[length:clamp(3rem,2.25rem+1.25vw,4rem)]";

/**
 * KPI tiles in a hairline grid: 1px lines between cells, no boxes. The
 * first tile of each row sits flush with the section rule (no left line or
 * padding), and the top line is clipped so only lines between rows show.
 */
export const TILE_GRID = "-mt-px grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
export const TILE_CELL =
  "flex min-w-0 flex-col gap-3 border-t border-line py-5 sm:border-l sm:px-5 sm:[&:nth-child(2n+1)]:border-l-0 sm:[&:nth-child(2n+1)]:pl-0 xl:[&:nth-child(2n+1)]:border-l xl:[&:nth-child(2n+1)]:pl-5 xl:[&:nth-child(3n+1)]:border-l-0 xl:[&:nth-child(3n+1)]:pl-0";
export function FactTiles({
  ids,
  captions = {},
  showFlags = true,
  className,
}: {
  ids: string[];
  /** Number-free captions by fact id that read on from the unit; the desk caption otherwise. */
  captions?: Record<string, string>;
  showFlags?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <ul className={TILE_GRID}>
        {ids.map((id) => (
          <li key={id} className={TILE_CELL}>
            <FactValue id={id} size="lg" caption={captions[id] ?? deskCaption(id)} showFlags={showFlags} className={TILE_NUMBER} />
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
