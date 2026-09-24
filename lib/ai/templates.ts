/**
 * Deterministic, grounded fallback copy for every AI task. Used when no model
 * is configured, when the model output fails the guardrail twice, and as the
 * baseline the cache is warmed with. Every number comes from a cited fact.
 *
 * STUB: the AI-layer workstream replaces this with per-task templates.
 */
import type { AiRequest, Fact } from "@/lib/data/schemas";
import { formatFact } from "@/lib/format";

export function renderTemplate(req: AiRequest, facts: Fact[]): string {
  const lines = facts.slice(0, 3).map((f) => `${f.metric}: ${formatFact(f)} [F:${f.id}]`);
  return lines.join("\n\n");
}
