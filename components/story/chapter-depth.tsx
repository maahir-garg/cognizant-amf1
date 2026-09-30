"use client";

/**
 * The story's two depths. "New to F1" shows an "In plain words" recap and
 * keeps "The detail" closed; "Watched for years" opens the detail and puts
 * the denser generated paragraph at its top. The choice is the fan profile's
 * level, so the race page and share card see it too.
 */
import { useId, type ReactNode } from "react";
import { AiText } from "@/components/shared/ai-text";
import { useAiText } from "@/lib/ai/client";
import { STORY_DEFAULT_FAN, fanChapterRequest, type ChapterId } from "@/lib/ai/requests";
import type { AiResponse, FanProfile } from "@/lib/data/schemas";
import { useFanProfile } from "@/lib/fan/profile";
import { cn } from "@/lib/utils";

export type StoryLevel = "new" | "die-hard";

export function useStoryLevel(): { level: StoryLevel; profile: FanProfile | null; setLevel: (l: StoryLevel) => void } {
  const { profile, setProfile } = useFanProfile();
  const level: StoryLevel = profile?.level === "die-hard" ? "die-hard" : "new";
  return { level, profile, setLevel: (l) => setProfile({ ...(profile ?? STORY_DEFAULT_FAN), level: l }) };
}

const OPTIONS: { value: StoryLevel; label: string }[] = [
  { value: "new", label: "New to F1" },
  { value: "die-hard", label: "Watched for years" },
];

/** Small segmented radio control. Native radios, visually hidden but focusable. */
export function DepthToggle({ className }: { className?: string }) {
  const { level, setLevel } = useStoryLevel();
  const name = useId();
  return (
    <fieldset className={cn("flex flex-col items-center gap-2 sm:flex-row sm:gap-4", className)}>
      <legend className="sr-only">How much detail?</legend>
      <span aria-hidden className="kicker text-ink-3">
        How much detail?
      </span>
      <div className="inline-flex rounded-md border border-line-strong bg-card p-[3px]">
        {OPTIONS.map((o) => {
          const on = level === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative flex h-10 cursor-pointer items-center gap-1.5 rounded-[3px] border-2 px-4 font-sans text-[0.9375rem] font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                on ? "border-ink bg-lime-tint text-lime-ink" : "border-transparent text-ink-2 hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={on}
                onChange={() => setLevel(o.value)}
                className="sr-only"
              />
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

/** The chapter's generated paragraph, never blocking: the server-rendered text shows until a personalised one arrives. */
function ChapterAi({
  chapterId,
  level,
  profile,
  preloaded,
}: {
  chapterId: ChapterId;
  level: StoryLevel;
  profile: FanProfile | null;
  preloaded: Partial<Record<StoryLevel, AiResponse>> | null;
}) {
  const pre = preloaded?.[level] ?? null;
  const request = pre && sameAsDefault(profile) ? null : fanChapterRequest(profile, chapterId);
  const { data } = useAiText(request);
  const response = data ?? pre;
  return (
    <div className="min-h-[9rem]" aria-live="polite">
      {response ? (
        <AiText response={response} className="text-[clamp(1.0625rem,1rem+0.25vw,1.25rem)]" />
      ) : (
        <p className="kicker text-ink-3">Preparing a short summary…</p>
      )}
    </div>
  );
}

const SUMMARY =
  "flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-sans text-base font-semibold text-ink [&::-webkit-details-marker]:hidden";

export function ChapterDepth({
  chapterId,
  preloaded,
  children,
}: {
  chapterId: ChapterId;
  preloaded: Partial<Record<StoryLevel, AiResponse>> | null;
  children: ReactNode;
}) {
  const { level, profile } = useStoryLevel();
  const ai = <ChapterAi chapterId={chapterId} level={level} profile={profile} preloaded={preloaded} />;

  if (level === "die-hard") {
    return (
      <details key="die-hard" open className="group">
        <summary className={SUMMARY}>
          The detail
          <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-180">
            ↓
          </span>
        </summary>
        <div className="flex flex-col gap-8 pt-3 pb-2">
          {ai}
          {children}
        </div>
      </details>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="In plain words" className="flex flex-col gap-3">
        <h3 className="kicker text-ink">In plain words</h3>
        {ai}
      </section>
      <details key="new" className="group border-t border-line">
        <summary className={SUMMARY}>
          The detail
          <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-180">
            ↓
          </span>
        </summary>
        <div className="pt-3 pb-2">{children}</div>
      </details>
    </div>
  );
}
