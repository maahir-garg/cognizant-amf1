"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { JourneyStage } from "@/lib/fan/lap";
import { cn } from "@/lib/utils";

type StageId = JourneyStage["id"];

const scenes: Record<
  StageId,
  { place: string; action: string; image: string; alt: string; position: string; detail: string }
> = {
  factory: {
    place: "Technology campus",
    action: "Build",
    image: "/brand/amr26-launch-quarter.jpg",
    alt: "Aston Martin Aramco race car viewed from the front quarter in the launch studio",
    position: "50% 54%",
    detail: "Design, energy, people and purchasing meet before the car leaves the campus.",
  },
  freight: {
    place: "Global freight",
    action: "Move",
    image: "/brand/amr26-launch-rear.jpg",
    alt: "Rear view of the Aston Martin Aramco race car in the launch studio",
    position: "50% 50%",
    detail: "The car is one part of a moving garage shaped by freight choices.",
  },
  circuit: {
    place: "Race circuit",
    action: "Run",
    image: "/brand/amr26-render-rear.jpg",
    alt: "Aston Martin Aramco race car shown from the rear on a circuit",
    position: "58% 50%",
    detail: "Trackside operations connect race energy with the host community.",
  },
  "after-race": {
    place: "After the flag",
    action: "Account",
    image: "/brand/amr26-launch-front.jpg",
    alt: "Front view of the Aston Martin Aramco race car in the launch studio",
    position: "50% 50%",
    detail: "Recovery, assurance and disclosure continue after the garage closes.",
  },
};

function SceneDiagram({ stageId }: { stageId: StageId }) {
  const common = "fill-none stroke-current";
  if (stageId === "factory") {
    return (
      <svg viewBox="0 0 180 120" className="h-20 w-28 text-ink sm:h-24 sm:w-36" aria-hidden>
        <path d="M12 106V33h154v73M28 33V14h124v19M12 55h154M52 106V55h35v51M104 106V55h35v51" className={common} strokeWidth="2" />
        <circle cx="42" cy="24" r="4" className="fill-lime" />
      </svg>
    );
  }
  if (stageId === "freight") {
    return (
      <svg viewBox="0 0 180 120" className="h-20 w-28 text-ink sm:h-24 sm:w-36" aria-hidden>
        <path d="M12 101h156M25 52h62v49H25zM96 65h59v36H96zM25 68h62M96 79h59M43 52v49M69 52v49M115 65v36M140 65v36M22 40h137l-18-26H42z" className={common} strokeWidth="2" />
        <path d="M42 14h99" className="stroke-lime" strokeWidth="3" />
      </svg>
    );
  }
  if (stageId === "circuit") {
    return (
      <svg viewBox="0 0 180 120" className="h-20 w-28 text-ink sm:h-24 sm:w-36" aria-hidden>
        <path d="M12 104h156M31 89h119L137 35H44zM39 61h104M20 89 12 66h156l-9 23M40 35V14M140 35V14M40 20h100" className={common} strokeWidth="2" />
        <path d="m40 20 20 12 20-12 20 12 20-12 20 12" className="fill-none stroke-lime" strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 180 120" className="h-20 w-28 text-ink sm:h-24 sm:w-36" aria-hidden>
      <path d="M38 10h105v100H38zM55 31h71M55 47h71M55 63h71M55 94V78h18v16M83 94V70h18v24M111 94V57h17v37" className={common} strokeWidth="2" />
      <path d="M55 94h73" className="stroke-lime" strokeWidth="3" />
    </svg>
  );
}

export function JourneyStageVisual({
  stageId,
  active = true,
  compact = false,
  className,
}: {
  stageId: StageId;
  active?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const scene = scenes[stageId];

  return (
    <figure
      className={cn(
        "relative isolate overflow-hidden rounded-md border border-line bg-surface",
        compact ? "aspect-[4/3]" : "min-h-[27rem] sm:min-h-[34rem]",
        className,
      )}
    >
      <motion.div
        key={stageId}
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0.55, scale: 1.025 }}
        animate={{ opacity: active ? 1 : 0.72, scale: active ? 1 : 1.015 }}
        transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
      >
        <Image
          src={scene.image}
          alt={scene.alt}
          fill
          priority={stageId === "factory"}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          style={{ objectPosition: scene.position }}
        />
      </motion.div>

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-bg/90 px-4 py-3 sm:px-5">
        <div>
          <p className="label text-ink">{scene.place}</p>
          <p className="mt-1 text-sm text-ink-2">Car path · {scene.action}</p>
        </div>
        <span className="label rounded-full border border-line-strong px-3 py-1.5 text-ink-2">Scroll to move</span>
      </div>

      <figcaption className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-4 rounded-sm border border-line bg-bg/90 p-3 sm:inset-x-5 sm:bottom-5 sm:p-4">
        <div className="max-w-sm border-l border-lime pl-3">
          <p className="label text-lime">Operational lens</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2 sm:text-sm">{scene.detail}</p>
        </div>
        <SceneDiagram stageId={stageId} />
      </figcaption>
    </figure>
  );
}
