/**
 * Pure replay of the simulated race-weekend feed. Given elapsed seconds,
 * returns which events have fired, current counter values and which
 * milestones have been crossed. Deterministic, so server (SSE) and client
 * (local timer) always agree.
 */
import { counters, events } from "@/lib/data/load";
import type { Counter, FeedEvent } from "@/lib/data/schemas";

export type Milestone = {
  counterId: string;
  label: string;
  threshold: number;
  unit: string;
  /** Event that pushed the counter over the threshold. */
  eventId: string;
  at: number;
};

export type ReplayState = {
  elapsed: number;
  fired: FeedEvent[];
  counters: Record<string, number>;
  milestones: Milestone[];
  done: boolean;
};

export function raceEvents(raceId: string): FeedEvent[] {
  return events.filter((e) => e.raceId === raceId).sort((a, b) => a.at - b.at);
}

export function replayDuration(raceId: string): number {
  const list = raceEvents(raceId);
  return list.length ? list[list.length - 1].at : 0;
}

export function replayAt(raceId: string, elapsed: number): ReplayState {
  const list = raceEvents(raceId);
  const values: Record<string, number> = Object.fromEntries(counters.map((c) => [c.id, c.start]));
  const byId = new Map<string, Counter>(counters.map((c) => [c.id, c]));
  const fired: FeedEvent[] = [];
  const milestones: Milestone[] = [];

  for (const e of list) {
    if (e.at > elapsed) break;
    fired.push(e);
    if (e.increment) {
      const c = byId.get(e.increment.counter);
      const before = values[e.increment.counter] ?? 0;
      const after = before + e.increment.by;
      values[e.increment.counter] = after;
      for (const t of c?.milestones ?? []) {
        if (before < t && after >= t) {
          milestones.push({ counterId: c!.id, label: c!.label, threshold: t, unit: c!.unit, eventId: e.id, at: e.at });
        }
      }
    }
  }
  return { elapsed, fired, counters: values, milestones, done: elapsed >= replayDuration(raceId) };
}
