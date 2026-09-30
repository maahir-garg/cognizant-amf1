"use client";

import { ArrowDown, ArrowRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FanProfile } from "@/lib/data/schemas";
import { JOURNEY_STAGES, type JourneyStage } from "@/lib/fan/lap";
import { useResolvedProfile } from "@/lib/fan/profile";
import { LapProgress } from "./lap-progress";
import { JourneyStageVisual } from "./journey-stage-visual";
import { SectorPanel } from "./sector-panel";

export function LapClient({ paramProfile }: { paramProfile: FanProfile | null }) {
  const savedProfile = useResolvedProfile(paramProfile);
  const [activeId, setActiveId] = useState<JourneyStage["id"]>(JOURNEY_STAGES[0].id);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-journey-stage]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute("data-journey-stage") as JourneyStage["id"] | null;
        if (id) setActiveId(id);
      },
      { rootMargin: "-28% 0px -48% 0px", threshold: [0.05, 0.2, 0.45] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <div className="sticky top-14 z-30 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <LapProgress stages={JOURNEY_STAGES} activeId={activeId} />
        </div>
      </div>

      <header className="mx-auto grid min-h-[calc(100dvh-7rem)] w-full max-w-[90rem] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(32rem,1.28fr)] lg:gap-8 lg:py-16">
        <div className="relative z-10 flex flex-col items-start gap-6 lg:py-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-lime" aria-hidden />
            <p className="label text-ink">From factory to circuit</p>
          </div>
          <h1 className="display max-w-3xl text-[clamp(3.8rem,9vw,8.8rem)]">Follow the car. See the impact.</h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
            Move through the operation with the car. Published evidence shows how environment, belonging, community and governance shape every race weekend.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#factory">
                Enter the factory <ArrowDown />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/start">
                <SlidersHorizontal /> {savedProfile ? "Adjust your view" : "Personalise later"}
              </Link>
            </Button>
          </div>
          <div className="grid max-w-xl gap-3 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <p className="label text-lime">What AI changes</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">It turns the facts for each operational stage into a concise, contextual explanation for you.</p>
            </div>
            <div>
              <p className="label text-ink">What stays fixed</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">The published facts, their status and their sources. Tap any figure to inspect the evidence.</p>
            </div>
          </div>
        </div>
        <JourneyStageVisual stageId="factory" className="w-full lg:min-h-[42rem]" />
      </header>

      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6">
        {JOURNEY_STAGES.map((stage, index) => (
          <SectorPanel key={stage.id} stage={stage} profile={savedProfile} index={index} />
        ))}

        <section className="my-16 grid gap-8 border-y border-line py-12 sm:my-24 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="label">Parc fermé</p>
            <h2 className="display text-[clamp(2.5rem,7vw,4.5rem)]">Keep exploring</h2>
            <p className="text-ink-2">
              See the next race through your region, or take the optional knowledge check after the full story.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/weekend/singapore-2026">
                Explore a Singapore example <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/quiz">Optional knowledge check</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
