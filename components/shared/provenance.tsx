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
import { findFact, getSource, sourceLink } from "@/lib/data/load";
import type { Fact } from "@/lib/data/schemas";
import { formatDate, formatFact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

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
        <SheetContent side="right" className="w-full overflow-y-auto border-line bg-surface p-0 sm:max-w-md" aria-describedby={undefined}>
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
      <SheetHeader className="gap-3 border-b border-line p-5 pr-12">
        {canGoBack && (
          <button onClick={onBack} className="label -ml-1 inline-flex items-center gap-1 self-start hover:text-ink">
            <ChevronLeft className="size-3.5" /> Back
          </button>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={fact.status} />
          {fact.flags.some((f) => f.kind === "source-conflict") && <StatusBadge status="conflict" />}
          <span className="label">{fact.pillar}</span>
        </div>
        <SheetTitle className="text-base leading-snug font-semibold text-ink">{fact.metric}</SheetTitle>
        <SheetDescription asChild>
          <div>
            <p className="num text-3xl font-semibold text-ink">{fact.value === null ? fact.valueText : formatFact(fact)}</p>
            <p className="label mt-1">Period: {fact.period}</p>
          </div>
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-6 p-5 text-sm text-ink-2">
        {source && (
          <Section title="Source">
            <p className="text-ink">{source.title}</p>
            <p>{source.publisher}</p>
            <a
              href={sourceLink(source.id, fact.page)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-medium text-lime underline-offset-4 hover:underline"
            >
              {source.kind === "pdf" ? `Open page ${fact.page}` : "Open source"} <ArrowUpRight className="size-3.5" />
            </a>
          </Section>
        )}

        {fragments.length > 0 && (
          <Section title={fragments.length > 1 ? "Quoted from the page (table cells)" : "Quoted from the page"}>
            <blockquote className="border-l-2 border-verified pl-3 text-ink">
              {fragments.map((f, i) => (
                <p key={i} className="num text-[0.8125rem] leading-relaxed">
                  “{f}”
                </p>
              ))}
            </blockquote>
            <p className="mt-2 text-xs text-ink-3">
              Checked automatically: <code className="num">npm run verify:data</code> finds this text on page {fact.page} and the value inside it.
            </p>
          </Section>
        )}

        {fact.derivation && (
          <Section title="How it's calculated">
            <p className="text-ink">{fact.derivation.formula}</p>
            <ul className="mt-3 flex flex-col divide-y divide-line rounded-md border border-line">
              {fact.derivation.inputs.map((id) => {
                const input = findFact(id);
                if (!input) return null;
                return (
                  <li key={id}>
                    <button onClick={() => onOpen(id)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-2">
                      <span className="line-clamp-2 text-xs">{input.metric}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="num text-xs text-ink">{formatFact(input)}</span>
                        <StatusBadge status={input.status} compact />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {fact.derivation.assumptions.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs">
                {fact.derivation.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {fact.flags.length > 0 && (
          <Section title="Data-quality flags">
            <ul className="flex flex-col gap-3">
              {fact.flags.map((flag, i) => (
                <li key={i} className="rounded-md border border-conflict/40 bg-conflict/5 p-3">
                  <p className="label text-conflict">{flag.kind.replace(/-/g, " ")}</p>
                  <p className="mt-1 text-ink">{flag.note}</p>
                  {flag.relatedFactIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {flag.relatedFactIds.map((id) => (
                        <button key={id} onClick={() => onOpen(id)} className="num rounded border border-line px-2 py-0.5 text-xs hover:border-lime">
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
            <dt className="label">Fact ID</dt>
            <dd className="num mt-1 break-all text-ink">{fact.id}</dd>
          </div>
          <div>
            <dt className="label">Extracted</dt>
            <dd className="num mt-1 text-ink">{formatDate(fact.extractedAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col", className)}>
      <h3 className="label mb-2">{title}</h3>
      {children}
    </section>
  );
}
