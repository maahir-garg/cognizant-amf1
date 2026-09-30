"use client";

/**
 * The story's stage graphics, hand-built so they stay crisp and directly
 * labelled at any width. Every printed value is a button that opens the
 * fact's provenance. The highlight comes from the active step (stage) or an
 * explicit prop (the no-JavaScript copy inside a card).
 *
 * Motion rules: titles, axes and labels never move; only colour, opacity
 * and transform change, so a highlight never reflows text. Status marks
 * take the text colour (the shape carries the status), so lime is only
 * ever the highlight.
 */
import type { CSSProperties, ReactNode } from "react";
import { useProvenance } from "@/components/shared/provenance";
import { StatusMark } from "@/components/shared/status-badge";
import { factCitation, getFact, sourceShortName } from "@/lib/data/load";
import { factParts, formatFact } from "@/lib/format";
import type { GraphicKey, Quote, Tile } from "@/lib/story/chapters";
import {
  FOOTPRINT_TAIL_FROM,
  FOOTPRINT_TOTAL_ID,
  footprintSegments,
  footprintTail,
  progressRows,
  targetBars,
  tracksideStoryRows,
  type TracksideSource,
} from "@/lib/story/graphics";
import { cn } from "@/lib/utils";
import { useStageHighlight } from "./scrolly";

const EASE = "duration-500 ease-[cubic-bezier(.4,0,.2,1)]";

function useHighlight(override?: string[]): string[] {
  const fromStage = useStageHighlight();
  return override ?? fromStage ?? [];
}

/** A value on a graphic: the formatted fact plus its status mark in the text colour, opening provenance. */
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
      <StatusMark status={f.status} className={f.status === "verified" ? "bg-current" : undefined} />
    </button>
  );
}

/** Chart title in kicker style; the unit keeps its case (tCO₂e, kWh). */
function GraphicHead({ title, unit, citeId }: { title: string; unit?: string; citeId?: string }) {
  const { openFact } = useProvenance();
  const cite = citeId ? factCitation(getFact(citeId)) : null;
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 lg:mb-5">
      <p className="kicker text-ink">
        {title}
        {unit && <span className="normal-case">, {unit}</span>}
      </p>
      {cite && citeId && (
        <button type="button" onClick={() => openFact(citeId)} className="text-[0.8125rem] text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink">
          {cite.label} ↗
        </button>
      )}
    </div>
  );
}

/** A 2px ink bracket under a bar that slides and stretches to the part being discussed. */
function FocusBracket({ start, width }: { start: number; width: number }) {
  const shown = width > 0;
  return (
    <div aria-hidden className="relative mt-1 h-0.5 w-full">
      <span
        className="absolute inset-y-0 left-0 w-full origin-left bg-ink transition-[transform,opacity] duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: `translateX(${start}%) scaleX(${Math.max(width, 0.004)})`, opacity: shown ? 1 : 0 }}
      />
    </div>
  );
}

/* ----------------------------------------------------------- footprint */

const ROW = 36;

export function FootprintGraphic({ highlight }: { highlight?: string[] }) {
  const hl = useHighlight(highlight);
  const segs = footprintSegments();
  const tail = footprintTail();
  const total = getFact(FOOTPRINT_TOTAL_ID);
  const [main] = segs;
  // Categories that live entirely in the tail are labelled from the inset; the rest from the main bar.
  const fromInset = segs.filter((s) => s.start >= FOOTPRINT_TAIL_FROM);
  const fromBar = segs.slice(1).filter((s) => !fromInset.includes(s));
  const on = (key: string) => hl.includes(key);

  const lit = segs.filter((s) => on(s.key));
  const bStart = lit.length ? Math.min(...lit.map((s) => s.start)) : 0;
  const bEnd = lit.length ? Math.max(...lit.map((s) => s.start + s.share * 100)) : 0;

  const stairH = fromBar.length * ROW;
  const insetTop = stairH + 16;
  const insetH = 14;
  const insetRowsTop = insetTop + insetH;

  return (
    <figure role="figure" aria-label={`The team's footprint by category. Whole footprint ${formatFact(total)}.`} className="font-sans">
      <GraphicHead title="The team's footprint by category" citeId={FOOTPRINT_TOTAL_ID} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className={cn("flex flex-col gap-1 transition-colors", EASE, on(main.key) ? "text-ink" : "text-ink-3")}>
          <Figure id={main.factId} className="text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-none font-bold [font-stretch:75%]" />
          <span className="text-[0.9375rem] font-medium">{main.label}</span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-ink">
          <span className="kicker text-ink-3">Whole footprint</span>
          <Figure id={FOOTPRINT_TOTAL_ID} className="text-[0.9375rem] font-semibold" />
        </div>
      </div>

      {/* The bar: 2px ground-coloured gaps, the part under discussion highlighted. */}
      <div aria-hidden className="flex h-8 w-full gap-[2px] lg:h-10">
        {segs.map((s) => (
          <div
            key={s.key}
            className={cn("h-full min-w-[2px] transition-colors", EASE, on(s.key) ? "bg-highlight" : s.key === main.key ? "bg-ink-3" : "bg-line-strong")}
            style={{ flexGrow: s.share, flexBasis: 0 }}
          />
        ))}
      </div>
      <FocusBracket start={bStart} width={(bEnd - bStart) / 100} />

      <div className="relative" style={{ height: `${insetRowsTop + fromInset.length * ROW + 6}px` }}>
        {/* Staircase labels with 1px leader lines for the mid-sized categories. */}
        {fromBar.map((s, i) => (
          <Leader key={s.key} x={s.centre} top={0} y={22 + i * ROW} lit={on(s.key)}>
            <span className="text-[0.875rem] lg:text-[0.9375rem]">{s.label}</span>
            <Figure id={s.factId} className="text-[0.875rem] font-semibold lg:text-[0.9375rem]" />
          </Leader>
        ))}

        {/* The tail of the bar, enlarged, so the two smallest categories can be seen and highlighted. */}
        <span aria-hidden className="absolute top-0 w-px bg-line-strong" style={{ left: `${FOOTPRINT_TAIL_FROM}%`, height: `${insetTop - 10}px` }} />
        <span aria-hidden className="absolute top-0 right-0 w-px bg-line-strong" style={{ height: `${insetTop - 10}px` }} />
        <svg aria-hidden className="absolute left-0 w-full overflow-visible" style={{ top: `${insetTop - 10}px`, height: "10px" }} viewBox="0 0 100 10" preserveAspectRatio="none">
          <line x1={FOOTPRINT_TAIL_FROM} y1="0" x2="50" y2="10" className="stroke-line-strong" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="100" y1="0" x2="100" y2="10" className="stroke-line-strong" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="kicker absolute right-[52%] -translate-y-1/2 text-right whitespace-nowrap text-ink-3"
          style={{ top: `${insetTop + insetH / 2}px` }}
        >
          <span className="sm:hidden">Enlarged</span>
          <span className="hidden sm:inline">End of the bar, enlarged</span>
        </span>
        <div aria-hidden className="absolute left-1/2 flex w-1/2 gap-[2px]" style={{ top: `${insetTop}px`, height: `${insetH}px` }}>
          {tail.map((t) => (
            <div
              key={t.key}
              className={cn("h-full transition-colors", EASE, on(t.key) ? "bg-highlight" : "bg-line-strong")}
              style={{ flexGrow: t.tailWidth, flexBasis: 0 }}
            />
          ))}
        </div>
        {fromInset.map((s, i) => {
          const t = tail.find((x) => x.key === s.key)!;
          return (
            <Leader key={s.key} x={50 + t.tailCentre / 2} top={insetRowsTop} y={insetRowsTop + 22 + i * ROW} lit={on(s.key)}>
              <span className="text-[0.875rem] lg:text-[0.9375rem]">{s.label}</span>
              <Figure id={s.factId} className="text-[0.875rem] font-semibold lg:text-[0.9375rem]" />
            </Leader>
          );
        })}
      </div>
    </figure>
  );
}

/** A label that hangs off a bar on an elbowed 1px leader: down from `top` to `y`, then left. */
function Leader({ x, top, y, lit, children }: { x: number; top: number; y: number; lit: boolean; children: ReactNode }) {
  return (
    <div>
      <span
        aria-hidden
        className={cn("absolute w-px transition-colors", EASE, lit ? "bg-ink" : "bg-line-strong")}
        style={{ left: `${x}%`, top: `${top}px`, height: `${y - top}px` }}
      />
      <span
        aria-hidden
        className={cn("absolute h-px w-2.5 transition-colors", EASE, lit ? "bg-ink" : "bg-line-strong")}
        style={{ left: `calc(${x}% - 10px)`, top: `${y}px` }}
      />
      <div
        className={cn("absolute flex -translate-y-1/2 items-baseline gap-2 whitespace-nowrap transition-colors", EASE, lit ? "text-ink" : "text-ink-3")}
        style={{ right: `calc(${100 - x}% + 16px)`, top: `${y}px` }}
      >
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- trackside */

const SOURCE_FILL: Record<TracksideSource, string> = { hvo: "bg-line-strong", grid: "bg-ink-3", solar: "bg-ink" };
const COLS = "grid-cols-[5rem_1fr_6.75rem] sm:grid-cols-[6.5rem_1fr_9rem]";

/** Two versions of a cell stacked in one grid area, crossfaded, so switching the value column never jumps. */
function Crossfade({ showA, a, b, className }: { showA: boolean; a: ReactNode; b: ReactNode; className?: string }) {
  return (
    <span className={cn("grid", className)}>
      <span className={cn("[grid-area:1/1] transition-opacity duration-300", showA ? "opacity-100" : "invisible opacity-0")}>{a}</span>
      <span className={cn("[grid-area:1/1] transition-opacity duration-300", showA ? "invisible opacity-0" : "opacity-100")}>{b}</span>
    </span>
  );
}

export function TracksideGraphic({ highlight }: { highlight?: string[] }) {
  const hl = useHighlight(highlight);
  const rows = tracksideStoryRows();
  const showHvo = !(hl.includes("grid") || hl.includes("solar"));
  const gapOn = hl.includes("singapore");
  const firstFact = rows[0].parts[0].fact!;

  const values = (r: (typeof rows)[number], keys: TracksideSource[]) => (
    <span className="flex justify-end gap-2">
      {keys.map((k) => {
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
  );

  return (
    <figure role="figure" aria-label="The team's trackside electricity by source at European rounds, in kilowatt-hours. Singapore is not published." className="font-sans">
      <GraphicHead title={`Trackside electricity by source, ${firstFact.period}`} unit="kWh" citeId={firstFact.id} />
      <div className="mb-1.5 flex items-end justify-between gap-x-3 text-[0.8125rem] text-ink-3 sm:pl-[calc(6.5rem+0.75rem)]">
        <span className="flex flex-wrap gap-x-3 gap-y-0.5">
          {(["hvo", "grid", "solar"] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("inline-block size-2.5 transition-colors", EASE, hl.includes(k) ? "bg-highlight" : SOURCE_FILL[k])} />
              {k === "hvo" ? "HVO generators" : k === "grid" ? "Renewable grid" : "Solar"}
            </span>
          ))}
        </span>
        <Crossfade showA={showHvo} a="HVO" b="grid · solar" className="shrink-0 text-right" />
      </div>
      <ul className="flex flex-col">
        {rows.map((r) => (
          <li key={r.raceId} className={cn("grid h-7 items-center gap-x-3 border-t border-line text-[0.8125rem] sm:text-[0.875rem] lg:h-9", COLS)}>
            <span className="truncate text-ink-2">{r.label}</span>
            <span aria-hidden className="flex h-3 w-full gap-px lg:h-4">
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
            <Crossfade showA={showHvo} a={values(r, ["hvo"])} b={values(r, ["grid", "solar"])} className="text-ink" />
          </li>
        ))}
        <li className="grid grid-cols-[5rem_1fr] items-center gap-x-3 border-t border-line pt-1.5 text-[0.8125rem] sm:grid-cols-[6.5rem_1fr] sm:text-[0.875rem]">
          <span className={cn("transition-colors", EASE, gapOn ? "text-ink" : "text-ink-2")}>Marina Bay</span>
          <span
            role="note"
            className={cn(
              "flex flex-wrap items-baseline gap-x-2 rounded-sm border border-dashed px-3 py-1 transition-colors",
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

  const progress = (
    <div className="flex flex-col gap-3 lg:mt-7 lg:gap-4">
      {rows.map((r) => {
        const lit = hl.includes(r.key);
        const target = getFact(r.targetId);
        return (
          <div key={r.key} className={cn("flex flex-col gap-1.5 transition-colors", EASE, lit ? "text-ink" : "text-ink-3")}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[0.8125rem] sm:text-[0.875rem]">
              <span>{r.label}</span>
              <span className="flex items-baseline gap-2">
                {/* A fall reads as "down 74%", never a signed "-74%". */}
                <Figure id={r.progressId} className="font-semibold">
                  {(getFact(r.progressId).value ?? 0) < 0 ? "down" : "up"} {formatFact(getFact(r.progressId)).replace(/^[-−]/, "")}
                </Figure>
                <span>
                  {target.period} target cut <Figure id={r.targetId} />
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
            {r.pastTarget && <span className="text-[0.8125rem]">Already {r.pastTarget}.</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <figure role="figure" aria-label="The team's target progress chart: baseline, latest year, near-term target and net zero, in tonnes of carbon dioxide equivalent." className="flex flex-col font-sans">
      <GraphicHead title="Target progress" unit="tCO₂e" citeId="e25-target-2030-tco2e" />
      {/* Phones: the progress rows come first so a resting card never covers them. */}
      <div className="order-last mt-5 lg:order-none lg:mt-0">
        <div className="grid h-[clamp(110px,18svh,160px)] grid-cols-4 items-end gap-3 sm:gap-5 lg:h-[clamp(150px,26svh,250px)]">
          {bars.map((b) => {
            const lit = hl.includes(b.key);
            const style: CSSProperties = { height: `${Math.max(b.share * 100, 1.5)}%` };
            return (
              <div key={b.key} className="flex h-full flex-col justify-end gap-1.5">
                <Figure id={b.factId} className={cn("text-[0.8125rem] font-semibold transition-colors sm:text-[0.875rem] lg:text-[0.9375rem]", EASE, lit ? "text-ink" : "text-ink-3")}>
                  {/* The unit is in the chart title. */}
                  {formatFact(getFact(b.factId)).replace(/\s*tCO₂e$/, "")}
                </Figure>
                {b.kind === "achieved" ? (
                  <span aria-hidden className={cn("block w-full transition-colors", EASE, lit || nothing ? "bg-highlight" : "bg-line-strong")} style={style} />
                ) : (
                  <span aria-hidden className={cn("block w-full border-[1.5px] border-dashed transition-colors", EASE, lit ? "border-highlight" : "border-ink-3")} style={style} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-3 border-t border-line-strong pt-2 sm:gap-5">
          {bars.map((b) => (
            <span key={b.key} className={cn("text-[0.8125rem] leading-tight transition-colors", EASE, hl.includes(b.key) ? "text-ink" : "text-ink-3")}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
      {progress}
    </figure>
  );
}

/* --------------------------------------------------------------- tiles */

/** The number of a tile: value large, word units smaller beside it. */
function TileValue({ id }: { id: string }) {
  const p = factParts(getFact(id));
  const symbol = p.unit === "%" || p.unit === "×";
  return (
    <Figure id={id} className="items-baseline gap-2">
      <span className="text-[clamp(1.75rem,1.2rem+1.8vw,3rem)] leading-none font-bold [font-stretch:75%]">
        {p.prefix}
        {p.value}
        {symbol ? p.unit : ""}
        {p.suffix}
      </span>
      {!symbol && p.unit && <span className="text-[0.9375rem] font-medium">{p.unit}</span>}
    </Figure>
  );
}

/** "By the numbers" frame: a hairline grid of figures, the ones the step is about in the highlight colour. */
export function TilesGraphic({ title, tiles, highlight }: { title: string; tiles: Tile[]; highlight?: string[] }) {
  const hl = useHighlight(highlight);
  const nothing = hl.length === 0;
  return (
    <figure role="figure" aria-label={title} className="font-sans">
      <GraphicHead title={title} />
      <ul className={cn("grid grid-cols-2 gap-x-5 gap-y-4 lg:gap-x-8 lg:gap-y-7", tiles.length > 4 && "lg:grid-cols-3")}>
        {tiles.map((t) => {
          const lit = nothing || hl.includes(t.key);
          return (
            <li key={t.key} className="relative flex flex-col gap-1.5 border-t border-line pt-3">
              <span
                aria-hidden
                className={cn("absolute -top-px left-0 h-0.5 w-full origin-left bg-highlight transition-transform", EASE, hl.includes(t.key) ? "scale-x-100" : "scale-x-0")}
              />
              <span className={cn("transition-colors", EASE, lit ? "text-ink" : "text-ink-3")}>
                <TileValue id={t.factId} />
              </span>
              <span className={cn("font-serif text-[0.9375rem] leading-snug transition-colors lg:text-base", EASE, lit ? "text-ink-2" : "text-ink-3")}>{t.label}</span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/* --------------------------------------------------------------- quote */

export function QuoteStage({ quote }: { quote: Quote }) {
  return (
    <figure className="flex w-full max-w-[640px] flex-col gap-5">
      <blockquote className="font-serif text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.12] font-medium text-ink italic">
        <p className="text-balance">
          <span aria-hidden className="text-highlight">
            “
          </span>
          {quote.text}
          <span aria-hidden className="text-highlight">
            ”
          </span>
        </p>
      </blockquote>
      <figcaption className="flex flex-col gap-1 border-t border-line pt-3 font-sans">
        <span className="text-[0.9375rem] font-semibold text-ink">{quote.speaker}</span>
        <span className="text-[0.875rem] text-ink-2">
          {quote.role} · {sourceShortName(quote.sourceId)}, p. {quote.page}
        </span>
      </figcaption>
    </figure>
  );
}

export function StoryGraphic({ graphic, highlight }: { graphic: Exclude<GraphicKey, "tiles">; highlight?: string[] }) {
  if (graphic === "footprint") return <FootprintGraphic highlight={highlight} />;
  if (graphic === "trackside") return <TracksideGraphic highlight={highlight} />;
  return <TargetsGraphic highlight={highlight} />;
}
