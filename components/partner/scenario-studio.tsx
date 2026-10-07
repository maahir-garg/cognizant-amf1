"use client";

import { Fragment, useEffect, useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { InlineFact } from "@/components/shared/fact-value";
import { EstimatedCue, StatusBadge } from "@/components/shared/status-badge";
import { Slider } from "@/components/ui/slider";
import { useAiText } from "@/lib/ai/client";
import { scenarioExplanationRequest } from "@/lib/ai/requests";
import {
  runScenario,
  SCENARIO_DEFAULTS,
  SCENARIO_LIMITS,
  scenarioDerivedValues,
  type ScenarioGroup,
  type ScenarioInput,
  type ScenarioOutput,
} from "@/lib/data/scenario";
import { cn } from "@/lib/utils";

const LEVERS: { key: keyof ScenarioInput; label: string; unit: (v: number) => string; group: string }[] = [
  { key: "mamEditions", label: "Extra Make A Mark Day editions", unit: (v) => `${v} a year`, group: "Make A Mark Day" },
  { key: "turnoutPct", label: "Turnout at those editions, against the 2025 day", unit: (v) => `${v}%`, group: "Make A Mark Day" },
  { key: "stemGrowthPct", label: "Growth in the STEM learning programme's reach", unit: (v) => `${v}%`, group: "STEM learning programme" },
  { key: "mentoringCohorts", label: "Extra Aleto-style mentoring cohorts", unit: (v) => `${v} a year`, group: "Mentoring" },
];

const GROUP_LABEL: Record<ScenarioGroup, string> = {
  "make-a-mark": "Make A Mark Day",
  stem: "STEM learning programme",
  mentoring: "Mentoring",
  total: "Across the programmes",
};

const nf = new Intl.NumberFormat("en-GB");

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/** The formula as its factors: published facts open their source, planning inputs are plain text. */
function Formula({ o, byId }: { o: ScenarioOutput; byId: Map<string, ScenarioOutput> }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      {o.terms.map((t, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden className="text-ink-3">
              {o.operator}
            </span>
          )}
          {t.kind === "fact" && <InlineFact id={t.id} />}
          {t.kind === "input" && <span className="num text-ink-2">{t.text}</span>}
          {t.kind === "output" && (
            <span className="num text-ink-2">
              {nf.format(byId.get(t.id)?.value ?? 0)} {byId.get(t.id)?.unit}
            </span>
          )}
        </Fragment>
      ))}
    </span>
  );
}

/** The total split by programme: one bar, estimated segments hatched, labels above. */
function CompositionBar({ outputs }: { outputs: ScenarioOutput[] }) {
  const parts = ["sc-mam-students", "sc-stem-extra", "sc-mentees"]
    .map((id) => outputs.find((o) => o.id === id))
    .filter((o): o is ScenarioOutput => Boolean(o));
  const total = parts.reduce((s, o) => s + o.value, 0);
  if (total === 0) return null;
  const labels = ["Make A Mark Day", "STEM programme", "Mentoring"];
  // Segments too narrow for their label get it below the bar, right-aligned, with a leader.
  const small = (o: ScenarioOutput) => o.value / total < 0.18;
  const label = (o: ScenarioOutput, i: number) => (
    <>
      <span className="font-semibold text-ink">{nf.format(o.value)}</span> {labels[i]}
    </>
  );
  return (
    <figure className="flex flex-col gap-2" aria-label="Extra young people reached, by programme">
      <div className="flex gap-0.5">
        {parts.map((o, i) =>
          o.value > 0 ? (
            <div key={o.id} className="flex min-w-0 flex-col justify-end gap-1.5" style={{ flexGrow: o.value, flexBasis: 0 }}>
              {!small(o) && <span className="num truncate text-[0.8125rem] text-ink-2">{label(o, i)}</span>}
              <span
                aria-hidden
                className={cn(
                  "block h-8 border",
                  i === 0 ? "border-highlight text-highlight" : "border-ink-3 text-ink-3",
                  "bg-[repeating-linear-gradient(45deg,currentColor_0_1.5px,transparent_1.5px_6px)]",
                )}
              />
            </div>
          ) : null,
        )}
      </div>
      {parts.some((o) => o.value > 0 && small(o)) && (
        <div className="flex flex-col items-end gap-0.5">
          {parts.map((o, i) =>
            o.value > 0 && small(o) ? (
              <span key={o.id} className="num flex items-center gap-2 text-[0.8125rem] text-ink-2">
                <span aria-hidden className="h-3 w-px bg-ink-3" />
                {label(o, i)}
              </span>
            ) : null,
          )}
        </div>
      )}
      <figcaption className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-3">
        <StatusBadge status="estimated" /> Hatched because every segment is a projection from published baselines.
      </figcaption>
    </figure>
  );
}

export function ScenarioStudio() {
  const [input, setInput] = useState<ScenarioInput>(SCENARIO_DEFAULTS);
  const debouncedInput = useDebounced(input, 400);

  const outputs = runScenario(input);
  const byId = new Map(outputs.map((o) => [o.id, o]));
  const explained = runScenario(debouncedInput);
  const request = scenarioExplanationRequest(scenarioDerivedValues(explained), explained.flatMap((o) => o.factIds));
  const { data, error, loading } = useAiText(request);
  const assumptions = [...new Set(outputs.flatMap((o) => o.assumptions))];
  const total = byId.get("sc-young-people");

  return (
    <div className="grid gap-x-12 gap-y-10 pt-8 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-4">
        <div className="border-t-2 border-ink pt-3">
          <h2 className="text-[1.0625rem] font-semibold">Planning levers</h2>
        </div>
        {LEVERS.map((l) => {
          const limits = SCENARIO_LIMITS[l.key];
          return (
            <div key={l.key} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`lever-${l.key}`} className="leading-snug text-ink">
                  <span className="kicker block text-ink-3">{l.group}</span>
                  {l.label}
                </label>
                <span className="num shrink-0 text-[1.0625rem] font-semibold text-ink">{l.unit(input[l.key])}</span>
              </div>
              <Slider
                id={`lever-${l.key}`}
                min={limits.min}
                max={limits.max}
                step={limits.step}
                value={[input[l.key]]}
                onValueChange={([v]) => setInput((prev) => ({ ...prev, [l.key]: v }))}
                aria-label={l.label}
              />
            </div>
          );
        })}
        <p className="flex flex-col gap-1 border-l-2 border-conflict pl-3 text-[0.875em] leading-snug text-ink-2">
          <StatusBadge status="conflict" />
          <span>
            The reports print two sizes for the same Aleto cohort, <InlineFact id="b25-aleto-cohort" /> and{" "}
            <InlineFact id="b25-aleto-cohort-highlights" />. Mentoring uses the smaller, so it does not overstate reach.
          </span>
        </p>
        <p className="text-[0.875em] text-ink-3">
          Levers are your planning assumptions. Every output multiplies them by a figure the team has published, and nothing else.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
            <h2 className="text-[1.0625rem] font-semibold">Projected outcomes</h2>
            <StatusBadge status="estimated" />
          </div>
          {total && (
            <div className="flex flex-col gap-2">
              <p className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <span className="big-num text-[length:clamp(3rem,2.25rem+1.25vw,4rem)] text-ink">{nf.format(total.value)}</span>
                <span className="pb-1 font-serif text-[1.25rem] leading-snug text-ink">{total.label.toLowerCase().replace(/^extra/, "more")}</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3">
                <StatusBadge status="estimated" /> · Calculated: <Formula o={total} byId={byId} />
              </p>
            </div>
          )}
          <CompositionBar outputs={outputs} />
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse max-md:block md:min-w-[40rem] text-left text-[0.875rem] min-[1800px]:text-[0.9375rem]">
            <thead className="border-b border-line-strong max-md:hidden">
              <tr>
                <th scope="col" className="kicker h-10 pr-4 font-semibold">
                  Outcome
                </th>
                <th scope="col" className="kicker h-10 pr-4 text-right font-semibold">
                  Estimate
                </th>
                <th scope="col" className="kicker h-10 font-semibold">
                  Formula
                </th>
              </tr>
            </thead>
            <tbody className="max-md:block">
              {(["make-a-mark", "stem", "mentoring"] as ScenarioGroup[]).map((g) => (
                <Fragment key={g}>
                  <tr className="max-md:block">
                    <th scope="rowgroup" colSpan={3} className="kicker pt-4 pb-1 text-left text-ink-3 max-md:block">
                      {GROUP_LABEL[g]}
                    </th>
                  </tr>
                  {outputs
                    .filter((o) => o.group === g)
                    .map((o) => (
                      <tr key={o.id} className="border-b border-line align-top max-md:flex max-md:flex-col max-md:gap-1 max-md:py-2.5">
                        <td className="py-2.5 pr-4 text-ink max-md:p-0">{o.label}</td>
                        <td className="num py-2.5 pr-4 text-right whitespace-nowrap max-md:p-0 max-md:text-left">
                          <span className="text-[1.0625rem] font-semibold text-ink">{nf.format(o.value)}</span>{" "}
                          <span className="text-ink-2">{o.unit}</span>
                          <EstimatedCue className="ml-1.5 text-xs" />
                        </td>
                        <td className="py-2.5 max-md:p-0">
                          <Formula o={o} byId={byId} />
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <details className="group">
          <summary className="kicker cursor-pointer list-none text-ink-2">
            <span className="inline-block transition-transform group-open:rotate-90">›</span> Assumptions behind these estimates
          </summary>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-ink-2">
            {assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>

        <section aria-labelledby="explain-heading" className="flex flex-col gap-3 rounded-md border border-line bg-surface p-6">
          <h2 id="explain-heading" className="kicker">
            In plain words
          </h2>
          {loading && <p className="text-ink-3">Explaining…</p>}
          {error && <p className="text-conflict">Could not explain this scenario: {error}</p>}
          {data && <AiText response={data} derived={request.derived} className="measure text-[1.0625rem]" />}
          <p className="text-[0.875em] text-ink-3">
            People reached only, scaled from the published figures.
          </p>
        </section>
      </div>
    </div>
  );
}
