"use client";

/**
 * The story's three graphics, hand-built so they stay crisp and directly
 * labelled at any width. Every printed value is a button that opens the
 * fact's provenance. The highlight comes from the active step (stage) or an
 * explicit prop (the no-JavaScript copy inside a card).
 */
import type { CSSProperties, ReactNode } from "react";
import { useProvenance } from "@/components/shared/provenance";
import { StatusMark } from "@/components/shared/status-badge";
import { factCitation, getFact } from "@/lib/data/load";
import { formatFact } from "@/lib/format";
import {
  FOOTPRINT_TOTAL_ID,
  footprintSegments,
  progressRows,
  targetBars,
  tracksideStoryRows,
  type TracksideSource,
} from "@/lib/story/graphics";
import type { GraphicKey } from "@/lib/story/chapters";
import { cn } from "@/lib/utils";
import { useStageHighlight } from "./scrolly";

const EASE = "duration-500 ease-[cubic-bezier(.4,0,.2,1)]";

function useHighlight(override?: string[]): string[] {
  const fromStage = useStageHighlight();
  return override ?? fromStage ?? [];
}

/** A value on a graphic: the formatted fact plus its status mark, opening provenance. */
function Figure({ id, className, children }: { id: string; className?: string; children?: ReactNode }) {
  const { openFact } = useProvenance();
  const f = getFact(id);
  const cite = factCitation(f);
  return (
    <button
      type="button"
      onClick={() => openFact(id)}
      className={cn("num inline-flex items-center gap-1.5 text-left hover:underline hover:decoration-1 hover:underline-offset-[3px]", className)}
      aria-label={`${f.fanLabel ?? f.metric}: ${formatFact(f)}. ${f.status}. ${cite.label}. Show source.`}
    >
      {children ?? formatFact(f)}
      <StatusMark status={f.status} />
    </button>
  );
}

/** Chart title in kicker style; the unit keeps its case (tCO₂e, kWh). */
function GraphicHead({ title, unit, citeId }: { title: string; unit?: string; citeId: string }) {
  const { openFact } = useProvenance();
  const cite = factCitation(getFact(citeId));
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="kicker text-ink">
        {title}
        {unit && <span className="normal-case">, {unit}</span>}
      </p>
      <button type="button" onClick={() => openFact(citeId)} className="text-[0.8125rem] text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink">
        {cite.label} ↗
      </button>
    </div>
  );
}

/* ----------------------------------------------------------- footprint */

export function FootprintGraphic({ highlight }: { highlight?: string[] }) {
  const hl = useHighlight(highlight);
  const segs = footprintSegments();
  const total = getFact(FOOTPRINT_TOTAL_ID);
  const [main, ...small] = segs;
  const placed = segs;
  const on = (key: string) => hl.includes(key);

  return (
    <figure role="figure" aria-label={`The team's footprint by category. Whole footprint ${formatFact(total)}.`} className="font-sans">
      <GraphicHead title={`The team's footprint, ${total.period}`} citeId={FOOTPRINT_TOTAL_ID} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className={cn("flex flex-col gap-1 transition-colors", EASE, on(main.key) ? "text-ink" : "text-ink-2")}>
          <Figure id={main.factId} className="text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-none font-bold [font-stretch:75%]" />
          <span className="text-[0.9375rem] font-medium">{main.label}</span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-ink-2">
          <span className="kicker text-ink-3">Whole footprint</span>
          <Figure id={FOOTPRINT_TOTAL_ID} className="text-[0.9375rem] font-semibold text-ink" />
        </div>
      </div>

      {/* The bar: 2px ground-coloured gaps, one highlighted block. */}
      <div aria-hidden className="flex h-8 w-full gap-[2px] lg:h-10">
        {placed.map((s) => (
          <div
            key={s.key}
            className={cn("h-full min-w-[2px] transition-colors", EASE, on(s.key) ? "bg-highlight" : s.key === main.key ? "bg-ink-3" : "bg-line-strong")}
            style={{ flexGrow: s.share, flexBasis: 0 }}
          />
        ))}
      </div>

      {/* Small categories: a staircase of labels with 1px leader lines. */}
      <div className="relative mt-0" style={{ height: `${small.length * 36 + 8}px` }}>
        {placed.slice(1).map((s, i) => {
          const y = 22 + i * 36;
          const lit = on(s.key);
          return (
            <div key={s.key}>
              <span
                aria-hidden
                className={cn("absolute top-0 w-px transition-colors", EASE, lit ? "bg-ink" : "bg-line-strong")}
                style={{ left: `${s.centre}%`, height: `${y}px` }}
              />
              <span
                aria-hidden
                className={cn("absolute h-px w-2.5 transition-colors", EASE, lit ? "bg-ink" : "bg-line-strong")}
                style={{ left: `calc(${s.centre}% - 10px)`, top: `${y}px` }}
              />
              <div
                className={cn("absolute flex -translate-y-1/2 items-baseline gap-2 whitespace-nowrap transition-colors", EASE, lit ? "text-ink" : "text-ink-2")}
                style={{ right: `calc(${100 - s.centre}% + 16px)`, top: `${y}px` }}
              >
                <span className={cn("text-[0.875rem] lg:text-[0.9375rem]", lit && "font-semibold")}>{s.label}</span>
                <Figure id={s.factId} className="text-[0.875rem] font-semibold lg:text-[0.9375rem]" />
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/* ----------------------------------------------------------- trackside */

const SOURCE_FILL: Record<TracksideSource, string> = { hvo: "bg-line-strong", grid: "bg-ink-3", solar: "bg-ink" };
const SOURCE_WORD: Record<TracksideSource, string> = { hvo: "HVO", grid: "grid", solar: "solar" };

export function TracksideGraphic({ highlight }: { highlight?: string[] }) {
  const hl = useHighlight(highlight);
  const rows = tracksideStoryRows();
  const showing: TracksideSource[] = hl.includes("grid") || hl.includes("solar") ? ["grid", "solar"] : ["hvo"];
  const gapOn = hl.includes("singapore");
  const firstFact = rows[0].parts[0].fact!;

  return (
    <figure role="figure" aria-label="The team's trackside electricity by source at European rounds, in kilowatt-hours. Singapore is not published." className="font-sans">
      <GraphicHead title={`Trackside electricity by source, ${firstFact.period}`} unit="kWh" citeId={firstFact.id} />
      <div className="mb-2 flex items-end justify-between gap-x-3 text-[0.8125rem] text-ink-3 sm:pl-[calc(6.5rem+0.75rem)]">
        <span className="flex flex-wrap gap-x-3 gap-y-0.5">
          {(["hvo", "grid", "solar"] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("inline-block size-2.5", hl.includes(k) ? "bg-highlight" : SOURCE_FILL[k])} />
              {k === "hvo" ? "HVO generators" : k === "grid" ? "Renewable grid" : "Solar"}
            </span>
          ))}
        </span>
        <span className="shrink-0 text-right">{showing.map((k) => SOURCE_WORD[k]).join(" · ")}</span>
      </div>
      <ul className="flex flex-col">
        {rows.map((r) => (
          <li key={r.raceId} className="grid h-8 grid-cols-[5.25rem_1fr_7.5rem] items-center gap-x-3 border-t border-line text-[0.875rem] sm:grid-cols-[6.5rem_1fr_9rem] lg:h-9">
            <span className="truncate text-ink-2">{r.label}</span>
            <span aria-hidden className="flex h-3.5 w-full gap-px lg:h-4">
              {r.parts.map((p) =>
                p.fact ? (
                  <span
                    key={p.key}
                    className={cn("h-full min-w-px transition-colors", EASE, hl.includes(p.key) ? "bg-highlight" : SOURCE_FILL[p.key])}
                    style={{ width: `${p.share * 100}%` }}
                  />
                ) : null,
              )}
            </span>
            <span className="flex justify-end gap-2 text-ink">
              {showing.map((k) => {
                const p = r.parts.find((x) => x.key === k)!;
                return p.fact ? (
                  <Figure key={k} id={p.fact.id} className="font-medium">
                    {formatFact(p.fact).replace(/\s*kWh$/, "")}
                  </Figure>
                ) : (
                  <span key={k} className="text-ink-3" title="Not listed for this round">
                    <span aria-hidden>–</span>
                    <span className="sr-only">not listed</span>
                  </span>
                );
              })}
            </span>
          </li>
        ))}
        <li className="grid grid-cols-[5.25rem_1fr] items-center gap-x-3 border-t border-line pt-2 text-[0.875rem] sm:grid-cols-[6.5rem_1fr]">
          <span className={cn("transition-colors", EASE, gapOn ? "font-semibold text-ink" : "text-ink-2")}>Marina Bay</span>
          <span
            role="note"
            className={cn(
              "flex flex-wrap items-baseline gap-x-2 rounded-sm border border-dashed px-3 py-1.5 transition-colors",
              EASE,
              gapOn ? "border-highlight text-ink" : "border-line-strong text-ink-2",
            )}
          >
            <span className="kicker text-ink-3">Data gap</span>
            <span>Singapore trackside energy is not published.</span>
          </span>
        </li>
      </ul>
    </figure>
  );
}

/* ------------------------------------------------------------- targets */

export function TargetsGraphic({ highlight }: { highlight?: string[] }) {
  const hl = useHighlight(highlight);
  const bars = targetBars();
  const rows = progressRows();
  const nothing = hl.length === 0;

  return (
    <figure role="figure" aria-label="The team's target progress chart: baseline, latest year, near-term target and net zero, in tonnes of carbon dioxide equivalent." className="font-sans">
      <GraphicHead title="Target progress" unit="tCO₂e" citeId="e25-target-2030-tco2e" />
      <div className="grid grid-cols-4 items-end gap-3 sm:gap-5" style={{ height: "clamp(150px, 26svh, 250px)" }}>
        {bars.map((b) => {
          const lit = hl.includes(b.key);
          const style: CSSProperties = { height: `${Math.max(b.share * 100, 1.5)}%` };
          return (
            <div key={b.key} className="flex h-full flex-col justify-end gap-1.5">
              <Figure
                id={b.factId}
                className={cn("text-[0.875rem] font-semibold transition-colors lg:text-[0.9375rem]", EASE, lit ? "text-ink" : "text-ink-2")}
              >
                {/* The unit is in the chart title. */}
                {formatFact(getFact(b.factId)).replace(/\s*tCO₂e$/, "")}
              </Figure>
              {b.kind === "achieved" ? (
                <span aria-hidden className={cn("block w-full transition-colors", EASE, lit || nothing ? "bg-highlight" : "bg-line-strong")} style={style} />
              ) : (
                <span
                  aria-hidden
                  className={cn("block w-full border-[1.5px] border-dashed transition-colors", EASE, lit ? "border-highlight" : "border-ink-3")}
                  style={style}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-3 border-t border-line-strong pt-2 sm:gap-5">
        {bars.map((b) => (
          <span key={b.key} className={cn("text-[0.8125rem] leading-tight transition-colors", EASE, hl.includes(b.key) ? "font-semibold text-ink" : "text-ink-2")}>
            {b.label}
          </span>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-4">
        {rows.map((r) => {
          const lit = hl.includes(r.key);
          const target = getFact(r.targetId);
          return (
            <div key={r.key} className={cn("flex flex-col gap-1.5 transition-colors", EASE, lit ? "text-ink" : "text-ink-2")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[0.875rem]">
                <span className={cn(lit && "font-semibold")}>{r.label}</span>
                <span className="flex items-baseline gap-2">
                  {/* A fall reads as "down 74%", never a signed "-74%". */}
                  <Figure id={r.progressId} className="font-semibold">
                    {(getFact(r.progressId).value ?? 0) < 0 ? "down" : "up"} {formatFact(getFact(r.progressId)).replace(/^[-−]/, "")}
                  </Figure>
                  <span className="text-ink-3">
                    {target.period} target cut <Figure id={r.targetId} className="text-ink-2" />
                  </span>
                </span>
              </div>
              <div aria-hidden className="relative h-2.5 w-full bg-surface-2">
                <span
                  className={cn("absolute inset-y-0 left-0 transition-colors", EASE, lit || nothing ? "bg-highlight" : "bg-line-strong")}
                  style={{ width: `${r.progress * 100}%` }}
                />
                <span className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: `calc(${r.target * 100}% - 1px)` }} />
              </div>
              {r.pastTarget && <span className="text-[0.8125rem] text-ink-2">Already {r.pastTarget}.</span>}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

export function StoryGraphic({ graphic, highlight }: { graphic: GraphicKey; highlight?: string[] }) {
  if (graphic === "footprint") return <FootprintGraphic highlight={highlight} />;
  if (graphic === "trackside") return <TracksideGraphic highlight={highlight} />;
  return <TargetsGraphic highlight={highlight} />;
}
