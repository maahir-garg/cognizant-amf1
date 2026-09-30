"use client";

import { Fragment, useDeferredValue, useId, useMemo, useState, type ReactNode } from "react";
import { InlineFact } from "@/components/shared/fact-value";
import { useProvenance } from "@/components/shared/provenance";
import { Button } from "@/components/ui/button";
import { checkDraft, draftWithCitations, type DraftCheck, type DraftFinding } from "@/lib/ai/check-draft";
import { factCitation, getFact } from "@/lib/data/load";
import { draftKey } from "@/lib/partner/approvals";
import { footnotedPlainText } from "@/lib/partner/citations";
import { cn } from "@/lib/utils";
import { ApprovalPanel } from "./approval-panel";

/** Words only: the figures in it are checked like anyone else's. */
export const EXAMPLE_DRAFT =
  "This week in Singapore: Make A Mark Day reached 275 students, and 68% of them started the day unsure what skills a career in AI needs. Our real-time impact data shows the team's STEM programme has reached more than 1,000 young people in the UK and at race locations.";

const RESULT_LABEL: Record<DraftFinding["status"], string> = {
  matched: "Matched",
  held: "Held back",
  context: "Context",
};

function citationNumbers(check: DraftCheck): Map<string, number> {
  return new Map(check.factIds.map((id, i) => [id, i + 1]));
}

/** The draft with every number marked: a numbered citation chip when matched, a "held" tag when not. */
function MarkedDraft({ check }: { check: DraftCheck }) {
  const { openFact } = useProvenance();
  const numbers = citationNumbers(check);
  const marks = [
    ...check.findings.map((f) => ({ start: f.start, end: f.end, finding: f as DraftFinding | null, note: null as string | null })),
    ...check.wording.map((w) => ({ start: w.start, end: w.end, finding: null, note: w.reason })),
  ].sort((a, b) => a.start - b.start);

  const out: ReactNode[] = [];
  let last = 0;
  for (const m of marks) {
    if (m.start < last) continue;
    out.push(check.text.slice(last, m.start));
    const body = check.text.slice(m.start, m.end);
    const f = m.finding;
    if (!f) {
      out.push(
        <span key={m.start} title={m.note ?? undefined} className="underline decoration-estimated decoration-wavy decoration-1 underline-offset-4">
          {body}
        </span>,
      );
    } else if (f.status === "matched" && f.factId) {
      const n = numbers.get(f.factId);
      out.push(
        <span key={m.start} className="whitespace-nowrap">
          <span className="font-semibold underline decoration-verified decoration-2 underline-offset-4">{body}</span>
          <button
            type="button"
            onClick={() => openFact(f.factId!)}
            className="num relative -top-2 ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-line-strong px-1 font-sans text-[0.6875rem] leading-none font-semibold text-ink-2 hover:border-link hover:text-link"
            aria-label={`Source ${n}: ${getFact(f.factId).metric}`}
          >
            {n}
          </button>
        </span>,
      );
    } else if (f.status === "held") {
      out.push(
        <span key={m.start} className="whitespace-nowrap">
          <span className="rounded-sm border border-dashed border-conflict px-0.5 font-semibold text-conflict">{body}</span>
          <span className="kicker relative -top-2 ml-1 text-[0.625rem] text-conflict">Held</span>
        </span>,
      );
    } else {
      out.push(
        <span key={m.start} className="text-ink-2 underline decoration-line-strong decoration-dotted underline-offset-4">
          {body}
        </span>,
      );
    }
    last = m.end;
  }
  out.push(check.text.slice(last));

  return (
    <p className="font-serif text-[1.125rem] leading-[1.6] whitespace-pre-line text-ink">
      {out.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </p>
  );
}

function FindingDetail({ f, n }: { f: DraftFinding; n?: number }) {
  if (f.status === "matched" && f.factId) {
    const fact = getFact(f.factId);
    return (
      <div className="flex flex-col gap-1.5">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {n && <span className="num text-[0.8125rem] font-semibold text-ink-3">[{n}]</span>}
          <InlineFact id={f.factId} />
          <span className="text-[0.8125rem] text-ink-3">{factCitation(fact).label}</span>
        </span>
        <span className="text-[0.875em] leading-snug text-ink-2">{fact.metric}</span>
        {f.cautions.map((c) => (
          <span key={c} className="border-l-2 border-estimated pl-2 text-[0.875em] leading-snug text-ink">
            {c}
          </span>
        ))}
        {f.alternatives.length > 0 && (
          <span className="text-[0.8125rem] text-ink-3">
            Could also be: <span className="font-mono text-[0.75rem]">{f.alternatives.join(", ")}</span>
          </span>
        )}
      </div>
    );
  }
  if (f.status === "held") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="leading-snug text-ink">{f.reason}</span>
        {f.nearest && (
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.875em] text-ink-2">
            Closest published figure: <InlineFact id={f.nearest} />
            <span className="text-[0.8125rem] text-ink-3">
              {getFact(f.nearest).metric}, {factCitation(getFact(f.nearest)).label}
            </span>
          </span>
        )}
        {f.alternatives.length > 0 && (
          <span className="text-[0.8125rem] text-ink-3">
            Published figures with this value: <span className="font-mono text-[0.75rem]">{f.alternatives.join(", ")}</span>
          </span>
        )}
      </div>
    );
  }
  return <span className="text-ink-2">{f.reason}</span>;
}

export function DraftChecker() {
  const [text, setText] = useState(EXAMPLE_DRAFT);
  const deferred = useDeferredValue(text);
  const check = useMemo(() => checkDraft(deferred), [deferred]);
  const numbers = citationNumbers(check);
  const inputId = useId();
  const hasText = check.text.trim().length > 0;

  const blocked =
    check.held > 0
      ? `${check.held === 1 ? "One number is" : "Some numbers are"} held back. Fix or remove ${check.held === 1 ? "it" : "them"} before this goes for review.`
      : check.findings.length === 0
        ? "There are no figures to check yet."
        : undefined;

  return (
    <div className="grid gap-x-10 gap-y-10 pt-8 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
          <label htmlFor={inputId} className="text-[1.0625rem] font-semibold">
            Your draft
          </label>
          <span className="text-[0.875em] text-ink-3">Checked as you type, on this device</span>
        </div>
        <textarea
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={11}
          spellCheck
          className="min-h-64 w-full resize-y rounded-md border border-line-strong bg-surface p-4 text-base leading-relaxed text-ink"
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setText(EXAMPLE_DRAFT)}>
            Load the example
          </Button>
          <Button variant="ghost" onClick={() => setText("")}>
            Clear
          </Button>
        </div>
        <p className="text-[0.875em] text-ink-3">
          Nothing you paste leaves the browser. Every number is compared with the fact base: the value must match a published figure and
          the sentence must say what it counts. Years and ordinals are read as context.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
          <h2 className="text-[1.0625rem] font-semibold">What the fact base says</h2>
          {hasText && (
            <p className="text-[0.875em] text-ink-2" aria-live="polite">
              <span className="font-semibold text-ink">✓ {check.matched} matched</span>
              {" · "}
              <span className={cn(check.held > 0 && "font-semibold text-conflict")}>{check.held} held back</span>
              {check.wording.length > 0 && ` · ${check.wording.length} wording note${check.wording.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        {hasText ? (
          <>
            <div className="rounded-md border border-line bg-surface px-6 py-5">
              <MarkedDraft check={check} />
            </div>

            {check.findings.length > 0 && (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left text-[0.875rem] min-[1800px]:text-[0.9375rem]">
                  <thead className="border-b border-line-strong">
                    <tr>
                      <th scope="col" className="kicker py-2 pr-4 font-semibold">
                        In your draft
                      </th>
                      <th scope="col" className="kicker py-2 pr-4 font-semibold">
                        Result
                      </th>
                      <th scope="col" className="kicker py-2 font-semibold">
                        Suggested citation or reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {check.findings.map((f) => (
                      <tr key={`${f.start}-${f.raw}`} className="border-b border-line align-top">
                        <td className="num py-3 pr-4 text-right text-[1.0625rem] font-semibold whitespace-nowrap text-ink">{f.raw}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "kicker inline-flex items-center gap-1.5",
                              f.status === "matched" && "text-verified",
                              f.status === "held" && "text-conflict",
                              f.status === "context" && "text-ink-3",
                            )}
                          >
                            <span aria-hidden>{f.status === "matched" ? "✓" : f.status === "held" ? "✕" : "·"}</span>
                            {RESULT_LABEL[f.status]}
                          </span>
                        </td>
                        <td className="py-3">
                          <FindingDetail f={f} n={f.factId ? numbers.get(f.factId) : undefined} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {check.wording.length > 0 && (
              <section aria-labelledby="wording-heading" className="flex flex-col gap-2">
                <h3 id="wording-heading" className="kicker">
                  Wording notes
                </h3>
                <ul className="flex flex-col gap-2">
                  {check.wording.map((w) => (
                    <li key={`${w.start}-${w.phrase}`} className="border-l-2 border-estimated pl-3 leading-snug">
                      <span className="font-semibold">&ldquo;{w.phrase}&rdquo;</span> <span className="text-ink-2">{w.reason}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ApprovalPanel
              draftKey={draftKey("check", check.text)}
              title="Your draft"
              text={check.text}
              factIds={check.factIds}
              blockedReason={blocked}
              copyText={() => footnotedPlainText(draftWithCitations(check))}
            />
          </>
        ) : (
          <p className="text-ink-3">Paste a post, paragraph or slide note to check its figures.</p>
        )}
      </div>
    </div>
  );
}
