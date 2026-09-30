"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { FactValue } from "@/components/shared/fact-value";
import { Button } from "@/components/ui/button";
import { useAiText } from "@/lib/ai/client";
import { quizRevealRequest } from "@/lib/ai/requests";
import type { FanProfile, Quiz } from "@/lib/data/schemas";
import { useFanProfile } from "@/lib/fan/profile";
import { DEFAULT_FAN, DEPTH_COPY, levelFromDepth, QUIZ_BADGE_LABEL, quickCheckQuestions, type Depth } from "@/lib/fan/quiz";
import { useDepth, useQuizBadge } from "@/lib/fan/storage";
import { cn } from "@/lib/utils";

const CHIP =
  "flex min-h-12 items-center rounded-md border border-line-strong px-3 py-2 font-sans text-base font-medium text-ink transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus";
const CHIP_ON = "has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-lime-tint has-[:checked]:px-[11px]";

function DepthToggle({ depth, onChange }: { depth: Depth; onChange: (d: Depth) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="kicker mb-2">Your depth</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DEPTH_COPY) as Depth[]).map((d) => (
          <label key={d} className={cn(CHIP, CHIP_ON, "group cursor-pointer hover:bg-paper-2")}>
            <input type="radio" name="quick-check-depth" value={d} checked={depth === d} onChange={() => onChange(d)} className="sr-only" />
            <span>
              <span aria-hidden className="hidden group-has-[:checked]:inline">
                ✓{" "}
              </span>
              {DEPTH_COPY[d].label} · {DEPTH_COPY[d].count} questions
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Reveal({ quiz, correct, fan }: { quiz: Quiz; correct: boolean; fan: FanProfile }) {
  const { data } = useAiText(quizRevealRequest(fan, quiz.id, correct));
  return (
    <div className="flex flex-col gap-5 border-l-2 border-ink pl-5">
      <p className="font-sans text-base font-semibold text-ink">{correct ? "✓ Correct, and the report agrees." : "Not quite. Here's what the report says."}</p>
      <FactValue id={quiz.factId} size="lg" showMetric />
      {data ? <AiText response={data} className="max-w-[60ch] text-lg" /> : <p className="font-serif text-lg text-ink-3">Checking the figure…</p>}
      <p className="max-w-[60ch] font-serif text-[1.0625rem] leading-[1.45] text-ink-2">{quiz.explainer}</p>
    </div>
  );
}

function Question({
  quiz,
  n,
  total,
  answer,
  onAnswer,
  fan,
}: {
  quiz: Quiz;
  n: number;
  total: number;
  answer: number | undefined;
  onAnswer: (i: number) => void;
  fan: FanProfile;
}) {
  const answered = answer !== undefined;
  return (
    <li className="flex flex-col gap-5 border-t border-line py-8 first:border-t-0 first:pt-0">
      <fieldset className="flex flex-col gap-4" disabled={answered}>
        <legend className="mb-4 flex flex-col gap-2">
          <span className="kicker text-ink-3">
            Question {n} of {total}
          </span>
          <span className="h3 block">{quiz.question}</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {quiz.options.map((option, i) => {
            const isAnswer = i === quiz.answerIndex;
            const isPicked = i === answer;
            return (
              <label
                key={option}
                className={cn(
                  CHIP,
                  "group",
                  !answered && cn(CHIP_ON, "cursor-pointer hover:bg-paper-2"),
                  answered && isAnswer && "border-2 border-ink bg-lime-tint px-[11px]",
                  answered && !isAnswer && !isPicked && "text-ink-3",
                  answered && isPicked && !isAnswer && "border-dashed",
                )}
              >
                <input type="radio" name={quiz.id} value={i} checked={isPicked} onChange={() => onAnswer(i)} className="sr-only" />
                <span className="flex flex-col gap-0.5">
                  <span>
                    {answered && isAnswer && <span aria-hidden>✓ </span>}
                    {option}
                  </span>
                  {answered && isAnswer && <span className="kicker text-ink-2">{isPicked ? "Correct, and the report agrees" : "The report's answer"}</span>}
                  {answered && isPicked && !isAnswer && <span className="kicker text-ink-3">Your answer</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {answered && <Reveal quiz={quiz} correct={answer === quiz.answerIndex} fan={fan} />}
    </li>
  );
}

/**
 * The race-week quick check: a few conceptual questions for the fan's depth,
 * each revealing the exact cited figure. Answering them all earns the badge
 * the share card can carry. No points, no leaderboard.
 */
export function QuickCheck({ depthOverride, headingLevel = "h2" }: { depthOverride?: Depth; headingLevel?: "h1" | "h2" }) {
  const [depth, setDepth] = useDepth();
  const { profile } = useFanProfile();
  const [badge, setBadge] = useQuizBadge();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (depthOverride) setDepth(depthOverride);
    // Apply a ?depth= link once; afterwards the fan's own choice wins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depthOverride]);

  const questions = quickCheckQuestions(depth);
  const fan: FanProfile = { ...(profile ?? DEFAULT_FAN), level: levelFromDepth(depth) };
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const done = answeredCount === questions.length;
  const matched = questions.filter((q) => answers[q.id] === q.answerIndex).length;

  useEffect(() => {
    if (!done) return;
    setBadge({ depth, answered: questions.length, matched, completedAt: new Date().toISOString() });
    // Record once per completion; `questions` is derived from `depth`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, depth, matched]);

  const Heading = headingLevel;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <Heading className={headingLevel === "h1" ? "h1-feature" : "h2-chapter"}>Quick check before the lights go out</Heading>
        <p className="dek">Test yourself: {questions.length} questions. Each answer opens the exact figure and the page it comes from.</p>
        <DepthToggle
          depth={depth}
          onChange={(d) => {
            setDepth(d);
            setAnswers({});
          }}
        />
        <noscript>
          <p className="font-sans text-sm text-ink-2">The quick check needs JavaScript to show answers. Every figure is also listed on the Sources page.</p>
        </noscript>
      </div>

      <ol className="flex flex-col">
        {questions.map((q, i) => (
          <Question
            key={`${depth}-${q.id}`}
            quiz={q}
            n={i + 1}
            total={questions.length}
            answer={answers[q.id]}
            onAnswer={(index) => setAnswers((a) => ({ ...a, [q.id]: index }))}
            fan={fan}
          />
        ))}
      </ol>

      <div aria-live="polite">
        {done ? (
          <div className="flex flex-col gap-4 rounded-md border-2 border-ink bg-card p-5 sm:p-6">
            <p className="kicker">Badge earned</p>
            <p className="font-serif text-[clamp(2rem,1.5rem+2vw,3rem)] leading-none font-medium">{QUIZ_BADGE_LABEL}</p>
            <p className="font-sans text-[0.9375rem] text-ink-2">
              You answered all {questions.length}; {matched} matched the report. The badge goes on your card, the score doesn&apos;t.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/share">Add it to your card →</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => setAnswers({})}>
                Start again
              </Button>
            </div>
          </div>
        ) : (
          <p className="font-sans text-[0.9375rem] text-ink-3">
            {answeredCount === 0
              ? `Answer all ${questions.length} to earn the ${QUIZ_BADGE_LABEL} badge for your card.`
              : `${answeredCount} of ${questions.length} answered. ${questions.length - answeredCount} to go for the ${QUIZ_BADGE_LABEL} badge.`}
            {badge ? ` You already hold it from an earlier check.` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
