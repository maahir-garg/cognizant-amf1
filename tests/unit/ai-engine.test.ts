import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AiRequest, FanProfile } from "@/lib/data/schemas";

vi.mock("@/lib/ai/provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/provider")>();
  return { ...actual, getProvider: vi.fn() };
});

import { getFact } from "@/lib/data/load";
import { fanStoryRequest } from "@/lib/ai/requests";
import { cacheKey, runGeneration } from "@/lib/ai/engine";
import { getProvider, type ModelProvider } from "@/lib/ai/provider";
import { formatFact } from "@/lib/format";

const mockedGetProvider = vi.mocked(getProvider);
const fan: FanProfile = { level: "new", cityId: "singapore", interests: ["environment", "stem"] };

function fakeProvider(...responses: string[]): ModelProvider {
  const generate = vi.fn();
  for (const r of responses) generate.mockResolvedValueOnce(r);
  return { id: "fake:test-model", generate };
}

describe("runGeneration", () => {
  const originalDemoMode = process.env.DEMO_MODE;
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    mockedGetProvider.mockReset();
  });

  afterEach(() => {
    if (originalDemoMode === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = originalDemoMode;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  it("stays offline in demo mode even when a provider is available", async () => {
    delete process.env.DEMO_MODE; // default: demo mode on
    process.env.GEMINI_API_KEY = "test-key";
    const fake = fakeProvider("should never be used");
    mockedGetProvider.mockReturnValue(fake);

    const req = fanStoryRequest(fan, "environment");
    const res = await runGeneration(req);

    expect(fake.generate).not.toHaveBeenCalled();
    expect(res.generator.kind).toBe("template");
    expect(res.guardrail.passed).toBe(true);
  });

  it("falls back to the template when the model invents a number on both attempts", async () => {
    process.env.DEMO_MODE = "false";
    process.env.GEMINI_API_KEY = "test-key";
    const fake = fakeProvider(
      "Emissions fell by 9,999 tonnes this year, a huge win.",
      "Still 9,999 tonnes, definitely not a real cited figure.",
    );
    mockedGetProvider.mockReturnValue(fake);

    const req = fanStoryRequest(fan, "environment");
    const res = await runGeneration(req);

    expect(fake.generate).toHaveBeenCalledTimes(2);
    expect(res.generator.kind).toBe("template");
    expect(res.attempts).toBe(2);
    expect(res.guardrail.passed).toBe(true);
  });

  it("uses the model's text once it passes the guardrail", async () => {
    process.env.DEMO_MODE = "false";
    process.env.GEMINI_API_KEY = "test-key";
    const req = fanStoryRequest(fan, "environment");
    const facts = req.factIds.map(getFact);
    const goodText = `Here's a genuinely grounded line: ${formatFact(facts[0])} [F:${facts[0].id}].`;
    const fake = fakeProvider(goodText);
    mockedGetProvider.mockReturnValue(fake);

    const res = await runGeneration(req);

    expect(fake.generate).toHaveBeenCalledTimes(1);
    expect(res.generator.kind).toBe("model");
    expect(res.generator.model).toBe("fake:test-model");
    expect(res.attempts).toBe(1);
    expect(res.text).toBe(goodText);
    expect(res.guardrail.passed).toBe(true);
  });

  it("retries once on failure and accepts a corrected second attempt", async () => {
    process.env.DEMO_MODE = "false";
    process.env.GEMINI_API_KEY = "test-key";
    const req = fanStoryRequest(fan, "environment");
    const facts = req.factIds.map(getFact);
    const goodText = `Second time's the charm: ${formatFact(facts[0])} [F:${facts[0].id}].`;
    const fake = fakeProvider("Invented 9,999 tonnes with no citation at all.", goodText);
    mockedGetProvider.mockReturnValue(fake);

    const res = await runGeneration(req);

    expect(fake.generate).toHaveBeenCalledTimes(2);
    expect(res.generator.kind).toBe("model");
    expect(res.attempts).toBe(2);
    expect(res.text).toBe(goodText);
  });

  it("falls back to the template when the provider throws", async () => {
    process.env.DEMO_MODE = "false";
    process.env.GEMINI_API_KEY = "test-key";
    const generate = vi.fn().mockRejectedValue(new Error("network down"));
    mockedGetProvider.mockReturnValue({ id: "fake:test-model", generate });

    const req = fanStoryRequest(fan, "environment");
    const res = await runGeneration(req);

    expect(res.generator.kind).toBe("template");
    expect(res.guardrail.passed).toBe(true);
  });
});

describe("cacheKey", () => {
  it("is stable regardless of interest order", () => {
    const base: AiRequest = {
      task: "fan-story",
      factIds: ["e25-saf-avoided"],
      derived: [],
      fan: { level: "new", cityId: "singapore", interests: ["environment", "stem"] },
      params: { pillar: "environment" },
    };
    const reordered: AiRequest = { ...base, fan: { ...base.fan!, interests: ["stem", "environment"] } };
    expect(cacheKey(base)).toBe(cacheKey(reordered));
  });

  it("is stable regardless of factIds or params order", () => {
    const a: AiRequest = { task: "story-kit", factIds: ["a", "b"], derived: [], params: { format: "post", initiative: "x" } };
    const b: AiRequest = { task: "story-kit", factIds: ["b", "a"], derived: [], params: { initiative: "x", format: "post" } };
    expect(cacheKey(a)).toBe(cacheKey(b));
  });

  it("differs when the task or facts differ", () => {
    const a: AiRequest = { task: "story-kit", factIds: ["a"], derived: [], params: { format: "post" } };
    const b: AiRequest = { task: "story-kit", factIds: ["b"], derived: [], params: { format: "post" } };
    expect(cacheKey(a)).not.toBe(cacheKey(b));
  });
});
