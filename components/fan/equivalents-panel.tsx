"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSource, sourceLink } from "@/lib/data/load";
import { fanEquivalents } from "@/lib/data/equivalents";

const FACTOR_IDS = ["silverstone-lap", "lon-nyc-return", "car-year", "tree-year"];

/** Turns a tCO2e figure into a relatable equivalent, F1-native unit first. The figure itself always comes from a fact. */
export function EquivalentsPanel({ tCO2e, factLabel }: { tCO2e: number; factLabel: string }) {
  const equivalents = fanEquivalents(tCO2e, FACTOR_IDS);
  const [selected, setSelected] = useState(FACTOR_IDS[0]);
  const active = equivalents.find((e) => e.factor.id === selected) ?? equivalents[0];
  const source = getSource(active.factor.sourceId);

  return (
    <div className="flex flex-col gap-4">
      <p className="label">{factLabel}, as</p>
      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={(v) => v && setSelected(v)}
        variant="outline"
        className="flex-wrap justify-start gap-2"
      >
        {equivalents.map((e) => (
          <ToggleGroupItem key={e.factor.id} value={e.factor.id} className="min-h-11 rounded-full px-4 text-sm">
            {e.factor.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex flex-col items-start gap-2">
        <span className="num text-5xl font-semibold text-ink sm:text-6xl">{active.display}</span>
        <span className="text-ink-2">{active.label}</span>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={active.factor.status} />
          <span className="label">{active.factor.region}</span>
          <a
            href={sourceLink(active.factor.sourceId, active.factor.page)}
            target="_blank"
            rel="noreferrer"
            className="label inline-flex items-center gap-1 text-ink-2 hover:text-lime"
          >
            {source.publisher} <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
