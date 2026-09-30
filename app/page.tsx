import { StoryChapter } from "@/components/story/chapter";
import { StoryHero, WhatYouGet } from "@/components/story/hero";
import { RaceWeekend } from "@/components/story/race-weekend";
import styles from "@/components/story/story.module.css";
import { ChapterTracker } from "@/components/story/tracker";
import { runGeneration } from "@/lib/ai/engine";
import { STORY_DEFAULT_FAN, fanChapterRequest, type ChapterId } from "@/lib/ai/requests";
import { HERO_RACE_ID, isDemoMode } from "@/lib/config";
import type { AiResponse } from "@/lib/data/schemas";
import { CHAPTERS } from "@/lib/story/chapters";

type Preloaded = Partial<Record<"new" | "die-hard", AiResponse>>;

/**
 * In the offline demo, render each chapter's paragraph for the default fan at
 * both depths on the server, so the text is in the HTML (no request, no
 * layout shift, readable without JavaScript) and the depth toggle is instant.
 * Live mode skips this so a build never calls a model.
 */
async function preloadChapterText(): Promise<Record<ChapterId, Preloaded> | null> {
  if (!isDemoMode()) return null;
  const entries = await Promise.all(
    CHAPTERS.map(async (c) => {
      const [fresh, deep] = await Promise.all([
        runGeneration(fanChapterRequest({ ...STORY_DEFAULT_FAN, level: "new" }, c.id)),
        runGeneration(fanChapterRequest({ ...STORY_DEFAULT_FAN, level: "die-hard" }, c.id)),
      ]);
      return [c.id, { new: fresh, "die-hard": deep }] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<ChapterId, Preloaded>;
}

export default async function StoryPage() {
  const preloaded = await preloadChapterText();
  return (
    <div className={styles.story}>
      <StoryHero />
      <WhatYouGet />
      <div id="story" className={styles.storyTimeline}>
        <ChapterTracker chapters={CHAPTERS.map((c) => ({ id: c.id, number: c.number, label: c.name }))} />
        {CHAPTERS.map((c) => (
          <StoryChapter key={c.id} chapter={c} total={CHAPTERS.length} preloaded={preloaded?.[c.id] ?? null} />
        ))}
      </div>
      <RaceWeekend raceId={HERO_RACE_ID} />
    </div>
  );
}
