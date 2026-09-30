"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { InlineFact } from "@/components/shared/fact-value";
import { useProvenance } from "@/components/shared/provenance";
import { factCitation, getFact } from "@/lib/data/load";
import { cn } from "@/lib/utils";
import { checkSentence, transposed, type SentenceCheck } from "./check";

const FACT_ID = "c25-mam-day-students";

/** The draft sentence around a number. The number itself always comes from the caller. */
const draft = (n: string) => `Make A Mark Day brought ${n} students to the factory for AI, coding and careers sessions with Cognizant.`;

/**
 * A worked example of the number check, run live in the browser (and on the
 * server for the first paint): a partner's sentence with a typing slip, then
 * the corrected sentence. The slip is the published figure with two digits
 * swapped, so it is derived from the fact, never typed, and is marked as a
 * deliberate error rather than shown as a figure.
 */
export function CheckDemo() {
  const fact = getFact(FACT_ID);
  const right = new Intl.NumberFormat("en-GB").format(fact.value!);
  const slip = transposed(fact.value!);
  const wrong = useMemo(() => checkSentence(draft(slip)), [slip]);
  const fixed = useMemo(() => checkSentence(draft(right)), [right]);

  return (
    <div className="flex flex-col">
      <ol className="flex flex-col divide-y divide-line">
        <Row
          step="1"
          title="A partner writes"
          tag="Deliberate error for this example"
          check={wrong}
          note={<>The desk holds it back. It has the same digits as the published figure, so it reads as a typing slip.</>}
        />
        <Row
          step="2"
          title="Corrected"
          check={fixed}
          note={<>It passes, with a suggested citation. The guardrail then reads the cited sentence the same way it reads generated text.</>}
        />
      </ol>
      <TryIt initial={draft(slip)} />
    </div>
  );
}

function Row({ step, title, tag, check, note }: { step: string; title: string; tag?: string; check: SentenceCheck; note: ReactNode }) {
  return (
    <li className="grid gap-4 py-6 first:pt-0 last:pb-0 md:grid-cols-[10rem_1fr] md:gap-6">
      <div className="flex flex-col items-start gap-2">
        <p className="kicker text-ink">
          <span className="num mr-2 text-ink-3">{step}</span>
          {title}
        </p>
        {tag && <span className="kicker rounded-sm border border-dashed border-ink px-1.5 py-0.5 text-ink">{tag}</span>}
      </div>
      <div className="flex flex-col gap-3">
        <Sentence check={check} />
        <Outcome check={check} />
        <p className="text-[0.9375rem] leading-relaxed text-ink-2">{note}</p>
      </div>
    </li>
  );
}

/** The sentence with each number marked by its result: dashed box for held back, solid underline for matched. */
function Sentence({ check, className }: { check: SentenceCheck; className?: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  check.numbers.forEach((n, i) => {
    parts.push(check.text.slice(last, n.start));
    const raw = check.text.slice(n.start, n.end);
    parts.push(
      n.status === "held" ? (
        <span key={i} className="num rounded-sm border border-dashed border-ink px-1 font-semibold">
          <span className="sr-only">Held back: </span>
          {raw}
        </span>
      ) : n.status === "matched" ? (
        <span key={i} className="num font-semibold underline decoration-highlight decoration-2 underline-offset-4">
          {raw}
        </span>
      ) : (
        <span key={i}>{raw}</span>
      ),
    );
    last = n.end;
  });
  parts.push(check.text.slice(last));
  return (
    <blockquote className={cn("font-serif text-[length:clamp(1.25rem,1.1rem+0.5vw,1.5rem)] leading-snug text-ink", className)}>
      “{parts}”
    </blockquote>
  );
}

function Outcome({ check }: { check: SentenceCheck }) {
  const { openFact } = useProvenance();
  const held = check.numbers.filter((n) => n.status === "held");
  const matched = check.numbers.filter((n) => n.status === "matched");

  if (check.numbers.length === 0) {
    return <p className="kicker text-ink-3">No figures to check in this sentence.</p>;
  }

  if (!check.passed) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="kicker inline-flex items-center gap-2 self-start rounded-sm border border-dashed border-ink px-2 py-1 text-ink">
          Held back
        </p>
        <ul className="flex flex-col gap-1 text-[0.9375rem] text-ink">
          {held.map((n) => (
            <li key={n.start}>
              <span className="num font-semibold">{n.raw}</span> is not in the fact base.
              {n.factId && (
                <>
                  {" "}
                  Closest published figure in this sentence&apos;s terms: <InlineFact id={n.factId} />
                </>
              )}
            </li>
          ))}
          {check.guardrail?.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="kicker inline-flex items-center gap-1.5 self-start rounded-sm border border-ink px-2 py-1 text-ink">
        <span aria-hidden>✓</span> Passes · Figures checked
      </p>
      <ul className="flex flex-col gap-1 text-[0.9375rem] text-ink">
        {matched.map((n) => {
          const cite = factCitation(getFact(n.factId!));
          return (
            <li key={n.start} className="flex flex-wrap items-baseline gap-x-2">
              <span>
                <span className="num font-semibold">{n.raw}</span> matches a published figure: {getFact(n.factId!).metric}.
              </span>
              <span>
                Suggested citation:{" "}
                <button type="button" className="link" onClick={() => openFact(n.factId!)}>
                  {cite.label} ↗
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      {check.guardrail && (
        <p className="text-[0.8125rem] text-ink-3">
          Guardrail: {check.guardrail.checked.length} {check.guardrail.checked.length === 1 ? "number" : "numbers"} read, each
          matched to a cited fact (
          {[...new Set(check.guardrail.checked.map((c) => c.matchedId))].map((id, i) => (
            <span key={id}>
              {i > 0 && ", "}
              <code className="font-mono text-xs">{id}</code>
            </span>
          ))}
          ).
        </p>
      )}
    </div>
  );
}

/** A free-text box running the same check, for a judge who wants to try their own sentence. */
function TryIt({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const id = useId();
  const check = useMemo(() => checkSentence(text), [text]);
  return (
    <details className="group mt-6 border-t border-line pt-4">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 font-sans text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
          →
        </span>
        Check a sentence of your own
      </summary>
      <div className="flex flex-col gap-4 pt-2">
        <label htmlFor={id} className="text-[0.9375rem] text-ink-2">
          Edit the sentence. Every number is looked up in the fact base as you type; years are read as context.
        </label>
        <textarea
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-line-strong bg-surface p-3 font-serif text-lg leading-snug text-ink"
        />
        <div aria-live="polite" className="flex flex-col gap-3">
          <Sentence check={check} className="text-lg" />
          <Outcome check={check} />
        </div>
      </div>
    </details>
  );
}
