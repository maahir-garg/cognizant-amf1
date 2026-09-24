/**
 * Relevance engine: ranks initiatives for a fan profile. Deterministic, so the
 * same profile always sees the same matches and the AI only rewrites copy.
 *
 * Score = city match (4) + home-race match (3) + shared interests (2 each)
 *       + global programme (1) + verified bonus (1).
 */
import { getCity, initiatives } from "./load";
import type { FanProfile, Initiative } from "./schemas";

export type Match = {
  initiative: Initiative;
  score: number;
  reasons: string[];
};

export function matchInitiatives(profile: FanProfile, limit = 4): Match[] {
  const city = getCity(profile.cityId);
  const matches = initiatives.map((initiative) => {
    let score = 0;
    const reasons: string[] = [];
    if (initiative.cityIds.includes(profile.cityId)) {
      score += 4;
      reasons.push(`Happened in ${city?.name ?? "your city"}`);
    }
    if (city?.homeRaceId && initiative.raceIds.includes(city.homeRaceId)) {
      score += 3;
      reasons.push("Linked to your nearest Grand Prix");
    }
    const shared = initiative.interests.filter((i) => profile.interests.includes(i));
    if (shared.length) {
      score += shared.length * 2;
      reasons.push(`Matches your interest in ${shared.join(" and ")}`);
    }
    if (initiative.global) {
      score += 1;
      reasons.push("Runs across race locations");
    }
    if (initiative.status === "verified") score += 1;
    return { initiative, score, reasons };
  });

  return matches
    .filter((m) => m.score > 1)
    .sort((a, b) => b.score - a.score || a.initiative.name.localeCompare(b.initiative.name))
    .slice(0, limit);
}
