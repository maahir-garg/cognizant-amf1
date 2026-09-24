"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AiText } from "@/components/shared/ai-text";
import { InlineFact } from "@/components/shared/fact-value";
import { Slider } from "@/components/ui/slider";
import { useAiText } from "@/lib/ai/client";
import { scenarioExplanationRequest } from "@/lib/ai/requests";
import { getFact } from "@/lib/data/load";
import { runScenario, scenarioDerivedValues, SCENARIO_DEFAULTS, SCENARIO_LIMITS, type ScenarioInput } from "@/lib/data/scenario";

const SLIDER_META: { key: keyof ScenarioInput; label: string; unit: string }[] = [
  { key: "stemEditions", label: "Extra race-weekend STEM day editions", unit: "editions / year" },
  { key: "turnoutPct", label: "Expected turnout vs the 2025 Make A Mark Day", unit: "%" },
  { key: "mentoringCohorts", label: "Extra Aleto-style mentoring cohorts", unit: "cohorts / year" },
  { key: "safReductionPct", label: "SAF-driven air-freight reduction target", unit: "%" },
];

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function ScenarioStudio() {
  const [input, setInput] = useState<ScenarioInput>(SCENARIO_DEFAULTS);
  const debouncedInput = useDebounced(input, 400);

  const liveOutputs = runScenario(input);
  const debouncedOutputs = runScenario(debouncedInput);
  const factIds = [...new Set(debouncedOutputs.flatMap((o) => o.factIds))];
  const request = scenarioExplanationRequest(scenarioDerivedValues(debouncedOutputs), factIds);
  const { data, error, loading } = useAiText(request);

  const safToday = getFact("e25-saf-avoided").value ?? 0;
  const safOutput = liveOutputs.find((o) => o.id === "sc-saf-avoided");
  const chartData = safOutput
    ? [
        { name: "2025 (today)", value: Math.round(safToday) },
        { name: "Scenario", value: Math.round(safOutput.value) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {SLIDER_META.map((s) => {
          const limits = SCENARIO_LIMITS[s.key];
          return (
            <div key={s.key} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={`scenario-${s.key}`} className="text-sm text-ink">
                  {s.label}
                </label>
                <span className="num text-sm text-ink-2">
                  {input[s.key]} {s.unit}
                </span>
              </div>
              <Slider
                id={`scenario-${s.key}`}
                min={limits.min}
                max={limits.max}
                step={limits.step}
                value={[input[s.key]]}
                onValueChange={([v]) => setInput((prev) => ({ ...prev, [s.key]: v }))}
                aria-label={s.label}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <p className="label">Projected outcomes</p>
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="label p-3 font-normal">Outcome</th>
                <th className="label p-3 text-right font-normal">Value</th>
                <th className="label p-3 font-normal">Formula</th>
                <th className="label p-3 font-normal">Input facts</th>
              </tr>
            </thead>
            <tbody>
              {liveOutputs.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="p-3 text-ink">{o.label}</td>
                  <td className="num p-3 text-right text-ink">
                    {o.value.toLocaleString("en-GB")} {o.unit}
                  </td>
                  <td className="p-3 text-xs text-ink-2">{o.formula}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {o.factIds.map((id) => (
                        <InlineFact key={id} id={id} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {liveOutputs.some((o) => o.assumptions.length > 0) && (
          <ul className="list-disc space-y-1 pl-4 text-xs text-ink-3">
            {[...new Set(liveOutputs.flatMap((o) => o.assumptions))].map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="label">SAF-avoided emissions: today vs scenario</p>
          <div className="h-48 rounded-md border border-line bg-surface p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tick={{ fill: "#bcc8c2", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString("en-GB")} tCO2e`, "SAF avoided"]}
                  contentStyle={{ background: "#163029", border: "1px solid #264a40", borderRadius: 6, color: "#f3f1ea" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="value" radius={4} fill="#cedc00" maxBarSize={40} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-6">
        <p className="label">What this means</p>
        {loading && <p className="text-sm text-ink-3">Explaining…</p>}
        {error && <p className="text-sm text-conflict">Could not generate an explanation: {error}</p>}
        {data && <AiText response={data} derived={request.derived} />}
        <p className="text-xs text-ink-3">This model covers carbon only. SAF cost is not published, so no financial figure is shown.</p>
      </div>
    </div>
  );
}
