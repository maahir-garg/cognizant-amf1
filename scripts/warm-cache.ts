/**
 * Warms the offline AI cache (data/ai-cache/<task>.json) for every request
 * enumerated by lib/ai/demo-requests.ts.
 *
 *   npm run warm-cache
 *
 * Requires GEMINI_API_KEY. Without one, the live pipeline can't run, so this
 * prints a message and exits 0 without touching data/ai-cache - the offline
 * demo already works because runGeneration() falls back to the deterministic
 * templates, computed at request time rather than pre-cached.
 */
import { writeCache } from "../lib/ai/cache";
import { enumerateDemoRequests } from "../lib/ai/demo-requests";
import { cacheKey, runGeneration } from "../lib/ai/engine";
import { getProvider } from "../lib/ai/provider";
import type { AiTask } from "../lib/data/schemas";

async function main() {
  if (!getProvider()) {
    console.log(
      "No GEMINI_API_KEY set: skipping the cache warm. The offline demo already works - " +
        "runGeneration() falls back to the deterministic templates in lib/ai/templates.ts, " +
        "computed at request time.",
    );
    process.exit(0);
  }
  // Force the live pipeline for this run regardless of DEMO_MODE, since the
  // point of this script is to exercise the model and cache what it says.
  process.env.DEMO_MODE = "false";

  const requests = enumerateDemoRequests();
  console.log(`Warming ${requests.length} AI responses via the live pipeline...`);

  const entries: { task: AiTask; key: string; response: Awaited<ReturnType<typeof runGeneration>> }[] = [];
  let failures = 0;
  for (const [i, req] of requests.entries()) {
    process.stdout.write(`\r  ${i + 1}/${requests.length}`);
    const response = await runGeneration(req);
    if (!response.guardrail.passed) {
      failures++;
      console.warn(`\nGuardrail still failing for ${req.task} (${cacheKey(req)}): ${response.guardrail.reasons.join("; ")}`);
      continue; // Don't cache a failing response; the runtime template fallback covers this request anyway.
    }
    entries.push({ task: req.task, key: cacheKey(req), response });
  }
  console.log(`\nWriting ${entries.length} cache entries (${failures} skipped).`);
  writeCache(entries);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
