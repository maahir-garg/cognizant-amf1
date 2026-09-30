"use client";

import { useReducedMotion } from "framer-motion";
import type { JourneyStage } from "@/lib/fan/lap";
import { cn } from "@/lib/utils";

export function LapProgress({ stages, activeId }: { stages: JourneyStage[]; activeId: JourneyStage["id"] }) {
  const reduceMotion = useReducedMotion();
  const activeIndex = stages.findIndex((stage) => stage.id === activeId);
  const progress = stages.length > 1 ? activeIndex / (stages.length - 1) : 0;

  return (
    <div className="flex items-center gap-8">
      <nav aria-label="Car journey" className="min-w-0 flex-1 overflow-x-auto">
        <ol className="flex min-w-max items-center gap-1">
          {stages.map((stage) => {
            const active = stage.id === activeId;
            return (
              <li key={stage.id}>
                <a
                  href={`#${stage.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "label block rounded-full border px-3 py-2 transition-colors",
                    active ? "border-lime bg-lime text-lime-ink" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
                  )}
                >
                  {stage.navLabel}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="relative hidden h-9 w-52 shrink-0 items-center lg:flex" aria-hidden>
        <span className="absolute inset-x-0 h-px bg-line" />
        <span className="absolute left-0 h-px bg-lime transition-[width] duration-300" style={{ width: `${progress * 100}%`, transitionDuration: reduceMotion ? "0ms" : undefined }} />
        <span
          className="absolute size-3 -translate-x-1/2 rotate-45 border border-lime bg-lime transition-[left] duration-300"
          style={{ left: `${progress * 100}%`, transitionDuration: reduceMotion ? "0ms" : undefined }}
        />
        <span className="label absolute right-0 -bottom-1 translate-y-full text-ink-2">Now · {stages[activeIndex]?.navLabel}</span>
      </div>
    </div>
  );
}
