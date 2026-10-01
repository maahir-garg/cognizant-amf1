"use client";

import { useProvenance } from "@/components/shared/provenance";
import { StatusMark } from "@/components/shared/status-badge";
import { factCitation, getFact } from "@/lib/data/load";
import { cn } from "@/lib/utils";

/**
 * A source line for a sentence that rests on a qualitative fact: "2025 report,
 * p. 85 ↗", opening the provenance drawer. Use it where the claim is in the
 * words and the fact's full value text would be too long to print inline.
 */
export function SourceButton({ id, className, mark = true }: { id: string; className?: string; mark?: boolean }) {
  const { openFact } = useProvenance();
  const fact = getFact(id);
  const cite = factCitation(fact);
  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn(
        "inline-flex items-center gap-1.5 align-baseline font-sans text-[0.8125rem] text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      aria-label={`${fact.metric}. ${fact.status}. ${cite.label}. Show source.`}
    >
      {mark && <StatusMark status={fact.status} className="self-center" />}
      {cite.label} ↗
    </button>
  );
}
