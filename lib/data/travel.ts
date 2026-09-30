/**
 * Travel-mode arithmetic for the race-page trip planner. Every factor comes
 * from data/travel-modes.json (DEFRA proxy factors, labelled Estimated in
 * the UI); nothing here turns a fan's trip into laps or any other
 * equivalence the report doesn't print itself.
 */
import { travelModes } from "./load";
import type { TravelMode } from "./schemas";

export function getTravelMode(id: string): TravelMode {
  const m = travelModes.find((t) => t.id === id);
  if (!m) throw new Error(`Unknown travel mode "${id}"`);
  return m;
}

/** kg CO2e for one passenger covering `distanceKm` one way, doubled for a return trip. */
export function tripKg(modeId: string, distanceKm: number, returnTrip = true): number {
  return getTravelMode(modeId).kgCO2ePerPassengerKm * distanceKm * (returnTrip ? 2 : 1);
}

/**
 * How one mode compares with another for the same distance, per passenger.
 * `ratio` is baseline / mode, so 5 means the mode emits a fifth of the
 * baseline; it does not depend on distance. Infinity when the mode emits nothing.
 */
export function modeRatio(modeId: string, baselineId: string): number {
  const mode = getTravelMode(modeId).kgCO2ePerPassengerKm;
  const base = getTravelMode(baselineId).kgCO2ePerPassengerKm;
  return mode === 0 ? Infinity : base / mode;
}
