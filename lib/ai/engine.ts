/**
 * Server-side generation pipeline:
 *   request -> cache lookup -> (model | template) -> guardrail -> retry/fallback
 *
 * STUB: currently template-only. The AI-layer workstream adds the provider,
 * prompts and on-disk cache (see AGENTS.md, workstream "ai").
 */
import { createHash } from "node:crypto";
import { getFact } from "@/lib/data/load";
import type { AiRequest, AiResponse } from "@/lib/data/schemas";
import { checkText, parseCitations } from "./guardrail";
import { renderTemplate } from "./templates";

export function cacheKey(req: AiRequest): string {
  const stable = {
    task: req.task,
    factIds: [...req.factIds].sort(),
    derived: [...req.derived].sort((a, b) => a.id.localeCompare(b.id)).map((d) => [d.id, d.value]),
    fan: req.fan ? { level: req.fan.level, cityId: req.fan.cityId, interests: [...req.fan.interests].sort() } : null,
    params: Object.fromEntries(Object.entries(req.params).sort(([a], [b]) => a.localeCompare(b))),
  };
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex").slice(0, 16);
}

export async function runGeneration(req: AiRequest): Promise<AiResponse> {
  const facts = req.factIds.map(getFact);
  const text = renderTemplate(req, facts);
  const guardrail = checkText(text, { facts, derived: req.derived });
  return {
    task: req.task,
    text,
    citations: parseCitations(text),
    generator: { kind: "template" },
    guardrail,
    attempts: 1,
    cacheKey: cacheKey(req),
    cached: false,
    createdAt: new Date().toISOString(),
  };
}
