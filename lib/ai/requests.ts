/**
 * Request builders for every AI task. The fan and partner UIs and
 * scripts/warm-cache.ts all build requests through these functions, so the
 * cache keys used at demo time are exactly the ones that were warmed.
 *
 * Signatures are shared contract (lead-owned). The fact selection inside
 * each builder may be tuned by the AI workstream.
 */
import { facts, getFact, getRace, initiatives, isDisputed, quizzes } from "@/lib/data/load";
import type { AiRequest, DerivedValue, Fact, FanProfile, Pillar } from "@/lib/data/schemas";

type Built = AiRequest;

/**
 * Never handed to the model or a template: the pay gap and the workforce
 * split only make sense beside the report's own explanation (p55), which a
 * generated paragraph cannot guarantee to carry.
 */
export const NEVER_IN_AI_COPY = ["b25-pay-gap-median", "b25-pay-gap-mean", "b25-women-share"];

/** Facts generated copy may use at all: real, undisputed and not held back above. */
function usableInCopy(f: Fact): boolean {
  return f.status !== "simulated" && !isDisputed(f) && !NEVER_IN_AI_COPY.includes(f.id);
}

/* ------------------------------------------------------------------ fan */

/** The story's chapters at "/", in reading order (lib/story/chapters.ts holds the copy). */
export const CHAPTER_IDS = ["campus", "supply-chain", "moving", "circuit", "beyond", "finish"] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];

/**
 * Facts each chapter's "In plain words" / "The detail" paragraph may use, in
 * the order the template tells them. New fans get the first two. Deliberately
 * excluded: the pay gap and workforce share (never in AI personalisation),
 * per-round estimates, the derived renewable share, and the laps comparisons
 * (the story words those itself as the team's own comparison).
 */
export const FAN_CHAPTER_FACTS: Record<ChapterId, string[]> = {
  campus: ["e24-solar-panels", "e25-cups-removed", "e25-circularity", "e25-biodiversity-net-gain"],
  "supply-chain": ["e25-supply-chain-share", "e25-supply-chain", "e25-freight-logistics", "e25-hq-energy"],
  moving: ["e25-saf-avoided", "e25-saf-airfreight-cut", "e24-sea-freight-shift", "e25-travel-logistics-cut"],
  circuit: ["e25-event-energy-cut", "e25-trackside-gbr-hvo", "e25-trackside-gbr-grid", "e25-trackside-gbr-solar"],
  beyond: ["c25-stem-racing-students", "e25-ethiopia-children", "c25-maaden-target", "b25-accelerate-pairs"],
  finish: ["e25-progress-scope12", "e25-progress-scope3", "e25-target-scope3", "e25-target-netzero-year"],
};

/** The profile the story uses before a fan has chosen anything (matches lib/fan/quiz.ts DEFAULT_FAN). */
export const STORY_DEFAULT_FAN: FanProfile = { level: "new", cityId: "singapore", interests: ["environment", "stem"] };

/**
 * One chapter's generated paragraph. The story has two depths, so any level
 * other than "die-hard" reads as "new".
 */
export function fanChapterRequest(fan: FanProfile | null, chapterId: ChapterId): Built {
  const base = fan ?? STORY_DEFAULT_FAN;
  const level = base.level === "die-hard" ? "die-hard" : "new";
  const ids = FAN_CHAPTER_FACTS[chapterId];
  return {
    task: "fan-story",
    factIds: level === "new" ? ids.slice(0, 2) : [...ids],
    derived: [],
    fan: { ...base, level },
    params: { chapter: chapterId },
  };
}

/** One-line personalised reveal after a quiz answer. */
export function quizRevealRequest(fan: FanProfile, quizId: string, correct: boolean): Built {
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) throw new Error(`Unknown quiz "${quizId}"`);
  return { task: "quiz-reveal", factIds: [quiz.factId], derived: [], fan, params: { quizId, correct } };
}

/** Caption for the 9:16 share card. `factIds` are the figures printed on the card. */
export function shareCaptionRequest(fan: FanProfile, factIds: string[], raceId: string): Built {
  return { task: "share-caption", factIds, derived: [], fan, params: { raceId } };
}

/**
 * Default figures printed on the fan share card / used by the warm-cache
 * script. Verified and unflagged only: never a per-round estimate or a
 * disputed total (lib/fan/share.ts holds the full curated list).
 */
export const DEFAULT_SHARE_FACT_IDS = ["e25-saf-airfreight-cut", "c25-stem-racing-students"];

/* -------------------------------------------------------------- partner */

export const NARRATIVE_FORMATS = ["linkedin-post", "quarterly-brief", "leadership-update"] as const;
export type NarrativeFormat = (typeof NARRATIVE_FORMATS)[number];

/**
 * Never handed to partner copy: figures the report only gives with its own
 * explanation (pay gap, women's share), even-split per-round estimates, the
 * derived renewable share, the estimate that duplicates the report's own
 * progress figure, and a removals comparison whose phrase overstates
 * permanence.
 */
export const PARTNER_EXCLUDED_FACT_IDS = new Set([
  "b25-pay-gap-median",
  "b25-pay-gap-mean",
  "b25-women-share",
  "b25-colleagues",
  "b25-hidden-disability",
  "est-rego-share",
  "est-freight-per-round",
  "est-travel-per-round",
  "est-saf-per-round",
  "est-scope12-change-vs-2023",
  "e25-removals-vs-scope12",
]);

/** Usable in partner copy: usable in any copy, and not excluded above, superseded or a data-quality record. */
export function partnerUsable(f: Fact): boolean {
  if (!usableInCopy(f) || PARTNER_EXCLUDED_FACT_IDS.has(f.id) || f.tags.includes("data-quality")) return false;
  if (f.flags.some((fl) => fl.kind === "inconsistent-equivalence")) return false;
  return !/as originally reported/i.test(f.metric);
}

/**
 * Facts a partner narrative may draw on, so that the pillar focus really
 * changes the draft: the partner's role, joint facts in the chosen pillars,
 * then each chosen pillar's own headline, partner and charity facts taken in
 * turn. Numbers before wording, verified before estimated.
 */
export function partnerNarrativeFactIds(partnerId: string, pillars: Pillar[], limit = 9): string[] {
  const tag = `partner:${partnerId}`;
  const rank = (f: Fact) => (f.tags.includes("hero") ? 0 : 2) + (f.value === null ? 1 : 0) + (f.status === "verified" ? 0 : 1);
  const role = facts.filter((f) => f.tags.includes(tag) && f.value === null && f.pillar === "governance" && partnerUsable(f));
  const joint = facts
    .filter((f) => f.tags.includes(tag) && pillars.includes(f.pillar) && !role.includes(f) && partnerUsable(f))
    .sort((a, b) => rank(a) - rank(b));
  const jointBudget = pillars.length === 1 && pillars[0] === "community" ? 5 : pillars.includes("community") ? 3 : 1;
  const chosen = [...role, ...joint.slice(0, jointBudget)];

  // Headline, partner and charity facts first; the pillar's other published figures after, so a
  // pillar with few headline facts (Governance) still fills a brief.
  const featured = (f: Fact) => f.tags.includes("hero") || f.tags.some((t) => t.startsWith("partner:") || t.startsWith("charity:"));
  const byPillar = pillars.map((p) =>
    facts
      .filter((f) => f.pillar === p && !chosen.includes(f) && partnerUsable(f))
      .sort((a, b) => Number(featured(b)) - Number(featured(a)) || rank(a) - rank(b)),
  );
  for (let i = 0; chosen.length < limit && byPillar.some((list) => i < list.length); i++) {
    for (const list of byPillar) if (list[i] && chosen.length < limit) chosen.push(list[i]);
  }
  return chosen.map((f) => f.id);
}

/**
 * Facts for a race-week post: the partner's role, then the programmes the
 * reports tie to the race's city, the partner's own programmes first, each
 * in the initiative's order so follow-on phrases stay next to their lead.
 * Calendar facts and even-split per-round estimates never qualify.
 */
export function raceWeekFactIds(partnerId: string, raceId: string): string[] {
  const race = getRace(raceId);
  const tag = `partner:${partnerId}`;
  const role = facts.filter((f) => f.tags.includes(tag) && f.topic === "partners" && partnerUsable(f)).map((f) => f.id);
  const local = initiatives
    .filter((i) => i.status === "verified" && (i.cityIds.includes(race.cityId) || i.raceIds.includes(race.id)))
    .sort((a, b) => Number(b.partners.includes("Cognizant")) - Number(a.partners.includes("Cognizant")));
  const ids = local.flatMap((i) => i.factIds).filter((id) => partnerUsable(getFact(id)) && !id.startsWith("f1-"));
  return [...new Set([...role, ...ids])];
}

/** A LinkedIn post for the partner about the coming race: only what the team has published about that place. */
export function raceWeekPostRequest(partnerId: string, raceId: string): Built {
  return { task: "linkedin-post", factIds: raceWeekFactIds(partnerId, raceId), derived: [], params: { partner: partnerId, race: raceId } };
}

export function narrativeRequest(format: NarrativeFormat, opts: { partnerId: string; pillars: Pillar[] }): Built {
  return {
    task: format,
    // A brief has sections to fill; posts and updates stay short.
    factIds: partnerNarrativeFactIds(opts.partnerId, opts.pillars, format === "quarterly-brief" ? 11 : 9),
    derived: [],
    params: { partner: opts.partnerId, pillars: [...opts.pillars].sort().join(",") },
  };
}

/** Plain-English explanation of a what-if scenario. Pass runScenario() outputs as derived values. */
export function scenarioExplanationRequest(derived: DerivedValue[], factIds: string[]): Built {
  return { task: "scenario-explanation", factIds: [...new Set(factIds)].sort(), derived, params: {} };
}

/**
 * The programmes the charity story kit covers, STEM Racing first: its World
 * Finals were in Singapore. Each has figures of its own about the people it
 * reached; programmes whose only figures describe the team's own staff are
 * left out, since a charity's post should not report on team employees.
 */
export const STORY_KIT_INITIATIVE_IDS = [
  "stem-racing-world-finals",
  "aleto-leadership",
  "afbe-transition",
  "racing-pride",
  "gp-trust-industry-day",
  "paddle-uk-seat",
] as const;

export const STORY_KIT_FORMATS = ["post", "funder"] as const;
export type StoryKitFormat = (typeof STORY_KIT_FORMATS)[number];

/**
 * An initiative's own facts for charity copy: the charity's own outcomes
 * (facts tagged `charity:*` that measure how participants felt) before its
 * headcounts, then everything else. Figures the reports print inconsistently
 * are left out, and nothing from outside the initiative is borrowed: a
 * programme with no usable figures of its own gets no story kit.
 */
export function storyKitFactIds(initiativeId: string): string[] {
  const initiative = initiatives.find((i) => i.id === initiativeId);
  if (!initiative) throw new Error(`Unknown initiative "${initiativeId}"`);
  const own = initiative.factIds.map(getFact).filter(partnerUsable);
  const rank = (f: Fact) => {
    const charity = f.tags.some((t) => t.startsWith("charity:"));
    return charity ? (f.unit === "%" ? 0 : 1) : 2;
  };
  return [...own].sort((a, b) => rank(a) - rank(b)).map((f) => f.id);
}

/** Impact copy for a community / charity partner, grounded in its initiative's facts. */
export function storyKitRequest(initiativeId: string, format: StoryKitFormat): Built {
  return { task: "story-kit", factIds: storyKitFactIds(initiativeId), derived: [], params: { initiative: initiativeId, format } };
}

/* ------------------------------------------------------- demo personas */

/**
 * Profiles the offline cache is warmed for. The product only ever sets the
 * reading depth (the story toggle and the quick check), so these are the
 * default fan at both depths.
 */
export const DEMO_PERSONAS: FanProfile[] = [STORY_DEFAULT_FAN, { ...STORY_DEFAULT_FAN, level: "die-hard" }];
