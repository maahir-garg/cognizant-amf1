/**
 * On-disk AI response cache, one JSON file per task under data/ai-cache/.
 * The files are statically imported so responses are bundled at build time
 * (works on Vercel and fully offline) rather than read from disk at runtime.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import fanStory from "@/data/ai-cache/fan-story.json";
import investorSummary from "@/data/ai-cache/investor-summary.json";
import linkedinPost from "@/data/ai-cache/linkedin-post.json";
import quarterlyBrief from "@/data/ai-cache/quarterly-brief.json";
import quizReveal from "@/data/ai-cache/quiz-reveal.json";
import scenarioExplanation from "@/data/ai-cache/scenario-explanation.json";
import shareCaption from "@/data/ai-cache/share-caption.json";
import storyKit from "@/data/ai-cache/story-kit.json";
import type { AiResponse, AiTask } from "@/lib/data/schemas";

type CacheFile = Record<string, AiResponse>;

const CACHES: Record<AiTask, CacheFile> = {
  "fan-story": fanStory as CacheFile,
  "quiz-reveal": quizReveal as CacheFile,
  "share-caption": shareCaption as CacheFile,
  "linkedin-post": linkedinPost as CacheFile,
  "quarterly-brief": quarterlyBrief as CacheFile,
  "investor-summary": investorSummary as CacheFile,
  "scenario-explanation": scenarioExplanation as CacheFile,
  "story-kit": storyKit as CacheFile,
};

/** Looks up a warmed response. Returns undefined outside the warmed demo set. */
export function getCached(key: string, task: AiTask): AiResponse | undefined {
  return CACHES[task]?.[key];
}

/**
 * Node-only: merges entries into the on-disk cache files, used by
 * scripts/warm-cache.ts. This module is only ever imported from server code
 * (lib/ai/engine.ts, run in the Node.js runtime) or from the script itself,
 * never from client components, so the node:fs/node:path imports are safe.
 */
export function writeCache(entries: { task: AiTask; key: string; response: AiResponse }[]): void {
  const byTask = new Map<AiTask, { key: string; response: AiResponse }[]>();
  for (const { task, key, response } of entries) {
    if (!byTask.has(task)) byTask.set(task, []);
    byTask.get(task)!.push({ key, response });
  }
  for (const [task, items] of byTask) {
    const file = join(process.cwd(), "data", "ai-cache", `${task}.json`);
    const existing: CacheFile = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
    for (const { key, response } of items) existing[key] = response;
    const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`);
  }
}
