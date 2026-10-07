/**
 * The fan's optional "Nearest race". It is stored as the profile's city (the
 * race's own city), and a city resolves to a race page through its
 * `homeRaceId` in data/cities.json. Only races that already have a page are
 * offered: Singapore is the one 2026 round in the fact base, and every other
 * page is a past round, labelled as such.
 */
import { getCity, getRace, heroRace, races } from "@/lib/data/load";
import type { FanProfile, Race } from "@/lib/data/schemas";
import { isUpcoming, orderedRaces, raceTitle } from "./race";
import { DEFAULT_FAN } from "./quiz";

/**
 * One option per race city: a race is offered when it is its own city's home
 * race, so Singapore 2025 (superseded by 2026), Imola (Milan's home race is
 * Monza) and the 2024 Spanish round drop out rather than appearing twice.
 */
export function nearestRaceOptions(): Race[] {
  return orderedRaces().filter((r) => getCity(r.cityId)?.homeRaceId === r.id);
}

/** The race page for a stored city; Singapore when nothing (or something unknown) is stored. */
export function nearestRaceFor(cityId: string | null | undefined): Race {
  const id = cityId ? getCity(cityId)?.homeRaceId : undefined;
  return races.find((r) => r.id === id) ?? heroRace;
}

/** The profile with a new nearest race, keeping the fan's depth and interests. */
export function withNearestRace(profile: FanProfile | null, raceId: string): FanProfile {
  return { ...(profile ?? DEFAULT_FAN), cityId: getRace(raceId).cityId };
}

/** "British Grand Prix · past race, 2025" / "Singapore Grand Prix · 2026". */
export function nearestRaceLabel(race: Race): string {
  return isUpcoming(race) ? `${raceTitle(race)} · ${race.season}` : `${raceTitle(race)} · past race, ${race.season}`;
}
