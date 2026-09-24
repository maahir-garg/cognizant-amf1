import { Download, FileJson } from "lucide-react";
import type { Metadata } from "next";
import { StatusLegend } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DataQualityPanel } from "@/components/partner/data-quality-panel";
import { JointStrip } from "@/components/partner/joint-strip";
import { KpiGrid } from "@/components/partner/kpi-grid";
import { LivePanel } from "@/components/partner/live-panel";
import { HERO_RACE_ID, PARTNER_NAME } from "@/lib/config";

export const metadata: Metadata = { title: "Partner Impact Intelligence" };

export default function PartnerOverviewPage() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <p className="label">{PARTNER_NAME} × Aston Martin Aramco</p>
        <h1 className="display text-4xl sm:text-6xl">Partner Impact Intelligence</h1>
        <p className="max-w-2xl text-ink-2">
          A single, sourced view of the partnership across environment, belonging, community and governance, built for
          comms, sustainability and investor-relations use. Reporting period: the 2025 season, plus a simulated Singapore
          Grand Prix 2026 race-weekend panel below.
        </p>
        <StatusLegend />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="outline">
            <a href="/api/partner/metrics?format=csv" download="partner-metrics.csv">
              <Download /> Export CSV
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="/api/partner/metrics"
              target="_blank"
              rel="noreferrer"
              title="Field reference and curl examples: docs/partner-api.md"
            >
              <FileJson /> JSON API
            </a>
          </Button>
        </div>
      </header>

      <JointStrip />
      <KpiGrid />
      <DataQualityPanel />
      <LivePanel raceId={HERO_RACE_ID} speed={4} />
    </div>
  );
}
