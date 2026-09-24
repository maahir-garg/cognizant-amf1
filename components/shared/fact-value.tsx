"use client";

import { getFact } from "@/lib/data/load";
import { factParts } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProvenance } from "./provenance";
import { StatusBadge, StatusMark } from "./status-badge";

const SIZES = {
  sm: { value: "text-base", unit: "text-xs" },
  md: { value: "text-2xl", unit: "text-sm" },
  lg: { value: "text-2xl min-[420px]:text-3xl sm:text-5xl", unit: "text-sm sm:text-base" },
  xl: { value: "text-5xl sm:text-7xl", unit: "text-base sm:text-lg" },
} as const;

/**
 * A number from the fact base, rendered with its trust status and wired to
 * the provenance drawer. Use this for every figure on screen; never hard-code
 * a number in JSX.
 */
export function FactValue({
  id,
  size = "md",
  label,
  showMetric = false,
  showStatus = true,
  className,
}: {
  id: string;
  size?: keyof typeof SIZES;
  /** Override the caption under the number. */
  label?: string;
  showMetric?: boolean;
  showStatus?: boolean;
  className?: string;
}) {
  const fact = getFact(id);
  const { openFact } = useProvenance();
  const parts = factParts(fact);
  // Symbols read as part of the figure; words ("students", "tCO₂e") are set smaller.
  const inlineUnit = parts.unit === "%" || parts.unit === "×";
  const p = inlineUnit ? { ...parts, value: parts.value + parts.unit, unit: "" } : parts;
  const s = SIZES[size];
  const conflict = fact.flags.some((f) => f.kind === "source-conflict");
  const qualitative = fact.value === null;

  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn("group flex flex-col items-start gap-1 text-left", className)}
      aria-label={`${fact.metric}: ${p.prefix}${p.value}${p.unit ? ` ${p.unit}` : ""}${p.suffix}. ${fact.status}. Show source.`}
    >
      {qualitative ? (
        <span className="text-lg leading-snug font-semibold text-ink decoration-lime/60 underline-offset-4 group-hover:underline sm:text-xl">
          {fact.valueText}
        </span>
      ) : (
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          <span
            className={cn(
              "num font-semibold tracking-tight text-ink decoration-lime/60 underline-offset-4 group-hover:underline",
              s.value,
            )}
          >
            {p.prefix}
            {p.value}
            {p.suffix}
          </span>
          {p.unit && <span className={cn("num text-ink-2", s.unit)}>{p.unit}</span>}
          {!showStatus && <StatusMark status={fact.status} className="ml-1 self-center" />}
        </span>
      )}
      {(showMetric || label) && <span className="text-sm leading-snug text-ink-2">{label ?? fact.metric}</span>}
      {showStatus && (
        <span className="flex items-center gap-3">
          <StatusBadge status={fact.status} />
          {conflict && <StatusBadge status="conflict" />}
          <span className="label opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Source ↗
          </span>
        </span>
      )}
    </button>
  );
}

/** Inline, text-sized fact for use inside sentences. */
export function InlineFact({ id, className }: { id: string; className?: string }) {
  const fact = getFact(id);
  const { openFact } = useProvenance();
  const p = factParts(fact);
  if (fact.value === null) {
    return (
      <button
        type="button"
        onClick={() => openFact(id)}
        className={cn(
          "inline text-left font-medium text-ink underline decoration-line-strong decoration-dotted underline-offset-4 hover:decoration-lime",
          className,
        )}
      >
        {fact.valueText} <StatusMark status={fact.status} className="ml-0.5 align-middle" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn(
        "num inline-flex items-baseline gap-1 font-semibold whitespace-nowrap text-ink underline decoration-line-strong decoration-dotted underline-offset-4 hover:decoration-lime",
        className,
      )}
    >
      {p.prefix}
      {p.value}
      {p.unit && p.unit !== "%" ? ` ${p.unit}` : p.unit}
      {p.suffix}
      <StatusMark status={fact.status} className="self-center" />
    </button>
  );
}
