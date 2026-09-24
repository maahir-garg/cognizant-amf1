"use client";

import { useMemo, useState } from "react";
import { facts } from "@/lib/data/load";
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
    cn("label rounded-sm border px-2 py-1 transition-colors", active ? "border-lime text-ink" : "border-line hover:border-line-strong");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={f.q}
          onChange={(e) => setF({ ...f, q: e.target.value })}
          placeholder="Search facts"
          aria-label="Search facts"
          className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-3 sm:w-64"
        />
        {(["all", ...PILLARS] as const).map((p) => (
          <button key={p} className={chip(f.pillar === p)} onClick={() => setF({ ...f, pillar: p })}>
            {p}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} className={chip(f.status === s)} onClick={() => setF({ ...f, status: s })}>
            {s}
          </button>
        ))}
        <button className={chip(f.flagged)} onClick={() => setF({ ...f, flagged: !f.flagged })}>
          flagged only
        </button>
      </div>
      <p className="label" aria-live="polite">
        {rows.length} facts
      </p>
      <ul className="divide-y divide-line rounded-md border border-line">
        {(showAll ? rows : rows.slice(0, PAGE)).map((x) => (
          <li key={x.id}>
            <button
              onClick={() => openFact(x.id)}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-surface sm:grid-cols-[7rem_1fr_10rem_9rem]"
            >
              <span className="label hidden sm:block">{x.pillar}</span>
              <span className="text-sm text-ink">{x.metric}</span>
              <span className="num text-right text-sm text-ink sm:text-left">{x.value === null ? x.valueText : formatFact(x)}</span>
              <span className="col-span-2 flex items-center gap-3 sm:col-span-1">
                <StatusBadge status={x.status} />
                {x.flags.length > 0 && <StatusBadge status="conflict" compact />}
                {x.sourceId && <span className="label">{x.sourceId} p{x.page}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {rows.length > PAGE && (
        <button onClick={() => setShowAll(!showAll)} className="label self-start rounded-sm border border-line px-3 py-2 hover:border-lime">
          {showAll ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}
