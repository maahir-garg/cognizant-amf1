import { describe, expect, it } from "vitest";
import { enumerateDemoRequests } from "@/lib/ai/demo-requests";
import { parseCitations } from "@/lib/ai/guardrail";
import { buildPrompt } from "@/lib/ai/prompts";
import { fanChapterRequest, scenarioExplanationRequest } from "@/lib/ai/requests";
import { renderTemplate } from "@/lib/ai/templates";
import { getFact } from "@/lib/data/load";
import { runScenario, SCENARIO_DEFAULTS, scenarioDerivedValues } from "@/lib/data/scenario";
import type { AiRequest, FanProfile } from "@/lib/data/schemas";

const fan: FanProfile = { level: "new", cityId: "singapore", interests: ["environment", "stem"] };
const promptFor = (req: AiRequest) => buildPrompt(req, req.factIds.map(getFact));

describe("buildPrompt", () => {
  it("cites exactly the supplied fact ids, nothing more and nothing less", () => {
    const req = fanChapterRequest(fan, "supply-chain");
    const { prompt } = promptFor(req);
    expect(parseCitations(prompt).sort()).toEqual([...new Set(req.factIds)].sort());
  });

  it("includes derived value ids alongside fact ids for scenario-explanation", () => {
    const outputs = runScenario(SCENARIO_DEFAULTS);
    const derived = scenarioDerivedValues(outputs);
    const factIds = [...new Set(outputs.flatMap((o) => o.factIds))];
    const req = scenarioExplanationRequest(derived, factIds);
    const { prompt } = promptFor(req);
    const cited = new Set(parseCitations(prompt));
    expect(cited).toEqual(new Set([...req.factIds, ...derived.map((d) => d.id)]));
  });

  it("feeds guardrail retry reasons back into the prompt", () => {
    const req = fanChapterRequest(fan, "supply-chain");
    const facts = req.factIds.map(getFact);
    const { prompt: firstAttempt } = buildPrompt(req, facts);
    const { prompt: retryAttempt } = buildPrompt(req, facts, ['"9,999" does not match any cited fact or calculation']);
    expect(firstAttempt).not.toContain("9,999");
    expect(retryAttempt).toContain("9,999");
    expect(retryAttempt).toContain("previous attempt failed");
  });

  it("gives the reading depth but never the fan's city or interests", () => {
    const req = fanChapterRequest({ level: "new", cityId: "kuala-lumpur", interests: ["inclusion"] }, "campus");
    const { prompt } = promptFor(req);
    expect(prompt).toContain("new to F1");
    expect(prompt).not.toMatch(/Kuala Lumpur|kuala-lumpur/);
    expect(prompt).not.toMatch(/interested in/i);
  });
});

describe("house style rules in the system prompt", () => {
  const { system } = promptFor(fanChapterRequest(fan, "campus"));

  it("bans addressing the reader by persona or restating who they are", () => {
    expect(system).toMatch(/Never address the reader by who they are/);
    expect(system).toContain('"As a new fan"');
    expect(system).toMatch(/do not mention their level, city or interests/);
  });

  it("keeps the team in the third person", () => {
    expect(system).toMatch(/third person as "the team" or "Aston Martin Aramco"/);
    expect(system).toMatch(/Never write "we", "our" or "us"/);
  });

  it("puts a fall in words instead of a signed percentage after \"by\"", () => {
    expect(system).toContain('"cut by 74%"');
    expect(system).toContain('never "by -74%"');
  });

  it("bans hype words", () => {
    for (const w of ["massive", "huge", "incredible", "journey", "unlock", "empower"]) expect(system).toContain(w);
  });

  it("asks for British English, short sentences and lower case after a colon", () => {
    expect(system).toMatch(/British English/);
    expect(system).toMatch(/short plain sentences/);
    expect(system).toMatch(/After a colon, carry on in lower case/);
  });

  it("caps fan chapter text at three sentences at either depth", () => {
    for (const level of ["new", "die-hard"] as const) {
      const { system: s } = promptFor(fanChapterRequest({ ...fan, level }, "moving"));
      expect(s).toMatch(/Write 2(-3)? sentences/);
      expect(s).toContain("Never more than 3 sentences");
    }
  });
});

/* ------------------------------------------------ template output style */

const HYPE = /\b(massive|huge|incredible|amazing|journey|unlock|empower\w*|revolutionis\w*|seamless|game-changing)\b/i;
/** Names that may follow a colon with a capital. */
const NAME_AFTER_COLON = /^(Cognizant|Aston Martin|Make A Mark|STEM|Maaden|Unearth|Formula|F1|Singapore|Silverstone|Aleto|AFBE|Racing Pride|Accelerate|Sustainable Aviation Fuel|I\b)/;

const requests = enumerateDemoRequests();
const rendered = requests.map((req) => ({ req, text: renderTemplate(req, req.factIds.map(getFact)) }));

function label(req: AiRequest): string {
  return `${req.task} ${req.fan?.level ?? ""} ${JSON.stringify(req.params)}`;
}

describe("template output follows the house style", () => {
  it.each(rendered.map((r) => [label(r.req), r] as const))("%s", (_label, { req, text }) => {
    const prose = text.replace(/\s*\[(F|D):[a-z0-9-]+\]/g, "");
    // The charity's own post speaks as "we" (the charity); everything else keeps the team in the third person.
    const charityVoice = req.task === "story-kit" && req.params.format === "post";
    if (!charityVoice) expect(prose, prose).not.toMatch(/\bwe\b|\bour\b|\bwe've\b|\bwe're\b/i);
    expect(prose, prose).not.toMatch(/by -\d|by −\d/);
    expect(prose, prose).not.toMatch(/As a (new|long-time)? ?fan/i);
    expect(prose, prose).not.toMatch(/Because you follow/i);
    expect(prose, prose).not.toMatch(HYPE);
    // A capital straight after a mid-sentence colon, unless it starts a name ("brief: Cognizant ×").
    for (const m of prose.matchAll(/[a-z]: (?=[A-Z])/g)) {
      const rest = prose.slice((m.index ?? 0) + m[0].length);
      expect(NAME_AFTER_COLON.test(rest), `"${rest.slice(0, 30)}" after a colon in: ${prose}`).toBe(true);
    }
  });

  it("never hands the pay gap, the workforce split or a disputed figure to generated copy", () => {
    // The scenario's inputs are the desk's own model (flags shown beside it); its text cites only derived values.
    for (const { req } of rendered.filter((r) => r.req.task !== "scenario-explanation")) {
      for (const id of req.factIds) {
        expect(["b25-pay-gap-median", "b25-pay-gap-mean", "b25-women-share"], label(req)).not.toContain(id);
        expect(getFact(id).flags.some((f) => f.kind === "source-conflict"), `${id} in ${label(req)}`).toBe(false);
      }
    }
  });

  it("keeps fan chapter text to a few sentences", () => {
    for (const { req, text } of rendered.filter((r) => r.req.task === "fan-story")) {
      const sentences = text.replace(/\s*\[(F|D):[a-z0-9-]+\]/g, "").match(/[.!?](?=\s|$)/g)?.length ?? 0;
      expect(sentences, text).toBeLessThanOrEqual(req.fan?.level === "die-hard" ? 6 : 4);
    }
  });
});
