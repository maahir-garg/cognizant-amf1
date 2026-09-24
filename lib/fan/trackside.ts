/**
 * Groups a race's trackside-electricity facts (HVO generators, renewable
 * grid, solar) into chart rows. A missing component means the source simply
 * doesn't report that category for that round — not that it was zero.
 */
import { findFact, getRace } from "@/lib/data/load";

export type TracksideRow = {
  raceId: string;
  /** Short label for chart axes, e.g. "British GP". */
  label: string;
  hvo: number | null;
  grid: number | null;
  solar: number | null;
};

/** The nine 2025 European rounds with published trackside-energy splits. */
export const EUROPEAN_TRACKSIDE_RACE_IDS = [
  "gbr-2025",
  "ned-2025",
  "bel-2025",
  "esp-2025",
  "mon-2025",
  "aut-2025",
  "hun-2025",
  "ita-2025",
  "emi-2025",
];

export function tracksideRow(raceId: string): TracksideRow {
  const race = getRace(raceId);
  const factsOnRace = race.factIds.map((id) => findFact(id)).filter((f) => Boolean(f));
  const find = (suffix: string) => factsOnRace.find((f) => f!.id.endsWith(suffix))?.value ?? null;
  return {
    raceId,
    label: SHORT_LABELS[race.id] ?? race.name.replace(/ Grand Prix.*/, ""),
    hvo: find("-hvo"),
    grid: find("-grid"),
    solar: find("-solar"),
  };
}

export function europeanTracksideRows(): TracksideRow[] {
  return EUROPEAN_TRACKSIDE_RACE_IDS.map(tracksideRow);
}

/** Races (from a set of rows) missing a given component, for a plain-language caption. */
export function missingLabel(rows: TracksideRow[], key: "hvo" | "grid" | "solar"): string | null {
  const missing = rows.filter((r) => r[key] === null).map((r) => r.label);
  if (!missing.length) return null;
  return missing.join(", ");
}

/** Circuit names are shorter than race names and still read as F1 to fans. */
const SHORT_LABELS: Record<string, string> = {
  "gbr-2025": "Silverstone",
  "ned-2025": "Zandvoort",
  "bel-2025": "Spa",
  "esp-2025": "Barcelona",
  "mon-2025": "Monaco",
  "aut-2025": "Spielberg",
  "hun-2025": "Budapest",
  "ita-2025": "Monza",
  "emi-2025": "Imola",
};
