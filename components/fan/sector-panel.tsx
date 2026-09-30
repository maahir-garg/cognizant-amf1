"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AiText } from "@/components/shared/ai-text";
import { FactValue } from "@/components/shared/fact-value";
import { useAiText } from "@/lib/ai/client";
import type { AiRequest, FanProfile } from "@/lib/data/schemas";
import type { JourneyStage } from "@/lib/fan/lap";
import { AiSkeleton } from "./ai-skeleton";
import { JourneyStageVisual } from "./journey-stage-visual";

export function SectorPanel({ stage, profile, index }: { stage: JourneyStage; profile: FanProfile | null; index: number }) {
  const request: AiRequest = {
    task: "fan-story",
    factIds: [...stage.factIds, ...stage.detailFactIds],
    derived: [],
    ...(profile ? { fan: profile } : {}),
    params: { pillar: stage.pillar, stage: stage.id },
  };
  const { data, loading } = useAiText(request);
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={stage.id}
      data-journey-stage={stage.id}
      aria-labelledby={`${stage.id}-title`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
      className="scroll-mt-32 border-t border-line py-16 sm:py-24 lg:min-h-[105vh]"
    >
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-line pb-4">
        <p className="label text-ink">{stage.route}</p>
        <p className="label text-ink-3">{stage.topics}</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={index % 2 === 0 ? "lg:order-1" : "lg:order-2"}>
          <div className="lg:sticky lg:top-36">
            <JourneyStageVisual stageId={stage.id} active />
          </div>
        </div>

        <div className={index % 2 === 0 ? "lg:order-2" : "lg:order-1"}>
          <div className="flex flex-col items-start gap-5">
          <p className="label text-lime">{stage.marker}</p>
          <h2 id={`${stage.id}-title`} className="display max-w-xl text-[clamp(2.8rem,8vw,5.75rem)]">
            {stage.heading}
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-ink-2">{stage.description}</p>
          <div className="w-full border-l border-lime bg-surface px-5 py-5">
            <p className="label mb-3 text-lime">AI stage briefing · grounded in the evidence below</p>
            {loading && <AiSkeleton />}
            {data && <AiText response={data} className="max-w-lg" />}
          </div>
          </div>

          <div className="mt-12 flex flex-col gap-10">
            <p className="label border-b border-line pb-3 text-ink">Published evidence at this stop</p>
            {stage.factIds.map((id) => (
              <div key={id} className="border-b border-line pb-10">
                <FactValue id={id} size="xl" showMetric />
              </div>
            ))}
            <div className="grid gap-8 border-l border-line pl-5 sm:grid-cols-2 sm:pl-8">
              {stage.detailFactIds.map((id) => (
                <FactValue key={id} id={id} size="md" showMetric />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
