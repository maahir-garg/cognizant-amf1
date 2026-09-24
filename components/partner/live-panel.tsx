"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { counters as counterDefs } from "@/lib/data/load";
import { useLiveFeed } from "@/lib/live/use-live-feed";
import { MilestoneAlert } from "./milestone-alert";

/** Simulated race-weekend panel: counters, progress to the next milestone and a milestone alert feed. */
export function LivePanel({ raceId, speed = 4 }: { raceId: string; speed?: number }) {
  const feed = useLiveFeed({ raceId, speed });
  const alerts = [...feed.milestones].reverse();

  return (
    <section className="flex flex-col gap-6 border-t border-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="label">Live race weekend · Singapore Grand Prix 2026</p>
          <p className="text-xs text-simulated">Simulated live feed — replayed demo data, not a real connection to the circuit.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label rounded-sm border border-line px-2 py-1" title="How this panel is currently being driven">
            Transport: {feed.transport === "sse" ? "SSE" : "local replay"}
          </span>
          <Button size="sm" variant="outline" onClick={feed.restart}>
            <RotateCcw /> Restart
          </Button>
          <Button size="sm" variant="outline" onClick={feed.running ? feed.pause : feed.resume}>
            {feed.running ? (
              <>
                <Pause /> Pause
              </>
            ) : (
              <>
                <Play /> Resume
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {counterDefs.map((c) => {
          const value = feed.counters[c.id] ?? c.start;
          const nextMilestone = c.milestones.find((m) => value < m);
          const prevMilestone = [...c.milestones].reverse().find((m) => value >= m) ?? 0;
          const pct = nextMilestone ? Math.min(100, ((value - prevMilestone) / (nextMilestone - prevMilestone)) * 100) : 100;
          return (
            <div key={c.id} className="flex flex-col gap-2 bg-surface p-4">
              <span className="num text-2xl font-semibold text-ink">{Math.round(value).toLocaleString("en-GB")}</span>
              <span className="text-xs text-ink-2">{c.label}</span>
              <Progress value={pct} className="mt-1" />
              <span className="label">
                {nextMilestone
                  ? `${Math.max(0, Math.round(nextMilestone - value)).toLocaleString("en-GB")} to next milestone (${nextMilestone.toLocaleString("en-GB")})`
                  : "All milestones reached"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <p className="label">Milestone alerts{alerts.length > 0 && ` (${alerts.length})`}</p>
        {alerts.length === 0 ? (
          <p className="text-sm text-ink-3">No milestones fired yet in this replay.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {alerts.map((m) => (
              <MilestoneAlert key={`${m.counterId}-${m.threshold}`} milestone={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
