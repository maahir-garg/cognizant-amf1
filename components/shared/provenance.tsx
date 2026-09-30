"use client";

/**
 * Provenance drawer. One instance lives in the root layout; any component can
 * open it for a fact with `useProvenance().openFact(id)` or by rendering
 * <FactValue id=... />. It shows the source, page, verbatim quote, formula,
 * assumptions and data-quality flags for the fact.
 */
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { findFact, getSource, sourceLink, sourceShortName } from "@/lib/data/load";
import type { Fact } from "@/lib/data/schemas";
import { factParts, formatDate, formatFact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge, StatusMark } from "./status-badge";

type ProvenanceCtx = { openFact: (id: string) => void };
const Ctx = createContext<ProvenanceCtx | null>(null);

export function useProvenance(): ProvenanceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProvenance must be used inside <ProvenanceProvider>");
  return ctx;
}

export function ProvenanceProvider({ children }: { children: ReactNode }) {
  // A stack so derivation inputs can be explored and walked back.
  const [stack, setStack] = useState<string[]>([]);
  const openFact = useCallback((id: string) => setStack([id]), []);
  const push = useCallback((id: string) => setStack((s) => [...s, id]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const value = useMemo(() => ({ openFact }), [openFact]);
  const fact = stack.length ? findFact(stack[stack.length - 1]) : undefined;

  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet open={Boolean(fact)} onOpenChange={(open) => !open && setStack([])}>
        <SheetContent
          side="right"
          data-tone="paper"
          className="w-full gap-0 overflow-y-auto border-line-strong bg-bg p-0 sm:max-w-[480px]"
          aria-describedby={undefined}
        >
          {fact && <FactDetail fact={fact} canGoBack={stack.length > 1} onBack={pop} onOpen={push} />}
        </SheetContent>
      </Sheet>
    </Ctx.Provider>
  );
}

function FactDetail({ fact, canGoBack, onBack, onOpen }: { fact: Fact; canGoBack: boolean; onBack: () => void; onOpen: (id: string) => void }) {
  const source = fact.sourceId ? getSource(fact.sourceId) : undefined;
  const fragments = fact.quote?.split(/\s*…\s*/) ?? [];
  return (
    <div className="flex flex-col">
      <SheetHeader className="gap-4 border-b border-line p-6 pr-14">
        {canGoBack && (
          <button onClick={onBack} className="kicker -ml-1 inline-flex items-center gap-1 self-start hover:text-ink">
            <ChevronLeft className="size-3.5" /> Back
          </button>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={fact.status} />
          {fact.flags.some((f) => f.kind === "source-conflict") && <StatusBadge status="conflict" />}
          <span className="kicker text-ink-3">{PILLAR_LABELS[fact.pillar]}</span>
        </div>
        <SheetTitle className="h3 text-ink">{fact.metric}</SheetTitle>
        <SheetDescription asChild className="text-ink">
          <div>
            {fact.value === null ? (
              <p className="font-serif text-2xl leading-snug font-semibold">{fact.valueText}</p>
            ) : (
              <p className="big-num flex flex-col text-[length:clamp(2.75rem,2rem+3vw,4rem)]">
                <span>{factHeadline(fact)}</span>
                {factUnit(fact) && <span className="big-num-unit mt-1 leading-tight text-ink-2">{factUnit(fact)}</span>}
              </p>
            )}
            <p className="mt-2 text-sm text-ink-3">Period: {fact.period}</p>
          </div>
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-7 p-6 text-[0.9375rem] leading-relaxed text-ink-2">
        {source && (
          <Section title="Source">
            <p className="font-serif text-lg leading-snug text-ink">{source.title}</p>
            <p className="text-sm">{source.publisher}</p>
            <a href={sourceLink(source.id, fact.page)} target="_blank" rel="noreferrer" className="link mt-2 inline-flex items-center gap-1 self-start font-medium">
              {source.kind === "pdf" && fact.page ? `Open page ${fact.page} of the ${sourceShortName(source.id)}` : "Open the source"} <ArrowUpRight className="size-4" />
            </a>
          </Section>
        )}

        {fragments.length > 0 && (
          <Section title={fragments.length > 1 ? "Quoted from the page (table cells)" : "Quoted from the page"}>
            <blockquote className="flex flex-col gap-2 border-l-2 border-highlight bg-surface py-3 pr-4 pl-4">
              {fragments.map((f, i) => (
                <p key={i} className="font-serif text-[1.0625rem] leading-snug text-ink">
                  “{f}”
                </p>
              ))}
            </blockquote>
            <p className="mt-2 text-xs text-ink-3">
              Checked automatically: <code className="font-mono">npm run verify:data</code> finds this text on page {fact.page} and the value
              inside it.
            </p>
          </Section>
        )}

        {fact.derivation && (
          <Section title="How it's calculated">
            <p className="text-ink">{fact.derivation.formula}</p>
            <ul className="mt-3 flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
              {fact.derivation.inputs.map((id) => {
                const input = findFact(id);
                if (!input) return null;
                return (
                  <li key={id}>
                    <button onClick={() => onOpen(id)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-2">
                      <span className="line-clamp-2 text-sm text-ink-2">{input.metric}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="num text-sm font-semibold text-ink">{formatFact(input)}</span>
                        <StatusBadge status={input.status} compact />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {fact.derivation.assumptions.length > 0 && (
              <>
                <p className="kicker mt-4 text-ink-3">Assumptions</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  {fact.derivation.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            )}
          </Section>
        )}

        {fact.flags.length > 0 && (
          <Section title="Data-quality notes">
            <ul className="flex flex-col gap-3">
              {fact.flags.map((flag, i) => (
                <li key={i} className="rounded-md border border-line-strong bg-surface p-3">
                  <p className="kicker flex items-center gap-1.5 text-conflict">
                    <StatusMark status="conflict" /> {flag.kind.replace(/-/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-ink">{flag.note}</p>
                  {flag.relatedFactIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {flag.relatedFactIds.map((id) => (
                        <button key={id} onClick={() => onOpen(id)} className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs hover:border-ink">
                          {id}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {fact.notes && (
          <Section title="Notes">
            <p>{fact.notes}</p>
          </Section>
        )}

        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs">
          <div>
            <dt className="kicker text-ink-3">Fact ID</dt>
            <dd className="mt-1 font-mono break-all text-ink">{fact.id}</dd>
          </div>
          <div>
            <dt className="kicker text-ink-3">Extracted</dt>
            <dd className="num mt-1 text-ink">{formatDate(fact.extractedAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/** The figure without word units, which are set smaller beneath it. */
function factHeadline(fact: Fact): string {
  const p = factParts(fact);
  if (p.unit === "%" || p.unit === "×") return `${p.prefix}${p.value}${p.unit}${p.suffix}`;
  return `${p.prefix}${p.value}${p.suffix}`;
}

function factUnit(fact: Fact): string {
  const { unit } = factParts(fact);
  return unit === "%" || unit === "×" ? "" : unit;
}

const PILLAR_LABELS: Record<Fact["pillar"], string> = {
  environment: "Environment",
  belong: "Belong",
  community: "Community",
  governance: "Governance",
};

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col", className)}>
      <h3 className="kicker mb-2 text-ink-3">{title}</h3>
      {children}
    </section>
  );
}
