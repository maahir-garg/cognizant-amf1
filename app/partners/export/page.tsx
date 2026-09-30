import { Download, FileJson } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { DeskHeader, DeskSection } from "@/components/partner/desk-header";
import { Button } from "@/components/ui/button";
import { CSV_COLUMN_KEYS } from "@/lib/partner/csv";
import { partnerMetrics, type MetricFilter } from "@/lib/partner/metrics";
import { JOINT_PARTNER_TAG } from "@/lib/partner/race-week";

export const metadata: Metadata = { title: "Impact desk: export" };

const PRESETS: { id: string; label: string; note: string; filter: MetricFilter; query: string }[] = [
  { id: "joint", label: "Joint Cognizant activity", note: "Facts tagged as joint work", filter: { tag: JOINT_PARTNER_TAG }, query: `tag=${JOINT_PARTNER_TAG}` },
  { id: "community", label: "Community pillar", note: "Education, outreach and fundraising", filter: { pillar: "community" }, query: "pillar=community" },
  { id: "verified", label: "Verified figures only", note: "Printed in a source, page recorded", filter: { status: "verified" }, query: "status=verified" },
  { id: "all", label: "Everything", note: "The whole fact base, estimates included", filter: {}, query: "" },
];

const ENDPOINT = "/api/partner/metrics";

/** The integration path in four steps. Words only; nothing here claims a live feed. */
const INTEGRATION_STEPS = [
  {
    when: "Today",
    title: "Pull the CSV or JSON",
    body: "Point Excel, Power BI or Tableau at an export URL. Every row carries its status, page and quote.",
  },
  {
    when: "Today",
    title: "Refresh when the team publishes",
    body: "Schedule the BI tool to refresh after each report. Figures change only when the team publishes new ones.",
  },
  {
    when: "Pilot",
    title: "A key and a scope per partner",
    body: "Each partner gets a key limited to its own programmes, plus the audit records of the drafts it approved.",
  },
  {
    when: "Pilot",
    title: "Hosted with a named data owner",
    body: "Run in Cognizant's cloud with the team's data owner, who signs off each new fact before it reaches the export.",
  },
];

export default async function ExportPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  return (
    <>
      <DeskHeader
        kicker="Impact desk · Export"
        title="Take the fact base into your own tools"
        dek="The same checked figures as CSV or JSON, each row with its status, source, page and quote. Read-only, no key needed, and open to a partner's BI tool."
      />

      <div className="grid gap-x-12 gap-y-12 pt-8 lg:grid-cols-12">
        <DeskSection id="presets" title="Ready-made exports" className="lg:col-span-8">
          <ul className="flex flex-col divide-y divide-line border-b border-line">
            {PRESETS.map((p) => {
              const q = p.query ? `?${p.query}` : "";
              const csv = `${ENDPOINT}?${p.query ? `${p.query}&` : ""}format=csv`;
              const rows = partnerMetrics(p.filter).length;
              return (
                <li key={p.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-semibold text-ink">{p.label}</span>
                      <span className="text-[0.875em] text-ink-3">
                        {p.note} · <span className="num">{rows}</span> rows
                      </span>
                    </p>
                    <code className="block overflow-x-auto rounded-sm bg-surface-2 px-3 py-2 font-mono text-[0.75rem] whitespace-nowrap text-ink">
                      {`curl "${origin}${ENDPOINT}${q}"`}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <a href={csv} download={`impact-desk-${p.id}.csv`}>
                        <Download /> CSV
                      </a>
                    </Button>
                    <Button asChild variant="ghost">
                      <a href={`${ENDPOINT}${q}`} target="_blank" rel="noreferrer">
                        <FileJson /> JSON
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </DeskSection>

        <DeskSection id="integration" title="How a partner connects it" note="Today, then the pilot" className="lg:col-span-8 lg:row-start-2">
          <ol className="grid gap-px overflow-hidden border-y border-line bg-line md:grid-cols-4">
            {INTEGRATION_STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-2 bg-bg py-4 md:px-4 md:first:pl-0">
                <span className="kicker text-ink-3">
                  <span className="num">{i + 1}</span> · {step.when}
                </span>
                <span className="font-semibold text-ink">{step.title}</span>
                <span className="text-[0.875em] leading-snug text-ink-2">{step.body}</span>
              </li>
            ))}
          </ol>
        </DeskSection>

        <div className="flex flex-col gap-10 lg:col-span-4 lg:row-span-2 lg:row-start-1 lg:col-start-9">
          <DeskSection id="params" title="Query parameters">
            <dl className="flex flex-col divide-y divide-line border-y border-line text-[0.875em]">
              {[
                ["pillar", "environment, belong, community or governance"],
                ["status", "verified or estimated"],
                ["tag", `e.g. ${JOINT_PARTNER_TAG}, singapore, stem`],
                ["ids", "comma-separated fact ids"],
                ["format", "json (default) or csv"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 py-2">
                  <dt className="font-mono text-[0.75rem] text-ink">{k}</dt>
                  <dd className="text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </DeskSection>
          <DeskSection id="columns" title="Columns">
            <p className="font-mono text-[0.75rem] leading-relaxed break-words text-ink-2">{CSV_COLUMN_KEYS.join(", ")}</p>
            <p className="text-[0.875em] text-ink-3">
              The JSON adds a generated-at time and the partner id. Figures are those in the fact base when you call it: updated when the
              team publishes, not live.
            </p>
          </DeskSection>
        </div>
      </div>
    </>
  );
}
