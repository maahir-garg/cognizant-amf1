"use client";

import { Check, ShieldAlert } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CITATION_RE } from "@/lib/ai/guardrail";
import { findFact } from "@/lib/data/load";
import type { AiResponse, DerivedValue } from "@/lib/data/schemas";
import { cn } from "@/lib/utils";
import { useProvenance } from "./provenance";

/**
 * Renders generated text with its citations as numbered chips that open the
 * provenance drawer, plus a footer showing what drafted it and the
 * guardrail result. Failed outputs are never shown as normal text.
 */
export function AiText({
  response,
  derived = [],
  className,
  showMeta = true,
}: {
  response: AiResponse;
  derived?: DerivedValue[];
  className?: string;
  showMeta?: boolean;
}) {
  const { openFact } = useProvenance();
  const order = new Map<string, number>();
  response.citations.forEach((id, i) => order.set(id, i + 1));

  if (!response.guardrail.passed) {
    return (
      <div className={cn("rounded-md border border-dashed border-line-strong p-4 text-sm", className)} role="alert">
        <p className="kicker flex items-center gap-2 text-conflict">
          <ShieldAlert className="size-4" /> Held back: a figure did not match its source
        </p>
        <ul className="mt-2 list-disc pl-5 text-ink-2">
          {response.guardrail.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    );
  }

  const renderInline = (para: string, pi: number): ReactNode[] => {
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of para.matchAll(CITATION_RE)) {
      const index = m.index ?? 0;
      out.push(para.slice(last, index).replace(/\s+$/, ""));
      const [, kind, id] = m;
      const n = order.get(id) ?? 0;
      if (kind === "F" && findFact(id)) {
        out.push(
          <button
            key={`${pi}-${index}`}
            type="button"
            onClick={() => openFact(id)}
            className="num relative -top-2 ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-line-strong px-1 font-sans text-[0.6875rem] leading-none font-semibold text-ink-2 hover:border-link hover:text-link"
            aria-label={`Source ${n}: ${findFact(id)?.metric}`}
          >
            {n}
          </button>,
        );
      } else {
        const d = derived.find((x) => x.id === id);
        out.push(
          <Tooltip key={`${pi}-${index}`}>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="num relative -top-2 ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-dashed border-estimated px-1 font-sans text-[0.6875rem] leading-none font-semibold text-estimated"
              >
                {n}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{d ? `${d.label}: ${d.formula}` : "Documented calculation"}</TooltipContent>
          </Tooltip>,
        );
      }
      last = index + m[0].length;
    }
    out.push(para.slice(last));
    return out;
  };

  const paragraphs = response.text.split(/\n{2,}/);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-[0.9em] font-serif leading-[1.45] text-ink">
        {paragraphs.map((para, pi) => (
          <p key={pi} className="whitespace-pre-line">
            {renderInline(para, pi).map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
          </p>
        ))}
      </div>
      {showMeta && <AiMeta response={response} />}
    </div>
  );
}

export function AiMeta({ response, className }: { response: AiResponse; className?: string }) {
  const n = response.guardrail.checked.length;
  const drafter =
    response.generator.kind === "model" ? `Drafted by ${response.generator.model ?? "AI model"}` : "Drafted from a grounded template";
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="kicker inline-flex items-center gap-1 text-ink-2">
            <Check className="size-3" strokeWidth={3} aria-hidden /> Figures checked
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {n === 0
            ? "No figures in this text. Citations checked."
            : `${n} figure${n === 1 ? "" : "s"} checked: each matches a cited fact or documented calculation.`}
        </TooltipContent>
      </Tooltip>
      <span className="kicker text-ink-3">{drafter}</span>
      {response.cached && <span className="kicker text-ink-3">Offline cache</span>}
    </div>
  );
}
