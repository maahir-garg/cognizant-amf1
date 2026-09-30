/**
 * Enumerates every AI request the offline demo can hit: every story chapter
 * at both depths, every quiz reveal a depth can show (both outcomes), the
 * default share caption, every partner narrative format (all pillars and
 * community only), the default scenario, and every story-kit initiative in
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
import { STORY_KIT_INITIATIVE_IDS } from "@/lib/partner/story-kit";
import {
  CHAPTER_IDS,
  DEFAULT_SHARE_FACT_IDS,
  DEMO_PERSONAS,
  NARRATIVE_FORMATS,
  STORY_KIT_FORMATS,
  fanChapterRequest,
  narrativeRequest,
  quizRevealRequest,
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

  for (const format of NARRATIVE_FORMATS) {
    reqs.push(narrativeRequest(format, { partnerId: "cognizant", pillars: [...PILLARS] }));
    reqs.push(narrativeRequest(format, { partnerId: "cognizant", pillars: ["community"] }));
  }

  const scenarioOutputs = runScenario(SCENARIO_DEFAULTS);
  const scenarioFactIds = [...new Set(scenarioOutputs.flatMap((o) => o.factIds))];
  reqs.push(scenarioExplanationRequest(scenarioDerivedValues(scenarioOutputs), scenarioFactIds));

  for (const id of STORY_KIT_INITIATIVE_IDS) {
    for (const format of STORY_KIT_FORMATS) reqs.push(storyKitRequest(id, format));
  }

  return reqs;
}
