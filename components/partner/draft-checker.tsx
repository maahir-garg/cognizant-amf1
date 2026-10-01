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

/** Right numbers, wrong framing: each one is caught for a different reason. */
export const FRAMING_EXAMPLE =
  "Cognizant brought 257 schools to Make A Mark Day. The team cut its total emissions 74%, and paddock energy emissions fell 90% at the Singapore Grand Prix. The footprint fell from 88,183 (2024) to 87,162 (2025), and the pay gap is 20.6%.";

const RESULT_LABEL: Record<DraftFinding["status"], string> = {
  matched: "Matched",
  wording: "Needs wording",
  held: "Held back",
  context: "Context",
};

const RESULT_MARK: Record<DraftFinding["status"], string> = { matched: "✓", wording: "!", held: "✕", context: "·" };

const ackKey = (f: DraftFinding) => `${f.factId}:${f.raw}:${f.needs.join("|")}`;

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
    } else if (f.status === "wording" && f.factId) {
      const n = numbers.get(f.factId);
      out.push(
        <span key={m.start} className="whitespace-nowrap">
          <span className="rounded-sm border border-estimated px-0.5 font-semibold text-estimated">{body}</span>
          <button
            type="button"
            onClick={() => openFact(f.factId!)}
            className="num relative -top-2 ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-estimated px-1 font-sans text-[0.6875rem] leading-none font-semibold text-estimated"
            aria-label={`Source ${n}, needs wording: ${getFact(f.factId).metric}`}
          >
            {n}
          </button>
          <span className="kicker relative -top-2 ml-1 text-[0.625rem] text-estimated">Reword</span>
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

/**
 * The closest published figure written the way the draft wrote its number
 * ("275" -> "257", "£1,400" -> "£1,500"). Abbreviated numbers ("144.8m")
 * are left for the writer to fix by hand.
 */
function replacementFor(f: DraftFinding): string | null {
  const value = f.nearest ? getFact(f.nearest).value : null;
  if (value === null || /[a-z]/i.test(f.raw.replace(/per ?cent/i, ""))) return null;
  // Same number, wrong unit or direction: swapping digits would fix nothing.
  if (Math.abs(value) === f.value) return null;
  const formatted = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2, useGrouping: f.raw.includes(",") || Math.abs(value) >= 10000 }).format(Math.abs(value));
  return f.raw.replace(/\d[\d,]*(?:\.\d+)?/, formatted);
}

/** Other facts a number could be, by name and page rather than id. */
function OtherFigures({ label, ids }: { label: string; ids: string[] }) {
  return (
    <span className="flex flex-col gap-0.5 text-[0.8125rem] leading-snug text-ink-3">
      <span>{label}:</span>
      {ids.map((id) => {
        const fact = getFact(id);
        return (
          <span key={id}>
            {fact.metric} ({factCitation(fact).label})
          </span>
        );
      })}
    </span>
  );
}

function FindingDetail({
  f,
  n,
  onFix,
  acknowledged,
  onAcknowledge,
}: {
  f: DraftFinding;
  n?: number;
  onFix?: (f: DraftFinding) => void;
  acknowledged?: boolean;
  onAcknowledge?: (f: DraftFinding, value: boolean) => void;
}) {
  if (f.status === "wording" && f.factId) {
    const fact = getFact(f.factId);
    return (
      <div className="flex flex-col gap-1.5">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {n && <span className="num text-[0.8125rem] font-semibold text-ink-3">[{n}]</span>}
          <InlineFact id={f.factId} />
          <span className="text-[0.8125rem] text-ink-3">{factCitation(fact).label}</span>
        </span>
        <span className="text-[0.875em] leading-snug text-ink-2">{fact.metric}</span>
        <ul className="flex flex-col gap-1">
          {f.needs.map((need) => (
            <li key={need} className="border-l-2 border-estimated pl-2 leading-snug text-ink">
              {need}
            </li>
          ))}
        </ul>
        {onAcknowledge && (
          <label className="mt-1 flex cursor-pointer items-start gap-2 text-[0.875em] text-ink-2">
            <input
              type="checkbox"
              checked={Boolean(acknowledged)}
              onChange={(e) => onAcknowledge(f, e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--racing)]"
            />
            I&apos;ve added the context elsewhere in the post; the reviewer will check it.
          </label>
        )}
      </div>
    );
  }
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
        {f.rounded && (
          <span className="text-[0.875em] leading-snug text-ink">Rounded in your draft. The published figure is shown above.</span>
        )}
        {f.alternatives.length > 0 && <OtherFigures label="Could also be" ids={f.alternatives} />}
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
        {f.nearest && onFix && replacementFor(f) && (
          <Button variant="outline" size="sm" className="self-start" onClick={() => onFix(f)}>
            Use the published figure
          </Button>
        )}
        {f.alternatives.length > 0 && <OtherFigures label="Published figures with this value" ids={f.alternatives} />}
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
  // Offsets refer to the normalised text; only splice when the draft is already in that form.
  const fix = check.text === text
    ? (f: DraftFinding) => {
        const replacement = replacementFor(f);
        if (replacement) setText(text.slice(0, f.start) + replacement + text.slice(f.end));
      }
    : undefined;
  const hasText = check.text.trim().length > 0;
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const acknowledge = (f: DraftFinding, value: boolean) =>
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (value) next.add(ackKey(f));
      else next.delete(ackKey(f));
      return next;
    });
  const unresolved = check.findings.filter((f) => f.status === "wording" && !acknowledged.has(ackKey(f))).length;

  const blocked =
    check.held > 0
      ? `${check.held === 1 ? "One number is" : "Some numbers are"} held back. Fix or remove ${check.held === 1 ? "it" : "them"} before this goes for review.`
      : unresolved > 0
        ? `${unresolved === 1 ? "One figure needs" : `${unresolved} figures need`} rewording. Reword the sentence, or tick that you've added the context.`
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
          <Button variant="outline" onClick={() => setText(FRAMING_EXAMPLE)}>
            Try right numbers, wrong framing
          </Button>
          <Button variant="ghost" onClick={() => setText("")}>
            Clear
          </Button>
        </div>
        <p className="text-[0.875em] text-ink-3">
          Nothing you paste leaves the browser. Every number is compared with the fact base: the value must match a published figure and
          the sentence must say what it counts. A right number can still need rewording: the wrong scope or place, a target stated as a
          result, a comparison of restated years, or a sensitive figure without its context. Years and ordinals are read as context.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
          <h2 className="text-[1.0625rem] font-semibold">What the fact base says</h2>
          {hasText && (
            <p className="text-[0.875em] text-ink-2" aria-live="polite">
              <span className="font-semibold text-ink">✓ {check.matched} matched</span>
              {" · "}
              <span className={cn(check.needsWording > 0 && "font-semibold text-estimated")}>{check.needsWording} need wording</span>
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
                <table className="w-full border-collapse max-md:block md:min-w-[34rem] text-left text-[0.875rem] min-[1800px]:text-[0.9375rem]">
                  <thead className="border-b border-line-strong max-md:hidden">
                    <tr>
                      <th scope="col" className="kicker py-2 pr-4 font-semibold whitespace-nowrap">
                        In your draft
                      </th>
                      <th scope="col" className="kicker py-2 pr-4 font-semibold whitespace-nowrap">
                        Result
                      </th>
                      <th scope="col" className="kicker py-2 font-semibold">
                        Suggested citation or reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="max-md:block">
                    {check.findings.map((f) => (
                      <tr key={`${f.start}-${f.raw}`} className="border-b border-line align-top max-md:grid max-md:grid-cols-[auto_minmax(0,1fr)] max-md:gap-x-4 max-md:py-3">
                        <td className="num py-3 pr-4 text-right text-[1.0625rem] font-semibold whitespace-nowrap text-ink max-md:py-0 max-md:text-left">{f.raw}</td>
                        <td className="py-3 pr-4 whitespace-nowrap max-md:py-0 max-md:self-center">
                          <span
                            className={cn(
                              "kicker inline-flex items-center gap-1.5",
                              f.status === "matched" && "text-verified",
                              f.status === "wording" && "text-estimated",
                              f.status === "held" && "text-conflict",
                              f.status === "context" && "text-ink-3",
                            )}
                          >
                            <span aria-hidden>{RESULT_MARK[f.status]}</span>
                            {RESULT_LABEL[f.status]}
                          </span>
                        </td>
                        <td className="py-3 max-md:col-span-2 max-md:pt-2 max-md:pb-0">
                          <FindingDetail
                            f={f}
                            n={f.factId ? numbers.get(f.factId) : undefined}
                            onFix={fix}
                            acknowledged={acknowledged.has(ackKey(f))}
                            onAcknowledge={acknowledge}
                          />
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
