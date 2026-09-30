/**
 * "This race week": what a partner comms team needs on a Monday before the
 * next Grand Prix. Published facts that relate to the race, the joint
 * Cognizant facts, post angles, the gaps to avoid and what changed in the
 * fact base since the last report.
 *
 * Per-round estimates (`est-*-per-round`) are the season total divided
 * evenly across the calendar. They are never shown as a figure for the race
 * (see DESIGN.md, stakeholder guardrails), so they are excluded here.
 */
import { HERO_RACE_ID } from "@/lib/config";
import { facts, factsWithTag, getRace, initiatives } from "@/lib/data/load";
import type { Fact, Initiative, Race } from "@/lib/data/schemas";

export const JOINT_PARTNER_TAG = "partner:cognizant";

const isPerRound = (id: string) => /^est-.*-per-round$/.test(id);
const isCalendar = (id: string) => id.startsWith("f1-");

export function raceWeekRace(): Race {
  return getRace(HERO_RACE_ID);
}

/** Programmes the reports tie to the race's city. */
export function raceInitiatives(race: Race = raceWeekRace()): Initiative[] {
  return initiatives.filter((i) => i.status === "verified" && (i.cityIds.includes(race.cityId) || i.raceIds.includes(race.id)));
}

/** Published facts about the race's city and its programmes, without calendar facts or even-split estimates. */
export function raceFacts(race: Race = raceWeekRace()): Fact[] {
  const ids = new Set<string>([
    ...race.factIds,
    ...factsWithTag(race.cityId).map((f) => f.id),
    ...raceInitiatives(race).flatMap((i) => i.factIds),
  ]);
  return facts.filter((f) => ids.has(f.id) && !isPerRound(f.id) && !isCalendar(f.id) && f.status !== "simulated");
}

/** Joint Cognizant x Aston Martin Aramco activity, numbers first. */
export function jointCognizantFacts(): Fact[] {
  const joint = factsWithTag(JOINT_PARTNER_TAG).filter((f) => f.status !== "simulated");
  return [...joint.filter((f) => f.value !== null), ...joint.filter((f) => f.value === null)];
}

/** Facts added in the most recent extraction pass: what is new since the desk last looked. */
export function newestFacts(): { date: string; facts: Fact[] } {
  const date = facts.reduce((max, f) => (f.extractedAt > max ? f.extractedAt : max), "");
  return { date, facts: facts.filter((f) => f.extractedAt === date) };
}

/** Figures the latest report restated, which must not be compared across years. */
export function restatedFacts(): Fact[] {
  return facts.filter((f) => f.flags.some((flag) => flag.kind === "restated"));
}

export type PostAngle = {
  id: string;
  title: string;
  why: string;
  factIds: string[];
  /** Where to draft it. */
  href: string;
  action: string;
};

/**
 * Post angles for the week. Words only: the figures come from the facts
 * listed with each angle and are rendered with their status and source.
 */
export const POST_ANGLES: PostAngle[] = [
  {
    id: "stem-at-race-locations",
    title: "STEM learning at race locations, including Singapore",
    why: "The team's STEM programme reaches race locations including Singapore, and Cognizant adds online STEM learning to it.",
    factIds: ["m-stem-programme-reach", "m-cognizant-online-stem", "c24-trackside-stem-singapore"],
    href: "/partners/narratives?format=linkedin-post&focus=community",
    action: "Draft a LinkedIn post",
  },
  {
    id: "ai-skills-gap",
    title: "Why AI careers need explaining early",
    why: "Cognizant ran the future-careers sessions at Make A Mark Day, where most students started unsure about AI skills.",
    factIds: ["c25-ai-skills-gap", "c25-mam-day-students", "c25-mam-day-cognizant"],
    href: "/partners/narratives?format=linkedin-post&focus=community",
    action: "Draft a LinkedIn post",
  },
  {
    id: "stem-racing-singapore",
    title: "Singapore hosted the STEM Racing World Finals",
    why: "A local angle for the race week, told in STEM Racing's voice with its own co-branded card.",
    factIds: ["c25-stem-racing-singapore", "c25-stem-racing-students", "c25-stem-racing-countries"],
    href: "/partners/story-kit?initiative=stem-racing-world-finals",
    action: "Open the story kit",
  },
  {
    id: "progress-against-target",
    title: "Progress against target, in the report's own terms",
    why: "Use the report's progress figures rather than comparing yearly totals, which were restated.",
    factIds: ["e25-progress-scope12", "e25-progress-scope3"],
    href: "/partners/narratives?format=leadership-update&focus=all",
    action: "Draft a leadership update",
  },
];

/** What the team has not published for this race. Words only, never a number. */
export const RACE_DATA_GAPS: { title: string; body: string }[] = [
  {
    title: "Trackside energy at Marina Bay",
    body: "The team publishes trackside energy for European races only. There is no figure for the Singapore night race.",
  },
  {
    title: "Emissions for this race weekend",
    body: "The report gives season totals, not per-race emissions. Don't divide a season total and call it Singapore.",
  },
  {
    title: "Reach of Cognizant's online STEM learning",
    body: "The Manifesto describes the online learning but publishes no reach figure for it on its own.",
  },
  {
    title: "Gen-AI Ideathon participation",
    body: "The report names the winners but not how many students or teams took part.",
  },
];
