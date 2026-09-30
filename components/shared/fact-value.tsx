"use client";

import { factCitation, getFact } from "@/lib/data/load";
import { factParts } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProvenance } from "./provenance";
import { StatusBadge, StatusMark } from "./status-badge";
import { useFanSurface } from "./surface";

const SIZES = {
  sm: { value: "num text-lg font-semibold leading-tight", unit: "num text-sm font-medium", caption: "text-base" },
  md: { value: "num text-[1.75rem] font-semibold leading-none", unit: "num text-base font-medium", caption: "text-[1.0625rem]" },
  lg: { value: "big-num text-[length:clamp(2.5rem,1.75rem+3vw,4.5rem)]", unit: "big-num-unit", caption: "text-lg" },
  xl: { value: "big-num", unit: "big-num-unit", caption: "text-[length:clamp(1.125rem,1.05rem+0.3vw,1.3125rem)]" },
} as const;

/**
 * A number from the fact base with its meaning, trust status and source,
 * wired to the provenance drawer. The whole block is one button. Use this
 * for every figure on screen; never hard-code a number in JSX.
 */
export function FactValue({
  id,
  size = "md",
  caption,
  label,
  showMetric = false,
  showStatus = true,
  showSource = true,
  showFlags = false,
  className,
}: {
  id: string;
  size?: keyof typeof SIZES;
  /** One serif sentence of meaning under the number. Defaults to the fact's metric when `showMetric`. */
  caption?: string;
  /** Older name for `caption`. */
  label?: string;
  showMetric?: boolean;
  showStatus?: boolean;
  /** The "2025 report, p. 42 ↗" line. */
  showSource?: boolean;
  /** Show a source-conflict badge. Off by default: fan pages never show data-quality flags. */
  showFlags?: boolean;
  className?: string;
}) {
  const fact = getFact(id);
  const { openFact } = useProvenance();
  const fan = useFanSurface();
  const parts = factParts(fact);
  // Symbols read as part of the figure; words ("students", "tCO₂e") are set smaller.
  const inlineUnit = parts.unit === "%" || parts.unit === "×";
  const p = inlineUnit ? { ...parts, value: parts.value + parts.unit, unit: "" } : parts;
  const s = SIZES[size];
  const big = size === "lg" || size === "xl";
  const conflict = showFlags && fact.flags.some((f) => f.kind === "source-conflict");
  const qualitative = fact.value === null;
  const metric = (fan && fact.fanLabel) || fact.metric;
  const text = caption ?? label ?? (showMetric ? metric : undefined);
  const cite = factCitation(fact);

  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn("group flex flex-col items-start gap-2 text-left", className)}
      aria-label={`${metric}: ${p.prefix}${p.value}${p.unit ? ` ${p.unit}` : ""}${p.suffix}. ${fact.status}. ${cite.label}. Show source.`}
    >
      {qualitative ? (
        <span className={cn("font-serif leading-snug font-semibold text-ink", big ? "text-2xl sm:text-3xl" : "text-lg")}>
          {fact.valueText}
        </span>
      ) : big ? (
        <span className={cn("flex flex-col text-ink", s.value)}>
          <span>
            {p.prefix}
            {p.value}
            {p.suffix}
          </span>
          {p.unit && <span className={cn("mt-1 leading-tight text-ink-2", s.unit)}>{p.unit}</span>}
        </span>
      ) : (
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn("text-ink", s.value)}>
            {p.prefix}
            {p.value}
            {p.suffix}
          </span>
          {p.unit && <span className={cn("text-ink-2", s.unit)}>{p.unit}</span>}
          {!showStatus && <StatusMark status={fact.status} className="ml-1 self-center" />}
        </span>
      )}
      {text && <span className={cn("max-w-[40ch] font-serif leading-snug text-ink", s.caption)}>{text}</span>}
      {(showStatus || showSource) && (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {showStatus && <StatusBadge status={fact.status} />}
          {conflict && <StatusBadge status="conflict" />}
          {showStatus && showSource && (
            <span aria-hidden className="text-[0.8125rem] text-ink-3">
              ·
            </span>
          )}
          {showSource && (
            <span className="text-[0.8125rem] text-ink-3 underline decoration-1 underline-offset-[3px] group-hover:text-ink">
              {cite.label} ↗
            </span>
          )}
        </span>
      )}
    </button>
  );
}

/** Inline, text-sized fact for use inside sentences. Opens the same drawer. */
export function InlineFact({
  id,
  className,
  hideUnit = false,
  absolute = false,
}: {
  id: string;
  className?: string;
  /** Drop a word unit the sentence already says, e.g. "Round 17" rather than "Round 17 round". */
  hideUnit?: boolean;
  /** Show a change without its sign when the sentence already says the direction ("down 74%"). */
  absolute?: boolean;
}) {
  const fact = getFact(id);
  const { openFact } = useProvenance();
  const p = factParts(fact);
  const cite = factCitation(fact);
  const base =
    "inline text-left font-semibold text-ink underline decoration-line-strong decoration-dotted decoration-1 underline-offset-4 hover:decoration-solid hover:decoration-link";
  if (fact.value === null) {
    return (
      <button type="button" onClick={() => openFact(id)} className={cn(base, className)} aria-label={`${fact.valueText}. ${fact.status}. ${cite.label}. Show source.`}>
        {fact.valueText}
        <StatusMark status={fact.status} className="ml-1 align-middle" />
      </button>
    );
  }
  const unit = hideUnit && p.unit !== "%" ? "" : p.unit;
  const digits = absolute ? p.value.replace(/^[-−–]/, "") : p.value;
  // "1,000+ children", but "90%+": an at-least mark follows the number, and a percent sign stays attached to it.
  const value = unit === "%" ? `${p.prefix}${digits}%${p.suffix}` : `${p.prefix}${digits}${p.suffix}${unit ? ` ${unit}` : ""}`;
  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn(base, "num inline-flex items-baseline gap-1 whitespace-nowrap", className)}
      aria-label={`${value}. ${fact.status}. ${cite.label}. Show source.`}
    >
      {value}
      <StatusMark status={fact.status} className="self-center" />
    </button>
  );
}
