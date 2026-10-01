"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TracksideRow } from "@/lib/fan/trackside";

// Renewable grid is the highlighted series; generators and solar stay quiet.
const SERIES = [
  { key: "hvo" as const, label: "HVO generators", color: "var(--chart-2)" },
  { key: "grid" as const, label: "Renewable grid", color: "var(--chart-1)" },
  { key: "solar" as const, label: "Solar", color: "var(--chart-3)" },
];

function TracksideTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number; dataKey?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line-strong bg-surface p-3 font-sans text-xs">
      <p className="kicker mb-1.5">{label}</p>
      <dl className="flex flex-col gap-1">
        {SERIES.map((s) => {
          const value = payload.find((p) => p.dataKey === s.key)?.value;
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

/**
 * Stacked bars of trackside electricity by source, for the European rounds
 * the team publishes. Missing components render as gaps, not zeros. Values
 * come from the race's verified facts via lib/fan/trackside.ts.
 */
export function TracksideChart({ rows }: { rows: TracksideRow[] }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1" aria-hidden>
        {SERIES.map((s) => (
          <span key={s.key} className="kicker flex items-center gap-1.5 text-ink-2">
            <span className="inline-block size-2.5 rounded-[1px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap={rows.length > 1 ? "24%" : "60%"}>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--ink-3)", fontSize: 12, fontFamily: "var(--font-sans)" }}
              axisLine={{ stroke: "var(--line-strong)" }}
              tickLine={false}
              interval={0}
              angle={rows.length > 4 ? -35 : 0}
              textAnchor={rows.length > 4 ? "end" : "middle"}
              height={rows.length > 4 ? 64 : 24}
            />
            <YAxis tick={{ fill: "var(--ink-3)", fontSize: 12, fontFamily: "var(--font-sans)" }} tickFormatter={(v: number) => v.toLocaleString("en-GB")} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<TracksideTooltip />} cursor={{ fill: "var(--surface-2)" }} />
            {SERIES.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="trackside" fill={s.color} maxBarSize={56} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="font-sans text-xs text-ink-3">Trackside electricity by source, kWh per race weekend.</figcaption>
    </figure>
  );
}
