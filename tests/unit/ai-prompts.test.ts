import { describe, expect, it } from "vitest";
import { parseCitations } from "@/lib/ai/guardrail";
import { buildPrompt } from "@/lib/ai/prompts";
import { getFact } from "@/lib/data/load";
import { runScenario, SCENARIO_DEFAULTS, scenarioDerivedValues } from "@/lib/data/scenario";
import type { FanProfile } from "@/lib/data/schemas";
import { fanStoryRequest, scenarioExplanationRequest } from "@/lib/ai/requests";

const fan: FanProfile = { level: "new", cityId: "singapore", interests: ["environment", "stem"] };

describe("buildPrompt", () => {
  it("cites exactly the supplied fact ids, nothing more and nothing less", () => {
    const req = fanStoryRequest(fan, "environment");
    const facts = req.factIds.map(getFact);
    const { prompt } = buildPrompt(req, facts);
    expect(parseCitations(prompt).sort()).toEqual([...new Set(req.factIds)].sort());
  });

  it("includes derived value ids alongside fact ids for scenario-explanation", () => {
    const outputs = runScenario(SCENARIO_DEFAULTS);
    const derived = scenarioDerivedValues(outputs);
    const factIds = [...new Set(outputs.flatMap((o) => o.factIds))];
    const req = scenarioExplanationRequest(derived, factIds);
    const facts = req.factIds.map(getFact);
    const { prompt } = buildPrompt(req, facts);
    const cited = new Set(parseCitations(prompt));
    expect(cited).toEqual(new Set([...req.factIds, ...derived.map((d) => d.id)]));
  });

  it("feeds guardrail retry reasons back into the prompt", () => {
    const req = fanStoryRequest(fan, "environment");
    const facts = req.factIds.map(getFact);
    const { prompt: firstAttempt } = buildPrompt(req, facts);
    const { prompt: retryAttempt } = buildPrompt(req, facts, ['"9,999" does not match any cited fact or calculation']);
    expect(firstAttempt).not.toContain("9,999");
    expect(retryAttempt).toContain("9,999");
    expect(retryAttempt).toContain("previous attempt failed");
  });

  it("names the fan's level, city and interests in the prompt", () => {
    const req = fanStoryRequest(fan, "environment");
    const facts = req.factIds.map(getFact);
    const { prompt } = buildPrompt(req, facts);
    expect(prompt).toContain("new");
    expect(prompt).toContain("environment");
  });
});
