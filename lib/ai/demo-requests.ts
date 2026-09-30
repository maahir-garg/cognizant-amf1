/**
 * Enumerates every AI request the offline demo can hit: every story chapter
 * at both depths, every quiz reveal a depth can show (both outcomes), the
 * default share caption, every partner narrative format (all pillars and
 * each pillar alone), the race-week post, the default scenario, and every story-kit initiative in
 * every format.
 *
 * Shared by scripts/warm-cache.ts (which sends these through the live
 * pipeline when a key is configured) and tests/unit/ai-templates.test.ts
 * (which checks every one of these against the guardrail via the
 * deterministic templates, with no network involved).
 */
import { HERO_RACE_ID } from "@/lib/config";
import { quizzes } from "@/lib/data/load";
import { PILLARS, type AiRequest } from "@/lib/data/schemas";
import { runScenario, SCENARIO_DEFAULTS, scenarioDerivedValues } from "@/lib/data/scenario";
import {
  CHAPTER_IDS,
  DEFAULT_SHARE_FACT_IDS,
  DEMO_PERSONAS,
  NARRATIVE_FORMATS,
  STORY_KIT_FORMATS,
  STORY_KIT_INITIATIVE_IDS,
  fanChapterRequest,
  narrativeRequest,
  quizRevealRequest,
  raceWeekPostRequest,
  scenarioExplanationRequest,
  shareCaptionRequest,
  storyKitRequest,
} from "./requests";

export function enumerateDemoRequests(): AiRequest[] {
  const reqs: AiRequest[] = [];

  for (const persona of DEMO_PERSONAS) {
    for (const chapter of CHAPTER_IDS) reqs.push(fanChapterRequest(persona, chapter));

    for (const quiz of quizzes) {
      if (!quiz.levels.includes(persona.level)) continue;
      reqs.push(quizRevealRequest(persona, quiz.id, true));
      reqs.push(quizRevealRequest(persona, quiz.id, false));
    }

    reqs.push(shareCaptionRequest(persona, DEFAULT_SHARE_FACT_IDS, HERO_RACE_ID));
  }

  // Every format for all pillars and for each pillar on its own (the desk's focus chips).
  for (const format of NARRATIVE_FORMATS) {
    reqs.push(narrativeRequest(format, { partnerId: "cognizant", pillars: [...PILLARS] }));
    for (const pillar of PILLARS) reqs.push(narrativeRequest(format, { partnerId: "cognizant", pillars: [pillar] }));
  }
  reqs.push(raceWeekPostRequest("cognizant", HERO_RACE_ID));

  const scenarioOutputs = runScenario(SCENARIO_DEFAULTS);
  const scenarioFactIds = [...new Set(scenarioOutputs.flatMap((o) => o.factIds))];
  reqs.push(scenarioExplanationRequest(scenarioDerivedValues(scenarioOutputs), scenarioFactIds));

  for (const id of STORY_KIT_INITIATIVE_IDS) {
    for (const format of STORY_KIT_FORMATS) reqs.push(storyKitRequest(id, format));
  }

  return reqs;
}
