"use client";

import { useMemo, useState } from "react";
import { factCitation, facts } from "@/lib/data/load";
import { PILLARS, STATUSES, type Pillar, type Status } from "@/lib/data/schemas";
import { formatFact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProvenance } from "./provenance";
import { StatusBadge } from "./status-badge";

const PAGE = 30;

type Filter = { pillar: Pillar | "all"; status: Status | "all"; flagged: boolean; q: string };

/** Searchable list of every fact. Rows open the provenance drawer. */
export function FactTable() {
  const { openFact } = useProvenance();
  const [f, setF] = useState<Filter>({ pillar: "all", status: "all", flagged: false, q: "" });
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return facts.filter(
      (x) =>
        (f.pillar === "all" || x.pillar === f.pillar) &&
        (f.status === "all" || x.status === f.status) &&
        (!f.flagged || x.flags.length > 0) &&
        (!q || `${x.metric} ${x.id} ${x.topic}`.toLowerCase().includes(q)),
    );
  }, [f]);

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-10 items-center gap-1 rounded-md px-3 text-sm font-medium capitalize transition-colors",
      active ? "border-2 border-ink bg-lime-tint text-lime-ink" : "border border-line-strong text-ink-2 hover:text-ink",
    );
  const tick = (active: boolean) => (active ? <span aria-hidden>✓</span> : null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={f.q}
          onChange={(e) => setF({ ...f, q: e.target.value })}
          placeholder="Search facts"
          aria-label="Search facts"
          className="h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-3 sm:w-80"
        />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by pillar">
          {(["all", ...PILLARS] as const).map((p) => (
            <button key={p} className={chip(f.pillar === p)} aria-pressed={f.pillar === p} onClick={() => setF({ ...f, pillar: p })}>
              {tick(f.pillar === p)} {p === "all" ? "All pillars" : p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} className={chip(f.status === s)} aria-pressed={f.status === s} onClick={() => setF({ ...f, status: s })}>
              {tick(f.status === s)} {s === "all" ? "Any status" : s}
            </button>
          ))}
          <button className={chip(f.flagged)} aria-pressed={f.flagged} onClick={() => setF({ ...f, flagged: !f.flagged })}>
            {tick(f.flagged)} Flagged only
          </button>
        </div>
      </div>
      <p className="kicker text-ink-3" aria-live="polite">
        {rows.length} facts
      </p>
      <div className="border-t border-line-strong">
        <div
          aria-hidden
          className="kicker hidden grid-cols-[7rem_1fr_10rem_12rem] gap-x-4 border-b border-line py-2 text-ink-3 sm:grid"
        >
          <span>Pillar</span>
          <span>Metric</span>
          <span className="text-right">Value</span>
          <span>Status and source</span>
        </div>
        <ul className="divide-y divide-line border-b border-line">
          {(showAll ? rows : rows.slice(0, PAGE)).map((x) => (
            <li key={x.id}>
              <button
                onClick={() => openFact(x.id)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-left hover:bg-surface sm:grid-cols-[7rem_1fr_10rem_12rem]"
              >
                <span className="kicker hidden text-ink-3 sm:block">{x.pillar}</span>
                <span className="text-[0.9375rem] leading-snug text-ink">{x.metric}</span>
                <span className="num text-right text-[0.9375rem] font-semibold text-ink">{x.value === null ? x.valueText : formatFact(x)}</span>
                <span className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:col-span-1">
                  <StatusBadge status={x.status} />
                  {x.flags.length > 0 && <StatusBadge status="conflict" compact />}
                  <span className="text-[0.8125rem] text-ink-3">{factCitation(x).label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {rows.length > PAGE && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="inline-flex h-10 items-center self-start rounded-md border border-ink px-4 text-[0.9375rem] font-semibold text-ink hover:bg-surface-2"
        >
          {showAll ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}
