/**
 * Data for the story's three hand-built graphics. Every value is a fact from
 * the fact base; the only arithmetic is layout (widths and heights as shares
 * of a published total), which is never shown as a number.
 */
import { findFact, getFact, getRace } from "@/lib/data/load";
import type { Fact } from "@/lib/data/schemas";
import { EUROPEAN_TRACKSIDE_RACE_IDS, tracksideRow } from "@/lib/fan/trackside";

/* --------------------------------------------------------- footprint */

export const FOOTPRINT_TOTAL_ID = "e25-ghg-total-sbti";

export type FootprintSegment = {
  key: string;
  factId: string;
  label: string;
  share: number;
  /** Start and centre of the segment along the bar, 0-100, for leader lines and the focus bracket. */
  start: number;
  centre: number;
};

/** The report's own breakdown (p. 19), in the order it prints it. The six parts add up to the total. */
const FOOTPRINT_PARTS: { key: string; factId: string; label: string }[] = [
  { key: "supply-chain", factId: "e25-supply-chain", label: "Supply chain" },
  { key: "freight", factId: "e25-freight-logistics", label: "Freight and logistics" },
  { key: "commuting", factId: "e25-commuting", label: "Commuting" },
  { key: "business-travel", factId: "e25-business-travel", label: "Business travel" },
  { key: "hq-energy", factId: "e25-hq-energy", label: "Campus energy" },
  { key: "other", factId: "e25-other-emissions", label: "Everything else" },
];

export function footprintSegments(): FootprintSegment[] {
  const total = getFact(FOOTPRINT_TOTAL_ID).value ?? 1;
  const shares = FOOTPRINT_PARTS.map((p) => (getFact(p.factId).value ?? 0) / total);
  return FOOTPRINT_PARTS.map((p, i) => {
    const start = shares.slice(0, i).reduce((a, b) => a + b, 0);
    return { ...p, share: shares[i], start: start * 100, centre: (start + shares[i] / 2) * 100 };
  });
}

/** Where the magnified inset starts (0-100 along the bar): the tail holds the two smallest categories. */
export const FOOTPRINT_TAIL_FROM = 98;

/** Segments that fall in the bar's tail, re-scaled to 0-100 across the inset. */
export function footprintTail(from = FOOTPRINT_TAIL_FROM): (FootprintSegment & { tailStart: number; tailWidth: number; tailCentre: number })[] {
  const span = 100 - from;
  return footprintSegments()
    .filter((s) => s.start + s.share * 100 > from)
    .map((s) => {
      const a = Math.max(s.start, from);
      const b = s.start + s.share * 100;
      return { ...s, tailStart: ((a - from) / span) * 100, tailWidth: ((b - a) / span) * 100, tailCentre: (((a + b) / 2 - from) / span) * 100 };
    });
}

/* ---------------------------------------------------------- targets */

export type TargetBar = { key: string; factId: string; label: string; kind: "achieved" | "target"; share: number };

/** The report's target chart (p. 15): baseline, current year, near-term target, net zero. */
export function targetBars(): TargetBar[] {
  const rows: { key: string; factId: string; kind: TargetBar["kind"]; suffix: string }[] = [
    { key: "baseline", factId: "e23-ghg-baseline", kind: "achieved", suffix: " baseline" },
    { key: "current", factId: "e25-ghg-total-sbti", kind: "achieved", suffix: "" },
    { key: "target-2030", factId: "e25-target-2030-tco2e", kind: "target", suffix: " target" },
    { key: "target-2050", factId: "e25-target-2050-tco2e", kind: "target", suffix: " net zero" },
  ];
  const max = Math.max(...rows.map((r) => getFact(r.factId).value ?? 0));
  return rows.map((r) => {
    const f = getFact(r.factId);
    return { key: r.key, factId: r.factId, kind: r.kind, label: `${f.period}${r.suffix}`, share: (f.value ?? 0) / max };
  });
}

export type ProgressRow = {
  key: string;
  label: string;
  progressId: string;
  targetId: string;
  /** Progress and target as shares of a full cut, for the bar and its target tick. */
  progress: number;
  target: number;
  /** "past the 2030 target", only where the published progress is beyond the published target. */
  pastTarget: string | null;
};

export function progressRows(): ProgressRow[] {
  const rows = [
    { key: "scope12", label: "Fuel and electricity the team uses directly", progressId: "e25-progress-scope12", targetId: "e25-target-scope12" },
    { key: "scope3", label: "Everything else in the value chain", progressId: "e25-progress-scope3", targetId: "e25-target-scope3" },
  ];
  return rows.map((r) => {
    const p = Math.abs(getFact(r.progressId).value ?? 0) / 100;
    const t = getFact(r.targetId);
    const tv = Math.abs(t.value ?? 0) / 100;
    return { ...r, progress: p, target: tv, pastTarget: p >= tv ? `past the ${t.period} target` : null };
  });
}

/* -------------------------------------------------------- trackside */

export type TracksideSource = "hvo" | "grid" | "solar";
const TRACKSIDE_SOURCES: { key: TracksideSource; label: string }[] = [
  { key: "hvo", label: "HVO generators" },
  { key: "grid", label: "Renewable grid" },
  { key: "solar", label: "Solar" },
];

export type TracksideStoryRow = {
  raceId: string;
  label: string;
  parts: { key: TracksideSource; fact: Fact | null; share: number }[];
};

/** European rounds with a published split, each part as a share of the largest round's total. */
export function tracksideStoryRows(): TracksideStoryRow[] {
  const rows = EUROPEAN_TRACKSIDE_RACE_IDS.map((raceId) => {
    const race = getRace(raceId);
    const parts = TRACKSIDE_SOURCES.map(({ key }) => {
      const id = race.factIds.find((x) => x.endsWith(`-${key}`));
      return { key, fact: id ? (findFact(id) ?? null) : null };
    });
    return { raceId, label: tracksideRow(raceId).label, parts };
  });
  const totals = rows.map((r) => r.parts.reduce((s, p) => s + (p.fact?.value ?? 0), 0));
  const max = Math.max(...totals);
  return rows.map((r) => ({ ...r, parts: r.parts.map((p) => ({ ...p, share: (p.fact?.value ?? 0) / max })) }));
}

/** Every fact a graphic prints, for the tests and the accessible alternatives. */
export function graphicFactIds(): string[] {
  return [
    FOOTPRINT_TOTAL_ID,
    ...FOOTPRINT_PARTS.map((p) => p.factId),
    ...targetBars().map((b) => b.factId),
    ...progressRows().flatMap((r) => [r.progressId, r.targetId]),
    ...tracksideStoryRows().flatMap((r) => r.parts.flatMap((p) => (p.fact ? [p.fact.id] : []))),
  ];
}
