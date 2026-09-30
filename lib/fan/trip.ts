/**
 * The race-page trip planner: pure functions shared by the server render
 * (GET form, works without JavaScript) and the client component that
 * updates the result as the fan changes an input.
 *
 * It covers the last few kilometres to the circuit only. The fact base holds
 * DEFRA 2025 factors for local modes (taxi, car, bus, light rail), not for
 * coaches or flights, so the journey to Singapore isn't compared yet.
 *
 * Every figure here is computed from data/travel-modes.json (UK factors used
 * as proxies), so the UI labels it Estimated. Fan trips are compared with a
 * taxi or with driving alone for the same distance, never converted into
 * laps or scored.
 */
import { travelModes } from "@/lib/data/load";
import { getTravelMode, modeRatio, tripKg } from "@/lib/data/equivalents";
import type { Race, TravelMode } from "@/lib/data/schemas";

export const TRIP_DEFAULTS = { modeId: "mrt", km: 5 } as const;
export const TRIP_KM_MIN = 1;
export const TRIP_KM_MAX = 40;

export type TripInput = { modeId: string; km: number };

type Params = Record<string, string | string[] | undefined>;

/** Reads the planner's GET params, falling back to defaults for anything missing or invalid. */
export function parseTripParams(params: Params): TripInput {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const mode = one(params.mode);
  const km = Number(one(params.km));
  return {
    modeId: isTravelMode(mode) ? mode : TRIP_DEFAULTS.modeId,
    km: Number.isFinite(km) && km > 0 ? clampKm(km) : TRIP_DEFAULTS.km,
  };
}

export function isTravelMode(id: string | null | undefined): id is string {
  return Boolean(id) && travelModes.some((m) => m.id === id);
}

export function clampKm(km: number): number {
  return Math.min(TRIP_KM_MAX, Math.max(TRIP_KM_MIN, Math.round(km)));
}

/** "Marina Bay Street Circuit" -> "Marina Bay"; other circuits keep their name. */
export function destinationName(race: Race): string {
  return (race.circuit ?? race.name).replace(/\s+Street Circuit$/, "");
}

/** Mode labels read naturally on the page; the MRT label only makes sense in Singapore. */
export function modeLabel(mode: TravelMode, race: Race): string {
  if (mode.id === "mrt" && race.cityId !== "singapore") return "Rail or tram";
  return mode.label;
}

const PLAN_PHRASES: Record<string, (dest: string, rail: string) => { solo: string; group: string }> = {
  walk: (d) => ({ solo: `My plan: walking or cycling to ${d}`, group: `Our squad is walking or cycling to ${d}` }),
  mrt: (d, rail) => ({ solo: `My plan: the ${rail} to ${d}`, group: `Our squad is taking the ${rail} to ${d}` }),
  bus: (d) => ({ solo: `My plan: the bus to ${d}`, group: `Our squad is taking the bus to ${d}` }),
  taxi: (d) => ({ solo: `My plan: a taxi to ${d}`, group: `Our squad is sharing a taxi to ${d}` }),
  car: (d) => ({ solo: `My plan: driving to ${d}`, group: `Our squad is driving to ${d}` }),
};

/** The line printed on the share card, e.g. "My plan: the MRT to Marina Bay". */
export function planLine(modeId: string, race: Race, group = false): string {
  const phrase = PLAN_PHRASES[modeId]?.(destinationName(race), race.cityId === "singapore" ? "MRT" : "train");
  if (!phrase) return "";
  return group ? phrase.group : phrase.solo;
}

const FRACTIONS = ["", "", "half", "a third", "a quarter", "a fifth", "a sixth", "a seventh", "an eighth", "a ninth", "a tenth"];

/** Whose emissions the comparison is against: "a taxi's emissions", "the emissions of driving alone". */
const BASELINES: Record<string, string> = { taxi: "a taxi's emissions", car: "the emissions of driving alone" };

/**
 * A fan-readable comparison for a ratio of baseline / mode. From about two
 * times it reads as a fraction ("about a fifth of a taxi's emissions"),
 * below that as a percentage, to the nearest point under 20% and the nearest
 * five above it: never more precise than proxy factors deserve.
 */
export function comparePhrase(ratio: number, baselineId: string): string {
  const base = BASELINES[baselineId];
  if (!Number.isFinite(ratio)) return `no tailpipe emissions, unlike ${baselineId === "taxi" ? "a taxi" : "driving alone"}`;
  if (ratio >= 1.95) {
    const n = Math.round(ratio);
    return n > 10 ? `under a tenth of ${base}` : `about ${FRACTIONS[n]} of ${base}`;
  }
  const higher = ratio < 1;
  const raw = (higher ? 1 / ratio - 1 : 1 - 1 / ratio) * 100;
  const pct = raw < 20 ? Math.round(raw) : Math.round(raw / 5) * 5;
  if (pct === 0) return `about the same as ${base}`;
  return `about ${pct}% ${higher ? "more" : "less"} than ${base}`;
}

function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type TripResult = {
  mode: TravelMode;
  /** The mode's label for this race, e.g. "MRT" or "Rail or tram". */
  label: string;
  /** kg CO2e for the return trip, one passenger. */
  kg: number;
  /** Headline comparison, e.g. "About a fifth of a taxi's emissions". */
  lead: string;
  /** A second comparison, e.g. "About a sixth of the emissions of driving alone". */
  secondary: string | null;
};

export function tripResult(input: TripInput, race: Race): TripResult {
  const mode = getTravelMode(input.modeId);
  const kg = tripKg(mode.id, input.km, true);
  const label = modeLabel(mode, race);
  const rail = race.cityId === "singapore" ? "the MRT" : "the train";

  if (mode.id === "walk") return { mode, label, kg, lead: "No tailpipe emissions at all", secondary: null };
  if (mode.id === "taxi") {
    return { mode, label, kg, lead: sentence(comparePhrase(modeRatio("taxi", "car"), "car")), secondary: `Taking ${rail} instead: ${comparePhrase(modeRatio("mrt", "taxi"), "taxi")}` };
  }
  if (mode.id === "car") {
    return { mode, label, kg, lead: sentence(comparePhrase(modeRatio("car", "taxi"), "taxi")), secondary: `Taking ${rail} instead: ${comparePhrase(modeRatio("mrt", "car"), "car")}` };
  }
  return { mode, label, kg, lead: sentence(comparePhrase(modeRatio(mode.id, "taxi"), "taxi")), secondary: sentence(comparePhrase(modeRatio(mode.id, "car"), "car")) };
}

/** kg shown small under the comparison: never more precise than the proxy factors deserve. */
export function formatKg(kg: number): string {
  if (kg === 0) return "0";
  const digits = kg < 1 ? 2 : kg < 10 ? 1 : 0;
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: digits }).format(kg);
}
