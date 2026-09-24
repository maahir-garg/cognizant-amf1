import { StatusBadge } from "@/components/shared/status-badge";
import { europeanTracksideRows, missingLabel, tracksideRow, type TracksideRow } from "@/lib/fan/trackside";
import { TracksideChart } from "./trackside-chart";

/**
 * Singapore (and any round with no trackside data of its own): explains the
 * gap and shows the nine European rounds that do publish a split, so the
 * fan can see the shape of the real data without a fabricated Singapore number.
 */
export function DataGapCard({ raceName }: { raceName: string }) {
  const rows = europeanTracksideRows();
  const solarGap = missingLabel(rows, "solar");
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="label rounded-sm border border-line px-2 py-1">Data gap</span>
      </div>
      <p className="max-w-prose text-ink-2">
        Trackside energy for {raceName} isn&apos;t published. The team reports it for European rounds only, where F1 runs centralised
        paddock power. Here&apos;s that verified split across the nine European Grands Prix in 2025:
      </p>
      <TracksideChart rows={rows} />
      {solarGap && <p className="text-xs text-ink-3">Solar not published for {solarGap} — shown as a gap, not zero.</p>}
      <StatusBadge status="verified" />
    </section>
  );
}

/** A round that does publish its own trackside split (any European 2025 round). */
export function OwnTracksideCard({ raceId, raceName }: { raceId: string; raceName: string }) {
  const row: TracksideRow = tracksideRow(raceId);
  const missing = (["hvo", "grid", "solar"] as const).filter((k) => row[k] === null);
  return (
    <section className="flex flex-col gap-4">
      <p className="max-w-prose text-ink-2">This weekend&apos;s trackside electricity at {raceName}, from centralised paddock power.</p>
      <TracksideChart rows={[row]} />
      {missing.length > 0 && <p className="text-xs text-ink-3">Not published for this round: {missing.map((k) => (k === "hvo" ? "HVO generators" : k === "grid" ? "renewable grid" : "solar")).join(", ")}.</p>}
      <StatusBadge status="verified" />
    </section>
  );
}
