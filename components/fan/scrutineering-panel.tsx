"use client";

import { ShieldAlert } from "lucide-react";
import { AiText } from "@/components/shared/ai-text";
import { FactValue } from "@/components/shared/fact-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { useProvenance } from "@/components/shared/provenance";
import { fanStoryRequest } from "@/lib/ai/requests";
import { useAiText } from "@/lib/ai/client";
import { getFact } from "@/lib/data/load";
import type { FanProfile } from "@/lib/data/schemas";
import type { ScrutineeringStep } from "@/lib/fan/lap";
import { AiSkeleton } from "./ai-skeleton";
import { QuizBeat, type QuizAnswer } from "./quiz-beat";

export function ScrutineeringPanel({
  step,
  profile,
  answers,
  onAnswer,
}: {
  step: ScrutineeringStep;
  profile: FanProfile;
  answers: Record<string, QuizAnswer>;
  onAnswer: (quizId: string, a: QuizAnswer) => void;
}) {
  const request = fanStoryRequest(profile, "governance");
  const { data, loading } = useAiText(request);
  const { openFact } = useProvenance();
  const flagFact = getFact(step.flagFactId);
  const flag = flagFact.flags[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="label">{step.marker}</p>
        <h1 className="display text-[clamp(2.5rem,9vw,4rem)]">{step.heading}</h1>
        <p className="max-w-prose text-ink-2">How we know these numbers: what the team discloses, who checks it, and where its own reports disagree with themselves.</p>
        {loading && <AiSkeleton />}
        {data && <AiText response={data} className="max-w-prose" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {step.factIds.map((id) => (
          <FactValue key={id} id={id} size="md" showMetric />
        ))}
      </div>

      {flag && (
        <button
          type="button"
          onClick={() => openFact(flagFact.id)}
          className="flex flex-col gap-2 rounded-md border border-conflict/40 bg-conflict/5 p-4 text-left"
        >
          <span className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-conflict" aria-hidden />
            <StatusBadge status="conflict" />
          </span>
          <p className="text-sm font-medium text-ink">{flagFact.metric}</p>
          <p className="text-sm text-ink-2">{flag.note}</p>
          <span className="label text-ink-3">Tap to see the source pages ↗</span>
        </button>
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
