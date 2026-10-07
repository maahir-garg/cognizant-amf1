"use client";

import type { ReactNode } from "react";
import { factCitation, getFact } from "@/lib/data/load";
import { captionAfterUnit, factParts } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProvenance } from "./provenance";
import { EstimatedCue, StatusBadge } from "./status-badge";
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
  // A caption taken from the metric reads on from the unit shown above it (never "600+ students / Students engaged…").
  const text = caption ?? label ?? (showMetric ? (p.unit ? captionAfterUnit(metric, fact.unit) : metric) : undefined);
  const cite = factCitation(fact);

  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn("group relative flex flex-col items-start gap-2 text-left before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus", className)}
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
          {!showStatus && fact.status === "estimated" && <EstimatedCue className="ml-0 text-sm" />}
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
  trail,
}: {
  id: string;
  className?: string;
  /**
   * Punctuation that follows the figure in the sentence (".", ",", ")"). It is
   * kept on the same line as the figure, so a full stop never wraps onto a
   * line of its own, and after an estimate it closes the "est." cue.
   */
  trail?: string;
  /** Drop a word unit the sentence already says, e.g. "Round 17" rather than "Round 17 round". */
  hideUnit?: boolean;
  /** Show a change without its sign when the sentence already says the direction ("down 74%"). */
  absolute?: boolean;
}) {
  const fact = getFact(id);
  const { openFact } = useProvenance();
  const p = factParts(fact);
  const cite = factCitation(fact);
  // No status mark after the figure: a bare square read as a stray full stop.
  // Verified is the default; an estimate gets a word cue, and the drawer shows
  // status and page. The pseudo-element grows the tap target to 44px tall
  // without moving the text around it.
  const base =
    "group/fact relative inline text-left font-semibold text-ink before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  // The dotted underline is the tap affordance. It sits on the figure only, so it never runs under the cue.
  const underline =
    "underline decoration-line-strong decoration-dotted decoration-1 underline-offset-4 group-hover/fact:decoration-solid group-hover/fact:decoration-link";
  const cue = fact.status === "estimated" && <EstimatedCue period={!trail?.startsWith(".")} />;
  const withTrail = (button: ReactNode) =>
    trail ? (
      <span className="whitespace-nowrap">
        {button}
        {trail}
      </span>
    ) : (
      button
    );
  if (fact.value === null) {
    return withTrail(
      <button type="button" onClick={() => openFact(id)} className={cn(base, className)} aria-label={`${fact.valueText}. ${fact.status}. ${cite.label}. Show source.`}>
        <span className={underline}>{fact.valueText}</span>
        {cue}
      </button>,
    );
  }
  const unit = hideUnit && p.unit !== "%" ? "" : p.unit;
  const digits = absolute ? p.value.replace(/^[-−–]/, "") : p.value;
  // "1,000+ children", but "90%+": an at-least mark follows the number, and a percent sign stays attached to it.
  const value = unit === "%" ? `${p.prefix}${digits}%${p.suffix}` : `${p.prefix}${digits}${p.suffix}${unit ? ` ${unit}` : ""}`;
  return withTrail(
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn(base, "num whitespace-nowrap", className)}
      aria-label={`${value}. ${fact.status}. ${cite.label}. Show source.`}
    >
      <span className={underline}>{value}</span>
      {cue}
    </button>,
  );
}
