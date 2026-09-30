"use client";

import { useId, useMemo, useState } from "react";
import { factCitation, facts, sourceShortName } from "@/lib/data/load";
import { PILLARS, STATUSES, type Fact, type Pillar, type Status } from "@/lib/data/schemas";
import { formatFact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProvenance } from "./provenance";
import { StatusBadge, StatusMark } from "./status-badge";

const PAGE = 40;
const CALCULATED = "calculated";

const PILLAR_LABEL: Record<Pillar, string> = {
  environment: "Environment",
  belong: "Belong",
  community: "Community",
  governance: "Governance",
};

const FLAG_LABEL: Record<Fact["flags"][number]["kind"], string> = {
  "source-conflict": "Source conflict",
  restated: "Restated",
  "not-comparable": "Not comparable",
  "inconsistent-equivalence": "Inconsistent comparison",
  "ambiguous-layout": "Ambiguous layout",
};

type Filter = { pillar: Pillar | "all"; status: Status | "all"; source: string; flagged: boolean; q: string };
const EMPTY: Filter = { pillar: "all", status: "all", source: "all", flagged: false, q: "" };

const sourceKey = (f: Fact) => (f.derivation || !f.sourceId ? CALCULATED : f.sourceId);

/** Searchable, filterable list of every fact. Rows open the provenance drawer. A table from 1024 px, stacked rows below. */
export function FactTable() {
  const { openFact } = useProvenance();
  const uid = useId();
  const [f, setF] = useState<Filter>(EMPTY);
  const [showAll, setShowAll] = useState(false);

  const statuses = useMemo(() => STATUSES.filter((s) => facts.some((x) => x.status === s)), []);
  const sourceOptions = useMemo(() => {
    const ids = [...new Set(facts.map(sourceKey))];
    const count = (id: string) => facts.filter((x) => sourceKey(x) === id).length;
    return ids
      .map((id) => ({ id, label: id === CALCULATED ? "Calculated" : sourceShortName(id), n: count(id) }))
      .sort((a, b) => b.n - a.n);
  }, []);

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return facts.filter(
      (x) =>
        (f.pillar === "all" || x.pillar === f.pillar) &&
        (f.status === "all" || x.status === f.status) &&
        (f.source === "all" || sourceKey(x) === f.source) &&
        (!f.flagged || x.flags.length > 0) &&
        (!q || `${x.metric} ${x.id} ${x.topic}`.toLowerCase().includes(q)),
    );
  }, [f]);

  const filtered = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const visible = showAll ? rows : rows.slice(0, PAGE);
  const set = (patch: Partial<Filter>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setShowAll(false);
  };

  const field = "flex flex-col gap-1.5";
  const select =
    "h-12 w-full rounded-md border border-line-strong bg-surface px-3 font-sans text-base text-ink focus-visible:border-ink";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 items-end gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
        <div className={cn(field, "col-span-2 lg:col-span-1")}>
          <label htmlFor={`${uid}-q`} className="kicker text-ink-3">
            Search metrics
          </label>
          <input
            id={`${uid}-q`}
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="For example: freight, students, Scope 3"
            className="h-12 w-full rounded-md border border-line-strong bg-surface px-3 font-sans text-base text-ink placeholder:text-ink-3 focus-visible:border-ink"
          />
        </div>
        <div className={field}>
          <label htmlFor={`${uid}-pillar`} className="kicker text-ink-3">
            Pillar
          </label>
          <select id={`${uid}-pillar`} className={select} value={f.pillar} onChange={(e) => set({ pillar: e.target.value as Filter["pillar"] })}>
            <option value="all">All pillars</option>
            {PILLARS.map((p) => (
              <option key={p} value={p}>
                {PILLAR_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label htmlFor={`${uid}-status`} className="kicker text-ink-3">
            Status
          </label>
          <select id={`${uid}-status`} className={select} value={f.status} onChange={(e) => set({ status: e.target.value as Filter["status"] })}>
            <option value="all">Any status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label htmlFor={`${uid}-source`} className="kicker text-ink-3">
            Source
          </label>
          <select id={`${uid}-source`} className={select} value={f.source} onChange={(e) => set({ source: e.target.value })}>
            <option value="all">All sources</option>
            {sourceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <label
          className={cn(
            "flex h-12 cursor-pointer items-center gap-2 rounded-md px-4 font-sans text-base font-medium text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
            f.flagged ? "border-2 border-ink bg-lime-tint text-lime-ink" : "border border-line-strong",
          )}
        >
          <input type="checkbox" className="sr-only" checked={f.flagged} onChange={(e) => set({ flagged: e.target.checked })} />
          <span aria-hidden>{f.flagged ? "✓" : ""}</span>
          Flagged only
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="kicker text-ink-2" aria-live="polite">
          {rows.length === facts.length ? `All ${facts.length} facts` : `${rows.length} of ${facts.length} facts`}
        </p>
        {filtered && (
          <button type="button" onClick={() => set(EMPTY)} className="link font-sans text-sm font-semibold">
            Clear filters
          </button>
        )}
      </div>

      <div>
        <div
          aria-hidden
          className="kicker sticky top-14 z-10 hidden grid-cols-[minmax(0,1fr)_9.5rem_11rem_9rem_7rem] gap-x-6 border-y border-line-strong bg-bg py-3 text-ink-3 lg:grid"
        >
          <span>Metric</span>
          <span className="text-right">Value</span>
          <span>Status</span>
          <span>Source</span>
          <span>Pillar</span>
        </div>
        {rows.length === 0 ? (
          <p className="border-y border-line py-8 text-base text-ink-2">No facts match these filters.</p>
        ) : (
          <ul className="border-b border-line max-lg:border-t">
            {visible.map((x) => {
              const cite = factCitation(x);
              const value = x.value === null ? x.valueText : formatFact(x);
              return (
                <li key={x.id} className="border-t border-line first:border-t-0">
                  <button
                    type="button"
                    onClick={() => openFact(x.id)}
                    aria-label={`${x.metric}: ${value}. ${x.status}${x.flags.length ? ", flagged" : ""}. ${cite.label}. Show source.`}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 py-3.5 text-left transition-colors hover:bg-surface-2 lg:grid-cols-[minmax(0,1fr)_9.5rem_11rem_9rem_7rem] lg:items-baseline lg:gap-x-6 lg:py-2.5"
                  >
                    <span className="kicker col-span-2 text-ink-3 lg:hidden">
                      {PILLAR_LABEL[x.pillar]} · {cite.label}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[0.9375rem] leading-snug text-ink">{x.metric}</span>
                      <code className="hidden font-mono text-xs text-ink-3 lg:block">{x.id}</code>
                    </span>
                    <span
                      className={cn(
                        "num text-right text-[0.9375rem] font-semibold text-ink",
                        x.value === null && "max-w-[12rem] font-medium lg:max-w-none",
                      )}
                    >
                      {value}
                    </span>
                    <span className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 lg:col-span-1 lg:flex-col lg:items-start">
                      <StatusBadge status={x.status} />
                      {x.flags.map((fl) => (
                        <span key={fl.kind} className="kicker inline-flex items-center gap-1.5 whitespace-nowrap text-ink-2">
                          {fl.kind === "source-conflict" && <StatusMark status="conflict" />}
                          {FLAG_LABEL[fl.kind]}
                        </span>
                      ))}
                    </span>
                    <span className="hidden text-[0.875rem] text-ink-2 lg:block">{cite.label}</span>
                    <span className="hidden text-[0.875rem] text-ink-2 lg:block">{PILLAR_LABEL[x.pillar]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {rows.length > PAGE && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex h-10 items-center self-start rounded-md border border-ink px-4 font-sans text-[0.9375rem] font-semibold text-ink hover:bg-surface-2"
        >
          {showAll ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}
