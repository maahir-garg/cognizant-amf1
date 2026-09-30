/**
 * The race-week quick check: which questions a fan sees for their depth.
 * Questions live in data/quizzes.json (conceptual options, the exact cited
 * figure is revealed after answering). Order in the file is priority order.
 */
import { quizzes } from "@/lib/data/load";
import type { FanLevel, FanProfile, Quiz } from "@/lib/data/schemas";

/** The story's two reading depths: "New to F1" (default) and "Watched for years". */
export type Depth = "new" | "watched";

export const DEPTH_COPY: Record<Depth, { label: string; count: number }> = {
  new: { label: "New to F1", count: 3 },
  watched: { label: "Watched for years", count: 5 },
};

export function depthFromLevel(level: FanLevel | undefined | null): Depth {
  return level === "die-hard" ? "watched" : "new";
}

export function levelFromDepth(depth: Depth): FanLevel {
  return depth === "watched" ? "die-hard" : "new";
}

export function quickCheckQuestions(depth: Depth): Quiz[] {
  const level = levelFromDepth(depth);
  return quizzes.filter((q) => q.levels.includes(level)).slice(0, DEPTH_COPY[depth].count);
}

/** The profile AI requests are personalised with when the fan hasn't set one: the first demo persona. */
export const DEFAULT_FAN: FanProfile = { level: "new", cityId: "singapore", interests: ["environment", "stem"] };

/** The badge wording. Completion only: no points, no ranking. */
export const QUIZ_BADGE_LABEL = "Pit-wall ready";
