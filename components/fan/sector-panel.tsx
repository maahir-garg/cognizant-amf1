"use client";

import { AiText } from "@/components/shared/ai-text";
import { FactValue } from "@/components/shared/fact-value";
import { fanStoryRequest } from "@/lib/ai/requests";
import { useAiText } from "@/lib/ai/client";
import type { FanProfile } from "@/lib/data/schemas";
import type { SectorStep } from "@/lib/fan/lap";
import { AiSkeleton } from "./ai-skeleton";
import { QuizBeat, type QuizAnswer } from "./quiz-beat";
import { SectorFactTable } from "./sector-fact-table";

export function SectorPanel({
  step,
  profile,
  answers,
  onAnswer,
}: {
  step: SectorStep;
  profile: FanProfile;
  answers: Record<string, QuizAnswer>;
  onAnswer: (quizId: string, a: QuizAnswer) => void;
}) {
  const request = fanStoryRequest(profile, step.id);
  const { data, loading } = useAiText(request);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="label">{step.marker}</p>
        <h1 className="display text-[clamp(2.5rem,9vw,4rem)]">{step.heading}</h1>
        {loading && <AiSkeleton />}
        {data && <AiText response={data} className="max-w-prose" />}
      </div>

      <div className={`grid gap-6 ${step.heroFactIds.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {step.heroFactIds.map((id) => (
          <FactValue key={id} id={id} size="xl" showMetric />
        ))}
      </div>

      {step.tableFactIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="label">The sector in full</p>
          <SectorFactTable factIds={step.tableFactIds} />
        </div>
      )}

      {step.quizzes.length > 0 && (
        <div className="flex flex-col gap-4">
          {step.quizzes.map((q) => (
            <QuizBeat key={q.id} quiz={q} profile={profile} answer={answers[q.id]} onAnswer={(a) => onAnswer(q.id, a)} />
          ))}
        </div>
      )}
    </div>
  );
}
