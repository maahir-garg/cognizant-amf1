"use client";

import { Check, X } from "lucide-react";
import { AiText } from "@/components/shared/ai-text";
import { FactValue } from "@/components/shared/fact-value";
import { quizRevealRequest } from "@/lib/ai/requests";
import { useAiText } from "@/lib/ai/client";
import type { FanProfile, Quiz } from "@/lib/data/schemas";
import { cn } from "@/lib/utils";
import { AiSkeleton } from "./ai-skeleton";

export type QuizAnswer = { selectedIndex: number; correct: boolean };

/** Question -> three options -> reveal: the fact with its status, the explainer, and a personalised AI line. */
export function QuizBeat({
  quiz,
  profile,
  answer,
  onAnswer,
}: {
  quiz: Quiz;
  profile: FanProfile;
  answer?: QuizAnswer;
  onAnswer: (a: QuizAnswer) => void;
}) {
  const answered = Boolean(answer);
  const revealRequest = answered ? quizRevealRequest(profile, quiz.id, answer!.correct) : null;
  const { data: reveal, loading } = useAiText(revealRequest);

  return (
    <div className="flex flex-col gap-4 rounded-md border border-line p-4 sm:p-5">
      <p className="label">Quiz beat</p>
      <p className="text-base leading-snug font-medium text-ink">{quiz.question}</p>
      <div className="flex flex-col gap-2">
        {quiz.options.map((opt, i) => {
          const isCorrect = i === quiz.answerIndex;
          const isSelected = answer?.selectedIndex === i;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onAnswer({ selectedIndex: i, correct: isCorrect })}
              className={cn(
                "flex min-h-11 items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default",
                !answered && "border-line hover:border-line-strong",
                answered && isCorrect && "border-verified bg-verified/10 text-ink",
                answered && isSelected && !isCorrect && "border-conflict bg-conflict/10 text-ink",
                answered && !isSelected && !isCorrect && "border-line text-ink-3",
              )}
            >
              <span>{opt}</span>
              {answered && isCorrect && <Check className="size-4 shrink-0 text-verified" aria-hidden />}
              {answered && isSelected && !isCorrect && <X className="size-4 shrink-0 text-conflict" aria-hidden />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <p className={cn("label", answer!.correct ? "text-verified" : "text-conflict")}>
            {answer!.correct ? "Correct" : "Not quite"}
          </p>
          <FactValue id={quiz.factId} size="md" showMetric />
          <p className="text-sm text-ink-2">{quiz.explainer}</p>
          {loading && <AiSkeleton lines={1} />}
          {reveal && <AiText response={reveal} showMeta={false} className="text-sm" />}
        </div>
      )}
    </div>
  );
}
