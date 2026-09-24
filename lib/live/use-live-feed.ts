"use client";

/**
 * Drives the simulated live feed. Prefers the SSE stream from
 * /api/events/stream and falls back to a local timer if the stream fails,
 * so the demo keeps running with no network at all. Both paths produce the
 * same state because they share replayAt().
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { replayAt, replayDuration, type ReplayState } from "./replay";

export type Transport = "sse" | "local";

export function useLiveFeed({
  raceId,
  speed = 4,
  autoStart = true,
  preferSse = true,
}: {
  raceId: string;
  /** Replay seconds per real second. */
  speed?: number;
  autoStart?: boolean;
  preferSse?: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const [transport, setTransport] = useState<Transport>(preferSse ? "sse" : "local");
  const elapsedRef = useRef(0);
  const duration = replayDuration(raceId);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  // SSE transport: the server tells us when each event fires.
  useEffect(() => {
    if (!running || transport !== "sse" || typeof EventSource === "undefined") return;
    const es = new EventSource(`/api/events/stream?race=${raceId}&speed=${speed}&from=${elapsedRef.current}`);
    let opened = false;
    const failTimer = setTimeout(() => !opened && setTransport("local"), 4000);
    es.addEventListener("open", () => (opened = true));
    es.onmessage = (msg) => {
      opened = true;
      const e = JSON.parse(msg.data) as { at: number };
      setElapsed((prev) => Math.max(prev, e.at));
    };
    es.addEventListener("done", () => {
      es.close();
      setElapsed(duration);
      setRunning(false);
    });
    es.onerror = () => {
      es.close();
      // Keep going locally from wherever we got to.
      setTransport("local");
    };
    return () => {
      clearTimeout(failTimer);
      es.close();
    };
  }, [running, transport, raceId, speed, duration]);

  // Local transport: advance a clock.
  useEffect(() => {
    if (!running || transport !== "local") return;
    const started = performance.now();
    const base = elapsedRef.current;
    const id = setInterval(() => {
      const next = Math.min(duration, base + ((performance.now() - started) / 1000) * speed);
      setElapsed(next);
      if (next >= duration) {
        setRunning(false);
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, transport, speed, duration]);

  const state: ReplayState = replayAt(raceId, elapsed);

  const restart = useCallback(() => {
    setElapsed(0);
    elapsedRef.current = 0;
    setRunning(true);
  }, []);
  const pause = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);

  return { ...state, duration, running, transport, restart, pause, resume };
}
