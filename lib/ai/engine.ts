/**
 * Server-side generation pipeline:
 *   request -> cache lookup (demo mode) -> provider (live mode) -> guardrail
 *   -> retry once with the guardrail's reasons -> grounded template fallback
 *
 * Never throws to the route: any failure (provider error, timeout, guardrail
 * failure twice) falls back to the deterministic template so the UI always
 * gets a valid, grounded AiResponse.
 */
import { createHash } from "node:crypto";
import { isDemoMode } from "@/lib/config";
import { getFact } from "@/lib/data/load";
import type { AiRequest, AiResponse, Fact } from "@/lib/data/schemas";
import { getCached } from "./cache";
import { checkText, parseCitations } from "./guardrail";
import { buildPrompt } from "./prompts";
import { getProvider, type ModelProvider } from "./provider";
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

function templateResponse(req: AiRequest, facts: Fact[], key: string, attempts: number): AiResponse {
  const text = renderTemplate(req, facts);
  const guardrail = checkText(text, { facts, derived: req.derived });
  return {
    task: req.task,
    text,
    citations: parseCitations(text),
    generator: { kind: "template" },
    guardrail,
    attempts,
    cacheKey: key,
    cached: false,
    createdAt: new Date().toISOString(),
  };
}

const MAX_ATTEMPTS = 2;

async function generateLive(req: AiRequest, facts: Fact[], key: string, provider: ModelProvider): Promise<AiResponse> {
  let retryReasons: string[] = [];
  let attempts = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attempts = attempt;
    try {
      const { system, prompt } = buildPrompt(req, facts, retryReasons);
      const text = await provider.generate({ system, prompt, temperature: 0.4 });
      const guardrail = checkText(text, { facts, derived: req.derived });
      if (guardrail.passed) {
        return {
          task: req.task,
          text,
          citations: parseCitations(text),
          generator: { kind: "model", model: provider.id },
          guardrail,
          attempts,
          cacheKey: key,
          cached: false,
          createdAt: new Date().toISOString(),
        };
      }
      retryReasons = guardrail.reasons;
    } catch (err) {
      retryReasons = [err instanceof Error ? err.message : String(err)];
    }
  }
  return templateResponse(req, facts, key, attempts);
}

export async function runGeneration(req: AiRequest): Promise<AiResponse> {
  const facts = req.factIds.map(getFact);
  const key = cacheKey(req);

  if (isDemoMode()) {
    const cached = getCached(key, req.task);
    if (cached) return { ...cached, cached: true };
    // Outside the warmed demo set (e.g. an ad-hoc request): compute the
    // template on the fly rather than fail. Never calls the network.
    return templateResponse(req, facts, key, 1);
  }

  const provider = getProvider();
  if (!provider) return templateResponse(req, facts, key, 1);

  try {
    return await generateLive(req, facts, key, provider);
  } catch {
    // Defensive: generateLive already falls back internally, but never
    // let an unexpected throw reach the route handler.
    return templateResponse(req, facts, key, MAX_ATTEMPTS);
  }
}
