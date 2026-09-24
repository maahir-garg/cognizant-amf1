"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FanProfile } from "@/lib/data/schemas";
import { buildLap } from "@/lib/fan/lap";
import { useResolvedProfile } from "@/lib/fan/profile";
import { LapFinish } from "./lap-finish";
import { LapProgress } from "./lap-progress";
import { NoProfileCard } from "./no-profile-card";
import { ScrutineeringPanel } from "./scrutineering-panel";
import { SectorPanel } from "./sector-panel";
import type { QuizAnswer } from "./quiz-beat";

export function LapClient({ paramProfile }: { paramProfile: FanProfile | null }) {
  const profile = useResolvedProfile(paramProfile);
  return profile ? <Lap profile={profile} /> : <NoProfileCard />;
}

function Lap({ profile }: { profile: FanProfile }) {
  const steps = useMemo(() => buildLap(profile), [profile]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const reduceMotion = useReducedMotion();

  const step = steps[index];
  const canBack = index > 0;
  const canForward = index < steps.length - 1;

  function go(next: number) {
    if (next < 0 || next >= steps.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowRight" && canForward) go(index + 1);
      if (e.key === "ArrowLeft" && canBack) go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, canForward, canBack]);

  function onAnswer(quizId: string, a: QuizAnswer) {
    setAnswers((cur) => ({ ...cur, [quizId]: a }));
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -24 }),
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="sticky top-14 z-20 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <LapProgress steps={steps} current={index} />
          <p className="label">
            {step.kind === "finish" ? "Finish" : step.marker} · Step {index + 1} of {steps.length}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            {step.kind === "sector" && <SectorPanel step={step} profile={profile} answers={answers} onAnswer={onAnswer} />}
            {step.kind === "scrutineering" && <ScrutineeringPanel step={step} profile={profile} answers={answers} onAnswer={onAnswer} />}
            {step.kind === "finish" && <LapFinish />}
          </motion.div>
        </AnimatePresence>
      </div>

      {step.kind !== "finish" && (
        <div className="sticky bottom-0 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
            <Button variant="outline" disabled={!canBack} onClick={() => go(index - 1)} aria-label="Previous">
              <ChevronLeft /> Back
            </Button>
            <Button disabled={!canForward} onClick={() => go(index + 1)} aria-label="Next">
              Next <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
