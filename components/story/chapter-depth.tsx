"use client";

/**
 * The story's two depths. Each chapter opens with a short generated brief
 * ("In plain words" for new fans, a denser "In brief" for long-time fans)
 * and closes with "More figures and method", open by default for long-time
 * fans. The choice is the fan profile's level, so the race page and the
 * quick check see it too.
 */
import { useId, type ReactNode } from "react";
import { AiText } from "@/components/shared/ai-text";
import { useAiText } from "@/lib/ai/client";
import { STORY_DEFAULT_FAN, fanChapterRequest, type ChapterId } from "@/lib/ai/requests";
import type { AiResponse, FanProfile } from "@/lib/data/schemas";
import { useFanProfile } from "@/lib/fan/profile";
import { useDepth } from "@/lib/fan/storage";
import { cn } from "@/lib/utils";

export type StoryLevel = "new" | "die-hard";

/** The shared fan depth (lib/fan/storage.ts), in the level terms AI requests use. */
export function useStoryLevel(): { level: StoryLevel; profile: FanProfile | null; setLevel: (l: StoryLevel) => void } {
  const { profile } = useFanProfile();
  const [depth, setDepth] = useDepth();
  const level: StoryLevel = depth === "watched" ? "die-hard" : "new";
  return { level, profile, setLevel: (l) => setDepth(l === "die-hard" ? "watched" : "new") };
}

const OPTIONS: { value: StoryLevel; label: string }[] = [
  { value: "new", label: "New to F1" },
  { value: "die-hard", label: "Watched for years" },
];

/**
 * Segmented radio control. Native radios, visually hidden but focusable.
 * `compact` is the mid-story copy in the chapter tracker.
 */
export function DepthToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { level, setLevel } = useStoryLevel();
  const name = useId();
  return (
    <fieldset className={cn("flex items-center", compact ? "gap-2" : "flex-col gap-2 sm:flex-row sm:gap-4", className)}>
      <legend className="sr-only">How much detail?</legend>
      <span aria-hidden className={cn("kicker text-ink-3", compact && "hidden xl:inline")}>
        {compact ? "Detail" : "How much detail?"}
      </span>
      <div className={cn("inline-flex rounded-md border border-line-strong bg-card", compact ? "p-[2px]" : "p-[3px]")}>
        {OPTIONS.map((o) => {
          const on = level === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative flex cursor-pointer items-center gap-1.5 rounded-[3px] border-2 font-sans font-medium whitespace-nowrap transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                compact ? "h-11 px-3 text-[0.875rem] lg:h-7 lg:px-2.5 lg:text-[0.8125rem]" : "h-11 px-4 text-[0.9375rem]",
                on ? "border-ink bg-lime-tint text-lime-ink" : "border-transparent text-ink-2 hover:text-ink",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={on} onChange={() => setLevel(o.value)} className="sr-only" />
              {on && <span aria-hidden>✓</span>}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function sameAsDefault(p: FanProfile | null): boolean {
  if (!p) return true;
  return p.cityId === STORY_DEFAULT_FAN.cityId && [...p.interests].sort().join() === [...STORY_DEFAULT_FAN.interests].sort().join();
}

/**
 * The chapter brief at the top of each chapter, never blocking: the
 * server-rendered text shows until a personalised one arrives, and the box
 * keeps its height meanwhile.
 */
export function ChapterBrief({
  chapterId,
  preloaded,
}: {
  chapterId: ChapterId;
  preloaded: Partial<Record<StoryLevel, AiResponse>> | null;
}) {
  const { level, profile } = useStoryLevel();
  const pre = preloaded?.[level] ?? null;
  const request = pre && sameAsDefault(profile) ? null : fanChapterRequest(profile, chapterId);
  const { data } = useAiText(request);
  const response = data ?? pre;
  return (
    <section aria-label={level === "die-hard" ? "In brief" : "In plain words"} className="flex flex-col gap-3 border-l-2 border-highlight pl-4 sm:pl-5">
      <h3 className="kicker text-ink">{level === "die-hard" ? "In brief" : "In plain words"}</h3>
      <div className="min-h-[7.5rem]" aria-live="polite">
        {response ? (
          // The trust line is said once, on the title page; each brief keeps its citation chips.
          <AiText response={response} showMeta={false} className="text-[clamp(1.0625rem,1rem+0.25vw,1.25rem)]" />
        ) : (
          <p className="kicker text-ink-3">Preparing a short summary…</p>
        )}
      </div>
    </section>
  );
}

const SUMMARY =
  "flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-sans text-base font-semibold text-ink [&::-webkit-details-marker]:hidden";

/** "More figures and method": closed for new fans, open for long-time fans. */
export function ChapterDetail({ children }: { children: ReactNode }) {
  const { level } = useStoryLevel();
  return (
    <details key={level} open={level === "die-hard"} className="group">
      <summary className={SUMMARY}>
        More figures and method
        <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-180">
          ↓
        </span>
      </summary>
      <div className="pt-3 pb-2">{children}</div>
    </details>
  );
}
