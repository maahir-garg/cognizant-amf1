import { ArrowRight, Download, FileJson } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusLegend } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DataQualityPanel } from "@/components/partner/data-quality-panel";
import { JointStrip } from "@/components/partner/joint-strip";
import { KpiGrid } from "@/components/partner/kpi-grid";
import { PARTNER_NAME } from "@/lib/config";

export const metadata: Metadata = { title: "Partner Impact Intelligence" };

export default function PartnerOverviewPage() {
  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-5 border-b border-line py-12 lg:py-16">
        <p className="kicker kicker-rule">{PARTNER_NAME} × Aston Martin Aramco</p>
        <h1 className="h1-feature">Impact desk</h1>
        <p className="dek">Published, checked figures from the team&apos;s own reports, ready to turn into content partners can publish.</p>
      </header>

      <section id="evidence" className="grid scroll-mt-28 gap-10 border-b border-line py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">The transformation</p>
          <h2 className="font-serif font-medium leading-[1.05] tracking-tight mt-4 max-w-xl text-4xl sm:text-6xl">Published data becomes useful evidence.</h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          {[
            ["Find", "Retrieve only the report facts relevant to a partner, audience and impact area."],
            ["Explain", "Turn dense disclosures into plain language while keeping citations attached."],
            ["Check", "Reject generated figures that do not match a cited fact or documented calculation."],
            ["Reuse", "Adapt one governed evidence base into briefs, scenarios and partner-ready stories."],
          ].map(([title, body]) => (
            <div key={title} className="min-h-48 bg-surface p-6 sm:p-8">
              <p className="label text-link">{title}</p>
              <p className="mt-6 max-w-sm text-lg leading-snug text-ink">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="py-16 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="label">Partner evidence</p>
            <h2 className="font-serif font-medium leading-[1.05] tracking-tight mt-3 text-4xl sm:text-6xl">The shared work, in source.</h2>
          </div>
          <StatusLegend />
        </div>
        <JointStrip />
      </div>

      <div className="border-y border-line py-16 lg:py-24">
        <KpiGrid />
      </div>

      <div className="grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
        <div>
          <p className="label">From evidence to communication</p>
          <h2 className="font-serif font-medium leading-[1.05] tracking-tight mt-3 max-w-xl text-4xl sm:text-6xl">A draft you can audit.</h2>
        </div>
        <div className="flex max-w-2xl flex-col items-start gap-6">
          <p className="text-lg leading-relaxed text-ink-2">
            Choose an audience and impact area. The system retrieves the relevant published facts, writes a plain-language draft,
            cites each claim and holds back unsupported figures. Human review remains the final editorial step.
          </p>
          <Button asChild>
            <Link href="/partners/narratives">
              Build a grounded draft <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-line py-16 lg:py-24">
        <DataQualityPanel />
      </div>

      <section className="-mx-4 flex flex-col gap-5 border-t border-line bg-surface px-4 py-10 sm:-mx-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label">Take the evidence with you</p>
          <p className="mt-2 max-w-xl text-sm text-ink-2">Export the same governed metrics shown here for analysis and reporting.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href="/api/partner/metrics?format=csv" download="partner-metrics.csv"><Download /> Export CSV</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/partner/metrics" target="_blank" rel="noreferrer" title="Open the metrics API response"><FileJson /> JSON API</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
