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
import { existsSync } from "node:fs";
import { writeCache } from "../lib/ai/cache";
import { enumerateDemoRequests } from "../lib/ai/demo-requests";
import { cacheKey, runGeneration } from "../lib/ai/engine";
import { getProvider } from "../lib/ai/provider";
import type { AiTask } from "../lib/data/schemas";

// tsx doesn't read .env files; load the local key the same way `next dev` would.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// One at a time: free-tier keys allow only a handful of requests per minute.
const CONCURRENCY = Number(process.env.WARM_CONCURRENCY) || 1;

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
  // No user is waiting on the warm run, so give the model room to think.
  process.env.AI_TIMEOUT_MS ??= "60000";
  process.env.AI_MAX_RETRIES ??= "8";

  const requests = enumerateDemoRequests();
  console.log(`Warming ${requests.length} AI responses via the live pipeline...`);

  const entries: { task: AiTask; key: string; response: Awaited<ReturnType<typeof runGeneration>> }[] = [];
  let failures = 0;
  let done = 0;
  const queue = [...requests];
  async function worker() {
    for (let req = queue.shift(); req; req = queue.shift()) {
      const response = await runGeneration(req);
      process.stdout.write(`\r  ${++done}/${requests.length}`);
      // Only cache genuine model output. If the model failed the guardrail twice the engine
      // returned the template, which the runtime computes anyway, so caching it adds nothing.
      if (response.generator.kind !== "model" || !response.guardrail.passed) {
        failures++;
        continue;
      }
      entries.push({ task: req.task, key: cacheKey(req), response });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nWriting ${entries.length} model responses (${failures} fell back to templates and were not cached).`);
  writeCache(entries);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
