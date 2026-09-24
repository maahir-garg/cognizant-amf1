"use client";

import { ChevronDown, Pause, Play, RotateCcw } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InlineFact } from "@/components/shared/fact-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { counters as counterDefs } from "@/lib/data/load";
import { useLiveFeed } from "@/lib/live/use-live-feed";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  freight: "Freight",
  session: "On track",
  community: "Community",
  milestone: "Milestone",
  data: "Data",
};

/** Simulated race-weekend feed: counts up, fires milestone flashes. Collapsible on mobile. */
export function LivePanel({ raceId }: { raceId: string }) {
  const feed = useLiveFeed({ raceId });
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? feed.fired : feed.fired.slice(-3);
  const latestMilestone = feed.milestones[feed.milestones.length - 1];

  return (
    <section className="flex flex-col gap-4 rounded-md border border-simulated/40 bg-simulated/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn("size-2 rounded-full bg-simulated", feed.running && !reduceMotion && "animate-pulse")}
          />
          <StatusBadge status="simulated" />
          <span className="label">Live feed</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" onClick={feed.running ? feed.pause : feed.resume} aria-label={feed.running ? "Pause" : "Resume"}>
            {feed.running ? <Pause /> : <Play />}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={feed.restart} aria-label="Restart">
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counterDefs.map((c) => (
          <div key={c.id} className="flex flex-col gap-0.5 rounded-md border border-line bg-surface p-3">
            <span className="num text-xl font-semibold text-ink">{(feed.counters[c.id] ?? c.start).toLocaleString("en-GB")}</span>
            <span className="label leading-snug">{c.label}</span>
          </div>
        ))}
      </div>

      {latestMilestone && (
        <div className="rounded-md border border-lime/40 bg-lime/10 px-3 py-2 text-sm text-ink">
          Milestone: {latestMilestone.label} passed {latestMilestone.threshold.toLocaleString("en-GB")} {latestMilestone.unit}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {visible.map((e) => (
          <li key={e.id} className="flex flex-col gap-0.5 border-t border-line/60 pt-2 first:border-t-0 first:pt-0">
            <span className="label flex items-center gap-2">
              <span>{e.clock}</span>
              <span>·</span>
              <span>{TYPE_LABEL[e.type] ?? e.type}</span>
            </span>
            <span className="text-sm font-medium text-ink">{e.title}</span>
            <span className="text-xs text-ink-2">{e.detail}</span>
            {e.factIds.length > 0 && (
              <span className="mt-0.5 flex flex-wrap gap-3">
                {e.factIds.map((id) => (
                  <InlineFact key={id} id={id} />
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>

      {feed.fired.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="label flex min-h-11 items-center justify-center gap-1 self-start text-ink-2 hover:text-ink"
        >
          {expanded ? "Show fewer events" : `Show all ${feed.fired.length} events`}
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </section>
  );
}
