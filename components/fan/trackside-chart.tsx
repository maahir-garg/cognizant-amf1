"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TracksideRow } from "@/lib/fan/trackside";

const SERIES = [
  { key: "hvo" as const, label: "HVO generators", color: "var(--chart-4)" },
  { key: "grid" as const, label: "Renewable grid", color: "var(--chart-2)" },
  { key: "solar" as const, label: "Solar", color: "var(--chart-1)" },
];

function TracksideTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; dataKey?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface-2 p-3 text-xs shadow-none">
      <p className="label mb-1.5">{label}</p>
      <dl className="flex flex-col gap-1">
        {SERIES.map((s) => {
          const entry = payload.find((p) => p.dataKey === s.key);
          const value = entry?.value;
          return (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-ink-2">
                <span aria-hidden className="inline-block size-2 rounded-[1px]" style={{ background: s.color }} />
                {s.label}
              </dt>
              <dd className="num text-ink">{typeof value === "number" ? `${value.toLocaleString("en-GB")} kWh` : "Not published"}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** Stacked bar of trackside electricity by source. Works for one race or many; missing components render as gaps, not zeros. */
export function TracksideChart({ rows }: { rows: TracksideRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {SERIES.map((s) => (
          <span key={s.key} className="label flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-2 rounded-[1px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap={rows.length > 1 ? "24%" : "60%"}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="label" tick={{ fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} interval={0} angle={rows.length > 4 ? -35 : 0} textAnchor={rows.length > 4 ? "end" : "middle"} height={rows.length > 4 ? 64 : 24} />
            <YAxis tick={{ fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={44} unit=" kWh" />
            <Tooltip content={<TracksideTooltip />} cursor={{ fill: "var(--surface-2)" }} />
            {SERIES.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="trackside" fill={s.color} radius={[1, 1, 0, 0]} maxBarSize={56} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
