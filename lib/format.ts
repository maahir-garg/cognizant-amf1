import type { Fact } from "@/lib/data/schemas";

const nf = (maxFrac: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: maxFrac });

/** "144.8m", "12.3k" for very large counts; full digits otherwise. */
export function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${nf(1).format(value / 1e6)}m`;
  if (abs >= 1e5) return `${nf(0).format(value / 1e3)}k`;
  return nf(abs < 10 ? 2 : abs < 1000 ? 1 : 0).format(value);
}

const UNIT_LABELS: Record<string, string> = {
  tCO2e: "tCO₂e",
  "kgCO2e/lap": "kg CO₂e / lap",
  "tCO2e/flight": "tCO₂e / flight",
};

export function unitLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit;
}

/** Number + unit split, for layouts that set the unit smaller than the figure. */
export function factParts(f: Fact): { value: string; unit: string; prefix: string; suffix: string } {
  if (f.value === null) return { value: f.valueText ?? "", unit: "", prefix: "", suffix: "" };
  const plus = f.qualifier === "at-least" ? "+" : "";
  const approx = f.qualifier === "approximately" ? "~" : "";
  if (f.unit === "GBP" || f.unit === "USD") {
    return { prefix: `${approx}${f.unit === "GBP" ? "£" : "$"}`, value: compactMoney(f.value), unit: "", suffix: plus };
  }
  if (f.unit === "%") return { prefix: approx, value: nf(1).format(f.value), unit: "%", suffix: plus };
  if (f.unit === "year") return { prefix: "", value: String(f.value), unit: "", suffix: "" };
  if (f.unit === "x") return { prefix: "", value: nf(1).format(f.value), unit: "×", suffix: "" };
  const big = f.value >= 1e5 && /impressions|students|kg|litres|cups|laps|young people/.test(f.unit);
  return {
    prefix: approx,
    value: big ? compact(f.value) : nf(f.value < 10 ? 2 : f.value < 1000 ? 2 : 0).format(f.value),
    unit: unitLabel(f.unit),
    suffix: plus,
  };
}

function compactMoney(v: number): string {
  if (v >= 1e6) return `${nf(1).format(v / 1e6)}m`;
  return nf(v % 1 === 0 ? 0 : 2).format(v);
}

/** Single-line rendering of a fact's value, e.g. "£140,000+", "87,162 tCO₂e", "16%". */
export function formatFact(f: Fact): string {
  if (f.display) return f.display;
  const p = factParts(f);
  const unit = p.unit && p.unit !== "%" && p.unit !== "×" ? ` ${p.unit}` : p.unit;
  return `${p.prefix}${p.value}${unit}${p.suffix}`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
