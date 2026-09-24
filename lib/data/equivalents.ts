/**
 * Deterministic CO2e -> relatable-equivalent conversion. The AI never
 * invents a factor: every number here comes from data/conversion-factors.json
 * (verified or derived from verified facts) and is returned with the factor
 * id so the UI can show its provenance.
 */
import { conversionFactors, travelModes } from "./load";
import type { ConversionFactor, TravelMode } from "./schemas";

export type Equivalent = {
  factor: ConversionFactor;
  /** Number of units, e.g. 17,190 laps. */
  units: number;
  /** Rounded for display (never more precise than the input deserves). */
  display: string;
  /** Plural or singular label to go with `display`. */
  label: string;
};

export function getFactor(id: string): ConversionFactor {
  const f = conversionFactors.find((c) => c.id === id);
  if (!f) throw new Error(`Unknown conversion factor "${id}"`);
  return f;
}

/** Round to 2 significant figures for big numbers so equivalents never look falsely precise. */
export function friendlyRound(n: number): number {
  if (n === 0) return 0;
  const abs = Math.abs(n);
  if (abs < 10) return Math.round(n * 10) / 10;
  const mag = 10 ** (Math.floor(Math.log10(abs)) - 1);
  return Math.round(n / mag) * mag;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n);
}

export function toEquivalent(tCO2e: number, factorId: string): Equivalent {
  const factor = getFactor(factorId);
  const units = (tCO2e * 1000) / factor.kgCO2ePerUnit;
  const rounded = friendlyRound(units);
  return {
    factor,
    units,
    display: formatCount(rounded),
    label: rounded === 1 ? factor.singular : factor.label,
  };
}

/** Equivalents for fans, in a stable order that leads with the F1-native ones. */
export function fanEquivalents(tCO2e: number, ids = ["silverstone-lap", "lon-nyc-return", "car-year", "tree-year"]): Equivalent[] {
  return ids.map((id) => toEquivalent(tCO2e, id));
}

export type TripOption = {
  mode: TravelMode;
  kgCO2e: number;
  /** Saving vs driving alone, in kg. */
  savingVsCarKg: number;
};

/** Compare getting to the circuit by each mode for a given one-way distance. */
export function compareTrips(distanceKm: number, returnTrip = true): TripOption[] {
  const km = returnTrip ? distanceKm * 2 : distanceKm;
  const car = travelModes.find((m) => m.id === "car");
  const carKg = (car?.kgCO2ePerPassengerKm ?? 0) * km;
  return travelModes.map((mode) => {
    const kgCO2e = mode.kgCO2ePerPassengerKm * km;
    return { mode, kgCO2e, savingVsCarKg: carKg - kgCO2e };
  });
}
