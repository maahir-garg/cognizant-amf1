"use client";

/**
 * Small per-browser conveniences for the fan pages: the quick-check badge
 * and the trip plan, so the share card can pick them up. Nothing here is
 * needed to render a page; every read and write fails quietly when storage
 * is blocked (private mode, quota, sandboxed previews).
 */
import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod";
import { useFanProfile } from "./profile";
import { DEFAULT_FAN, depthFromLevel, levelFromDepth, type Depth } from "./quiz";

/** Same event profile.ts fires, so every hook re-reads after a same-tab write. */
const LOCAL_EVENT = "impact-lap:local-storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the page still works, the value just won't persist.
  }
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: key }));
}

/** A typed localStorage value with a stable snapshot (parsed once per raw string). */
function makeStore<T>(key: string, schema: z.ZodType<T>) {
  let lastRaw: string | null | undefined;
  let lastValue: T | null = null;
  const snapshot = (): T | null => {
    const raw = readRaw(key);
    if (raw === lastRaw) return lastValue;
    lastRaw = raw;
    try {
      const parsed = raw ? schema.safeParse(JSON.parse(raw)) : null;
      lastValue = parsed?.success ? parsed.data : null;
    } catch {
      lastValue = null;
    }
    return lastValue;
  };
  return {
    use(): [T | null, (next: T | null) => void] {
      const value = useSyncExternalStore(subscribe, snapshot, () => null);
      const set = useCallback((next: T | null) => write(key, next), []);
      return [value, set];
    },
  };
}

/* -------------------------------------------------------------- quiz badge */

export const QuizBadge = z.object({
  depth: z.enum(["new", "watched"]),
  answered: z.number().int().nonnegative(),
  /** How many answers matched the report. Shown to the fan only, never on the card. */
  matched: z.number().int().nonnegative(),
  completedAt: z.string(),
});
export type QuizBadge = z.infer<typeof QuizBadge>;

const badgeStore = makeStore("impact-lap:quick-check", QuizBadge);

/** The quick-check badge, earned by answering every question for a depth. */
export function useQuizBadge() {
  return badgeStore.use();
}

/* --------------------------------------------------------------- trip plan */

export const TripPlan = z.object({
  raceId: z.string(),
  cityId: z.string(),
  modeId: z.string(),
  km: z.number().positive(),
});
export type TripPlan = z.infer<typeof TripPlan>;

const planStore = makeStore("impact-lap:trip-plan", TripPlan);

/** The fan's chosen way to the circuit, from the race-page trip planner. */
export function useTripPlan() {
  return planStore.use();
}

/* ------------------------------------------------------------------- depth */

/**
 * The story's reading depth, stored as the profile's level so the story,
 * the quick check and AI personalisation agree. Setting it keeps the fan's
 * city and interests if a profile exists.
 */
export function useDepth(): [Depth, (next: Depth) => void] {
  const { profile, setProfile } = useFanProfile();
  const depth = depthFromLevel(profile?.level);
  const setDepth = useCallback(
    (next: Depth) => setProfile({ ...(profile ?? DEFAULT_FAN), level: levelFromDepth(next) }),
    [profile, setProfile],
  );
  return [depth, setDepth];
}
