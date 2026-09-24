/**
 * CSV rendering for the partner metrics export. Kept separate from the route
 * handler so it can be unit tested directly.
 */
import type { PartnerMetric } from "./metrics";

const CSV_COLUMNS: { key: string; get: (m: PartnerMetric) => string | number | null }[] = [
  { key: "id", get: (m) => m.id },
  { key: "pillar", get: (m) => m.pillar },
  { key: "topic", get: (m) => m.topic },
  { key: "metric", get: (m) => m.metric },
  { key: "value", get: (m) => m.value },
  { key: "valueText", get: (m) => m.valueText },
  { key: "unit", get: (m) => m.unit },
  { key: "period", get: (m) => m.period },
  { key: "qualifier", get: (m) => m.qualifier },
  { key: "status", get: (m) => m.status },
  { key: "sourceId", get: (m) => m.source?.id ?? null },
  { key: "sourceTitle", get: (m) => m.source?.title ?? null },
  { key: "publisher", get: (m) => m.source?.publisher ?? null },
  { key: "page", get: (m) => m.source?.page ?? null },
  { key: "url", get: (m) => m.source?.url ?? null },
  { key: "quote", get: (m) => m.quote },
  { key: "derivationFormula", get: (m) => m.derivation?.formula ?? null },
  { key: "flags", get: (m) => (m.flags.length ? m.flags.join("; ") : null) },
];

/**
 * Escapes one CSV field per RFC 4180: wraps in quotes when the value
 * contains a comma, a quote or a newline, doubling any internal quotes.
 */
export function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Header row plus one row per metric, CRLF-terminated per RFC 4180. */
export function metricsToCsv(metrics: PartnerMetric[]): string {
  const header = CSV_COLUMNS.map((c) => csvEscape(c.key)).join(",");
  const rows = metrics.map((m) => CSV_COLUMNS.map((c) => csvEscape(c.get(m))).join(","));
  return [header, ...rows].join("\r\n") + "\r\n";
}
