"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { FactValue } from "@/components/shared/fact-value";
import { quizzes } from "@/lib/data/load";
import { cn } from "@/lib/utils";

const CHECK_IDS = ["q-supply-chain", "q-saf", "q-women", "q-mam-day", "q-cdp"];
const checks = CHECK_IDS.map((id) => {
  const check = quizzes.find((quiz) => quiz.id === id);
  if (!check) throw new Error(`Missing governed quiz "${id}"`);
  return check;
});

export function JourneyQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  return (
    <div className="flex flex-col divide-y divide-line border-y border-line">
      {checks.map((check) => {
        const selected = answers[check.id];
        const answered = selected !== undefined;
        const correct = selected === check.answerIndex;

        return (
          <fieldset key={check.id} className="flex flex-col gap-5 py-10">
            <legend className="text-lg font-semibold leading-snug text-ink">{check.question}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {check.options.map((option, index) => {
                const isAnswer = index === check.answerIndex;
                const isSelected = index === selected;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    aria-pressed={isSelected}
                    aria-describedby={answered ? `${check.id}-result` : undefined}
                    onClick={() => setAnswers((current) => ({ ...current, [check.id]: index }))}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors disabled:cursor-default",
                      !answered && "border-line hover:border-line-strong hover:bg-surface",
                      answered && isAnswer && "border-verified bg-verified/10",
                      answered && isSelected && !isAnswer && "border-conflict bg-conflict/10",
                      answered && !isSelected && !isAnswer && "border-line text-ink-3",
                    )}
                  >
                    <span className="flex flex-col gap-1">
                      <span>{option}</span>
                      {answered && isAnswer && (
                        <span className="label text-verified">{isSelected ? "Your choice · Published answer" : "Published answer"}</span>
                      )}
                      {answered && isSelected && !isAnswer && <span className="label text-conflict">Your choice</span>}
                    </span>
                    {answered && isAnswer && <Check className="size-4 shrink-0 text-verified" aria-hidden />}
                    {answered && isSelected && !isAnswer && <X className="size-4 shrink-0 text-conflict" aria-hidden />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div id={`${check.id}-result`} className="flex flex-col gap-4 border-l border-line pl-5" aria-live="polite">
                <p className={cn("label", correct ? "text-verified" : "text-conflict")}>
                  {correct ? "You got it" : "Here’s the published answer"}
                </p>
                <FactValue id={check.factId} size="lg" showMetric />
                <p className="max-w-prose text-sm leading-relaxed text-ink-2">{check.explainer}</p>
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
