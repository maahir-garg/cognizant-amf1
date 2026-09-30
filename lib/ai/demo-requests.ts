/**
 * Enumerates every AI request the offline demo can hit: every persona x
 * pillar, every quiz visible to that persona (both outcomes), every
 * persona's share caption, every partner narrative format (all pillars and
 * community only), the default scenario, every verified non-Cognizant
 * initiative's story kit (every format).
 *
 * Shared by scripts/warm-cache.ts (which sends these through the live
 * pipeline when a key is configured) and tests/unit/ai-templates.test.ts
 * (which checks every one of these against the guardrail via the
 * deterministic templates, with no network involved).
 */
import { HERO_RACE_ID } from "@/lib/config";
import { initiatives, quizzes } from "@/lib/data/load";
import { PILLARS, type AiRequest } from "@/lib/data/schemas";
import { runScenario, SCENARIO_DEFAULTS, scenarioDerivedValues } from "@/lib/data/scenario";
import {
  DEFAULT_SHARE_FACT_IDS,
  DEMO_PERSONAS,
  NARRATIVE_FORMATS,
  STORY_KIT_FORMATS,
  fanStoryRequest,
  narrativeRequest,
  quizRevealRequest,
  scenarioExplanationRequest,
  shareCaptionRequest,
  storyKitRequest,
} from "./requests";

export function enumerateDemoRequests(): AiRequest[] {
  const reqs: AiRequest[] = [];

  for (const persona of DEMO_PERSONAS) {
    for (const pillar of PILLARS) reqs.push(fanStoryRequest(persona, pillar));

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

  for (const initiative of initiatives) {
    if (initiative.status !== "verified" || initiative.partners.includes("Cognizant")) continue;
    for (const format of STORY_KIT_FORMATS) reqs.push(storyKitRequest(initiative.id, format));
  }

  return reqs;
}
