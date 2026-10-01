/**
 * What the race page knows about a Grand Prix weekend, from data only:
 * dates, the programmes the team has reported there, whether trackside
 * energy is published, and when the sources were last checked.
 */
import { findFact, getCity, initiatives, races, sources } from "@/lib/data/load";
import type { Initiative, Race } from "@/lib/data/schemas";
import { formatDate } from "@/lib/format";
import { EUROPEAN_TRACKSIDE_RACE_IDS } from "./trackside";

/** Online programmes open to fans anywhere, shown on every upcoming race page. */
const ONLINE_PROGRAMME_IDS = ["unearth-your-greatness"];

/** "Singapore Grand Prix 2026" -> "Singapore Grand Prix". */
export function raceTitle(race: Race): string {
  return race.name.replace(/\s20\d{2}$/, "");
}

/** "Singapore Grand Prix" -> "Singapore"; "British Grand Prix" -> "British". */
export function raceShortName(race: Race): string {
  return raceTitle(race).replace(/\s+Grand Prix$/, "");
}

/** "9 to 11 Oct 2026", or the season alone when the calendar dates aren't recorded. */
export function raceDates(race: Race): string {
  if (!race.start) return `${race.season} season`;
  if (!race.end || race.end === race.start) return formatDate(race.start);
  const [start, end] = [new Date(`${race.start}T00:00:00Z`), new Date(`${race.end}T00:00:00Z`)];
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return fmt.formatRange(start, end).replace(/\s?[–-]\s?/, " to ");
}

/**
 * Upcoming means the hero race or a race that hasn't finished yet. Only
 * upcoming races get the trip planner and quick check; past rounds are
 * a record of what the team published.
 */
export function isUpcoming(race: Race, today = new Date()): boolean {
  if (race.hero) return true;
  if (!race.end) return false;
  return new Date(`${race.end}T23:59:59Z`) >= today;
}

export function hasTrackside(race: Race): boolean {
  return EUROPEAN_TRACKSIDE_RACE_IDS.includes(race.id);
}

/** A round-number fact for this race, if the calendar is in the fact base (e.g. f1-sg-2026-round). */
export function roundFactId(race: Race): string | null {
  return race.factIds.find((id) => id.endsWith("-round") && findFact(id)) ?? null;
}

export type Programme = { initiative: Initiative; where: "race" | "city" | "online" };

/**
 * Verified programmes tied to this race weekend, its city, or open online.
 * Programmes reported at the same city in another season still count: the
 * page says which year each one ran.
 */
export function raceProgrammes(race: Race): Programme[] {
  // Environment initiatives (paddock power, SAF, removals) are the team's operations, not something a fan can join.
  const verified = initiatives.filter((i) => i.status === "verified" && i.pillar !== "environment");
  const seen = new Set<string>();
  const out: Programme[] = [];
  const push = (initiative: Initiative, where: Programme["where"]) => {
    if (seen.has(initiative.id)) return;
    seen.add(initiative.id);
    out.push({ initiative, where });
  };
  for (const i of verified) if (i.raceIds.includes(race.id)) push(i, "race");
  for (const i of verified) if (i.cityIds.includes(race.cityId)) push(i, "city");
  if (isUpcoming(race)) for (const id of ONLINE_PROGRAMME_IDS) {
    const i = verified.find((x) => x.id === id);
    if (i) push(i, "online");
  }
  return out;
}

/**
 * Routes into F1 engineering through programmes the team reports, youngest
 * first. "how" paraphrases the programme's own summary and report page;
 * it never promises dates, places or eligibility the report doesn't give.
 */
export const WAYS_IN: { initiativeId: string; who: string; how: string }[] = [
  {
    initiativeId: "stem-racing-world-finals",
    who: "At school",
    how: "STEM Racing is the schools engineering competition the team supports. Ask your school whether it takes part.",
  },
  {
    initiativeId: "unearth-your-greatness",
    who: "Anyone, online",
    how: "The team's programme with Maaden runs on a free online learning platform, STEM Racing Learn, open to students around the world.",
  },
  {
    initiativeId: "aspiring-mechanics",
    who: "Want to be a mechanic",
    how: "Hands-on motorsport training with Valvoline for young people from under-represented backgrounds who want to work on the cars.",
  },
  {
    initiativeId: "aleto-leadership",
    who: "At university",
    how: "A nine-month mentoring programme with the Aleto Foundation, pairing students from under-represented backgrounds with team members.",
  },
  {
    initiativeId: "genai-ideathon",
    who: "At university, into tech",
    how: "Cognizant's Gen-AI Ideathon with the team sets university students real team problems to solve.",
  },
];

export function raceCityName(race: Race): string {
  return getCity(race.cityId)?.name ?? race.country;
}

/**
 * The team's own publications (reports, Manifesto, website), newest check
 * first, for the "Updated when the team publishes" line.
 */
export function latestTeamSource() {
  const team = sources.filter((s) => s.publisher.startsWith("Aston Martin Aramco") && s.kind === "pdf");
  const latest = [...team].sort((a, b) => (b.published ?? "").localeCompare(a.published ?? "") || b.retrieved.localeCompare(a.retrieved))[0];
  return { source: latest, checked: formatDate(latest.retrieved) };
}

/** Every race page, hero first, then newest season first. */
export function orderedRaces(): Race[] {
  return [...races].sort(
    (a, b) => Number(b.hero) - Number(a.hero) || b.season - a.season || (a.start ?? "").localeCompare(b.start ?? "") || a.name.localeCompare(b.name),
  );
}

