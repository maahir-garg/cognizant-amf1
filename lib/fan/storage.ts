"use client";

/**
 * Small per-browser conveniences for the fan pages: the quick-check badge
 * and the trip plan, so the share card can pick them up. Nothing here is
 * needed to render a page; every read and write fails quietly when storage
 * is blocked (private mode, quota, sandboxed previews).
 */
import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod";
import { LOCAL_EVENT, QUICK_CHECK_KEY, TRIP_PLAN_KEY, readStored } from "./local-keys";
import { useFanProfile } from "./profile";
import { DEFAULT_FAN, depthFromLevel, levelFromDepth, type Depth } from "./quiz";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
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
    const raw = readStored(key);
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
  /**
   * The facts behind the questions answered, so the card starts from what the
   * fan just checked. Badges saved before this field existed have none, and a
   * malformed list is dropped rather than costing the fan their badge. The
   * share builder still keeps only curated card facts (badgeShareFacts).
   */
  factIds: z.array(z.string().max(64)).max(20).optional().catch(undefined),
});
export type QuizBadge = z.infer<typeof QuizBadge>;

const badgeStore = makeStore(QUICK_CHECK_KEY, QuizBadge);

/** The quick-check badge, earned by answering every question for a depth. */
export function useQuizBadge() {
  return badgeStore.use();
}

/* --------------------------------------------------------------- trip plan */

const TripPlan = z.object({
  raceId: z.string(),
  cityId: z.string(),
  modeId: z.string(),
  km: z.number().positive(),
});
type TripPlan = z.infer<typeof TripPlan>;

const planStore = makeStore(TRIP_PLAN_KEY, TripPlan);

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
