/**
 * Read-only metric view of the fact base for /api/partner/metrics and the
 * CSV export. Keeps the shaping and filtering logic testable and shared
 * between the route handler and unit tests.
 */
import { facts, getSource } from "@/lib/data/load";
import type { Fact, Pillar, Status } from "@/lib/data/schemas";

export type PartnerMetric = {
  id: string;
  pillar: Pillar;
  topic: string;
  metric: string;
  value: number | null;
  valueText: string | null;
  unit: string;
  period: string;
  qualifier: string;
  status: Status;
  source: { id: string; title: string; publisher: string; page: number | null; url: string } | null;
  quote: string | null;
  derivation: { formula: string; expression: string; assumptions: string[] } | null;
  flags: string[];
};

export function factToMetric(fact: Fact): PartnerMetric {
  const source = fact.sourceId ? getSource(fact.sourceId) : undefined;
  return {
    id: fact.id,
    pillar: fact.pillar,
    topic: fact.topic,
    metric: fact.metric,
    value: fact.value,
    valueText: fact.valueText ?? null,
    unit: fact.unit,
    period: fact.period,
    qualifier: fact.qualifier,
    status: fact.status,
    source: source
      ? { id: source.id, title: source.title, publisher: source.publisher, page: fact.page ?? null, url: source.url }
      : null,
    quote: fact.quote ?? null,
    derivation: fact.derivation
      ? { formula: fact.derivation.formula, expression: fact.derivation.expression, assumptions: fact.derivation.assumptions }
      : null,
    flags: fact.flags.map((f) => f.kind),
  };
}

export type MetricFilter = {
  pillar?: string | null;
  status?: string | null;
  tag?: string | null;
  ids?: string[] | null;
};

export function filterFacts(filter: MetricFilter): Fact[] {
  return facts.filter((f) => {
    if (filter.pillar && f.pillar !== filter.pillar) return false;
    if (filter.status && f.status !== filter.status) return false;
    if (filter.tag && !f.tags.includes(filter.tag)) return false;
    if (filter.ids && filter.ids.length > 0 && !filter.ids.includes(f.id)) return false;
    return true;
  });
}

export function partnerMetrics(filter: MetricFilter = {}): PartnerMetric[] {
  return filterFacts(filter).map(factToMetric);
}
