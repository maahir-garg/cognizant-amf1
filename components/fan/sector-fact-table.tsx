"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { useProvenance } from "@/components/shared/provenance";
import { getFact } from "@/lib/data/load";
import { formatFact } from "@/lib/format";

/** Compact, right-aligned fact table for die-hard fans: more of the sector at a glance. */
export function SectorFactTable({ factIds }: { factIds: string[] }) {
  const { openFact } = useProvenance();
  return (
    <div className="flex flex-col divide-y divide-line rounded-md border border-line">
      {factIds.map((id) => {
        const fact = getFact(id);
        const conflict = fact.flags.length > 0;
        return (
          <button
            key={id}
            onClick={() => openFact(id)}
            className="grid min-h-11 grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 text-left hover:bg-surface"
          >
            <span className="line-clamp-2 text-xs text-ink-2">{fact.metric}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="num text-sm text-ink">{fact.value === null ? fact.valueText : formatFact(fact)}</span>
              <StatusBadge status={fact.status} compact />
              {conflict && <StatusBadge status="conflict" compact />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
