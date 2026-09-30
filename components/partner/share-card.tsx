import { forwardRef } from "react";
import { StatusMark } from "@/components/shared/status-badge";
import { APP_NAME } from "@/lib/config";
import { factCitation } from "@/lib/data/load";
import type { Fact } from "@/lib/data/schemas";
import { factParts } from "@/lib/format";
import { cardLabel, type CardSize } from "@/lib/partner/story-kit";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { verified: "Verified", estimated: "Estimated" };

/**
 * A charity partner's share card at its exact export size (the preview
 * scales the wrapper, not this node). Green ground, the co-brand line from
 * the initiative's own partners, at most two figures, each with its status
 * in words and its report page. Portrait sizes stack; the link size sets
 * the title and figures side by side.
 */
export const ShareCard = forwardRef<
  HTMLDivElement,
  { size: CardSize; coBrand: string; title: string; facts: Fact[] }
>(function ShareCard({ size, coBrand, title, facts }, ref) {
  const wide = size.width > size.height;
  const tall = size.height / size.width > 1.5;
  const sources = [...new Set(facts.map((f) => factCitation(f).label))];

  return (
    <div
      ref={ref}
      data-tone="green"
      style={{ width: size.width, height: size.height }}
      className={cn("flex flex-col justify-between bg-bg text-ink", wide ? "p-14" : "p-[72px]", tall && "pt-[180px] pb-[260px]")}
    >
      <div className="flex items-center gap-4">
        <span aria-hidden className={cn("block bg-lime", wide ? "h-8 w-2.5" : "h-10 w-3")} />
        <p className={cn("font-sans font-semibold tracking-[0.04em] text-ink uppercase", wide ? "text-[22px]" : "text-[28px]")}>{coBrand}</p>
      </div>

      <div className={cn("flex", wide ? "flex-row items-center gap-14" : tall ? "flex-col gap-16" : "flex-col gap-10")}>
        <h2
          className={cn(
            "font-serif leading-[1.04] font-medium tracking-[-0.01em] text-balance",
            wide ? "max-w-[480px] flex-1 self-center text-[56px]" : tall ? "text-[112px]" : "text-[80px]",
          )}
        >
          {title}
        </h2>

        {facts.length > 0 ? (
          <div className={cn("flex", wide ? "flex-1 flex-col gap-6" : tall ? "flex-col gap-12" : "flex-col gap-8")}>
            {facts.map((f, i) => {
              const p = factParts(f);
              const value = f.value === null ? f.valueText : `${p.prefix}${p.value}${p.unit === "%" || p.unit === "×" ? p.unit : ""}${p.suffix}`;
              const unit = p.unit && p.unit !== "%" && p.unit !== "×" ? p.unit : null;
              return (
                <div key={f.id} className="flex flex-col gap-3">
                  <span
                    className={cn(
                      "big-num leading-[0.9]",
                      i === 0 ? "text-lime" : "text-ink",
                      f.value === null ? (wide ? "text-[48px]" : "text-[72px]") : wide ? "text-[88px]" : tall ? "text-[150px]" : "text-[124px]",
                    )}
                  >
                    {value}
                    {unit && <span className={cn("ml-3 font-sans font-medium text-ink-2", wide ? "text-[28px]" : "text-[44px]")}>{unit}</span>}
                  </span>
                  <span className={cn("font-serif leading-[1.2] text-ink", wide ? "text-[22px]" : "max-w-[24ch] text-[40px]")}>
                    {cardLabel(f.id)}
                  </span>
                  <span className={cn("flex items-center gap-3 font-sans font-semibold tracking-[0.06em] text-ink-2 uppercase", wide ? "text-[16px]" : "text-[24px]")}>
                    <StatusMark status={f.status} className={wide ? "size-4" : "size-5"} />
                    {STATUS_LABEL[f.status] ?? f.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-md border-2 border-dashed border-line-strong p-8">
            <span className="font-sans text-[24px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Data gap</span>
            <p className="font-serif text-[36px] text-ink">The team has not published a figure for this programme yet.</p>
          </div>
        )}
      </div>

      <div className={cn("flex justify-between gap-8 font-sans text-ink-2", wide ? "text-[20px]" : "text-[26px]")}>
        <p>Source: Aston Martin Aramco {sources.join("; ")}</p>
        <p className="shrink-0">{APP_NAME}</p>
      </div>
    </div>
  );
});
