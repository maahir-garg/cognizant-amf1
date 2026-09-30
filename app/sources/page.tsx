import type { Metadata } from "next";
import { FactTable } from "@/components/shared/fact-table";
import { FactValue } from "@/components/shared/fact-value";
import { StatusLegend } from "@/components/shared/status-badge";
import { sources } from "@/lib/data/load";

export const metadata: Metadata = { title: "Sources" };

export default function SourcesPage() {
  return (
    <div className="overflow-x-clip">
      <header className="border-b border-line">
        <div className="mx-auto grid min-h-[65vh] w-full max-w-[1440px] content-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="label">The source room</p>
            <h1 className="display mt-6 max-w-4xl text-[clamp(3.7rem,10vw,9rem)]">Open the books.</h1>
          </div>
          <div className="flex max-w-xl flex-col gap-7">
            <p className="text-lg leading-relaxed text-ink-2">
              Follow any figure back to the published page. See which results are quoted, which are calculated, and where the
              record needs a closer look.
            </p>
            <StatusLegend />
          </div>
        </div>
      </header>

      <section className="border-b border-line" aria-labelledby="documents-heading">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="label">The documents</p>
            <h2 id="documents-heading" className="display mt-4 text-[clamp(2.7rem,6vw,5rem)]">Start with the source.</h2>
            <p className="mt-5 max-w-md text-ink-2">
              The story draws from the team&apos;s reports and other named references. Each linked record shows its publisher and
              original document.
            </p>
          </div>
          <ul className="border-t border-line">
            {sources.map((source) => (
              <li key={source.id} className="group border-b border-line py-6 sm:py-8">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-start justify-between gap-6 text-xl font-semibold text-ink underline-offset-4 transition-colors hover:text-lime hover:underline sm:text-2xl"
                >
                  <span>{source.title}</span>
                  <span aria-hidden className="text-lime">↗</span>
                </a>
                <p className="label mt-3">{source.publisher}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line bg-surface" aria-labelledby="caveats-heading">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="label">Scrutineering</p>
            <h2 id="caveats-heading" className="display mt-4 text-[clamp(2.7rem,6vw,5rem)]">Caveats stay visible.</h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="max-w-2xl text-lg leading-relaxed text-ink-2">
              Published reports can restate earlier figures or use different definitions. The fact explorer keeps those flags
              beside the source so an AI explanation or partner draft cannot quietly smooth them away.
            </p>
            <div className="border-t border-line pt-6">
              <FactValue id="g25-restatement" size="md" showMetric />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-16 sm:px-6" aria-labelledby="facts-heading">
        <div>
          <p className="label">Fact explorer</p>
          <h2 id="facts-heading" className="display mt-4 text-[clamp(2.7rem,6vw,5rem)]">Inspect every claim.</h2>
          <p className="mt-5 max-w-2xl text-ink-2">
            Filter the record by topic or evidence status, then open a figure for its quote, derivation and quality notes.
          </p>
        </div>
        <FactTable />
      </section>
    </div>
  );
}
