import type { Metadata } from "next";
import Link from "next/link";
import { FlagCases } from "@/components/explainer/flag-cases";
import { ExplainerSection } from "@/components/explainer/section";
import { stack } from "@/components/explainer/table";
import { FactTable } from "@/components/shared/fact-table";
import { DataGap, StatusLegend } from "@/components/shared/status-badge";
import { APP_NAME } from "@/lib/config";
import { conversionFactors, facts, sources, sourceShortName, travelModes } from "@/lib/data/load";
import type { Source } from "@/lib/data/schemas";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sources",
  description: `Every figure in ${APP_NAME}, the page it came from, how each quote is checked, and where the team's reports disagree with themselves.`,
};

const CONTENTS = [
  ["documents", "The documents"],
  ["facts", "Every fact"],
  ["disagreements", "Where the reports disagree"],
  ["method", "How each quote is checked"],
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Sources record publication as a year, a year and month, or a full date. */
function published(s: Source): string {
  if (!s.published) return "Not stated";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.published)) return formatDate(s.published);
  const ym = /^(\d{4})-(\d{2})$/.exec(s.published);
  if (ym) return `${MONTHS[Number(ym[2]) - 1]} ${ym[1]}`;
  return s.published;
}

const KIND_LABEL: Record<Source["kind"], string> = { pdf: "PDF report", web: "Web page", dataset: "Dataset" };

export default function SourcesPage() {
  const cited = new Map<string, number>();
  for (const f of facts) if (f.sourceId && !f.derivation) cited.set(f.sourceId, (cited.get(f.sourceId) ?? 0) + 1);
  const factors = new Map<string, number>();
  for (const c of [...conversionFactors, ...travelModes]) factors.set(c.sourceId, (factors.get(c.sourceId) ?? 0) + 1);
  const flagged = facts.filter((f) => f.flags.length > 0).length;
  const calculated = facts.filter((f) => f.status === "estimated").length;

  return (
    <article className="flex flex-col">
      <header className="wrap grid gap-x-6 gap-y-10 pt-[clamp(48px,8vw,112px)] pb-[clamp(48px,7vw,96px)] lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <p className="kicker kicker-rule">Sources and method</p>
          <h1 className="h1-feature">Every figure, and the page it came from</h1>
          <p className="dek max-w-[40ch]">
            Follow any figure back to the published page. See which results are quoted, which are calculated, and where the
            reports disagree with themselves.
          </p>
          <p className="num text-[0.9375rem] text-ink-2">
            {facts.length} facts · {sources.length} documents · {calculated} calculated · {flagged} flagged
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:self-end">
          <StatusLegend variant="list" statuses={["verified", "estimated", "conflict"]} />
          <nav aria-label="On this page" className="flex flex-col gap-3">
            <p className="kicker text-ink-3">On this page</p>
            <ol className="flex flex-col border-t border-line text-[0.9375rem]">
              {CONTENTS.map(([id, label]) => (
                <li key={id} className="border-b border-line">
                  <a href={`#${id}`} className="flex min-h-10 items-center text-ink hover:text-link hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      <ExplainerSection
        id="documents"
        kicker="The documents"
        title="Start with the source"
        dek="The team's reports first, then the public references used for travel comparisons and the race calendar."
        wide
      >
        <table className={stack.table}>
          <caption className="sr-only">Source documents</caption>
          <thead className={stack.head}>
            <tr>
              <th scope="col" className={stack.headCell}>
                Document
              </th>
              <th scope="col" className={`${stack.headCell} w-[11rem]`}>
                Published
              </th>
              <th scope="col" className={`${stack.headCell} w-[7rem] text-right`}>
                Pages
              </th>
              <th scope="col" className={`${stack.headCell} w-[9rem] text-right`}>
                Cited by
              </th>
            </tr>
          </thead>
          <tbody className={stack.body}>
            {sources.map((s) => (
              <tr key={s.id} className={stack.row}>
                <th scope="row" className={`${stack.rowHead} font-normal`}>
                  <span className="flex flex-col gap-1.5">
                    <span className="kicker text-ink-3">
                      {sourceShortName(s.id)} · {KIND_LABEL[s.kind]}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-serif text-[length:clamp(1.125rem,1.05rem+0.3vw,1.3125rem)] leading-snug font-medium text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-link"
                    >
                      {s.title} <span aria-hidden>↗</span>
                      <span className="sr-only"> (opens the original in a new tab)</span>
                    </a>
                    <span className="text-[0.875rem] text-ink-2">{s.publisher}</span>
                    {s.notes && <span className="max-w-[70ch] text-[0.875rem] leading-snug text-ink-3">{s.notes}</span>}
                  </span>
                </th>
                <td data-label="Published" className={`${stack.cell} num text-[0.9375rem] text-ink`}>
                  {published(s)}
                  <span className="block text-[0.8125rem] text-ink-3">Retrieved {formatDate(s.retrieved)}</span>
                </td>
                <td data-label="Pages" className={`${stack.cell} num text-[0.9375rem] text-ink md:text-right`}>
                  {s.pageCount ?? (s.kind === "web" ? "Web page" : "—")}
                </td>
                <td data-label="Cited by" className={`${stack.cell} num text-[0.9375rem] text-ink md:text-right`}>
                  {cited.get(s.id) ? <span className="block font-semibold">{plural(cited.get(s.id)!, "fact")}</span> : null}
                  {factors.get(s.id) ? <span className="block">{plural(factors.get(s.id)!, "travel or comparison factor")}</span> : null}
                  {!cited.get(s.id) && !factors.get(s.id) ? "Context only" : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExplainerSection>

      <ExplainerSection
        id="facts"
        kicker="Fact explorer"
        title="Every fact in the fact base"
        dek="Search by metric, filter by pillar, status or source, and open any row for its quote, page, formula and flags."
        wide
      >
        <FactTable />
      </ExplainerSection>

      <ExplainerSection
        id="disagreements"
        kicker="Governance"
        title="Where the reports disagree with themselves"
        dek="Reading the reports figure by figure turned up places where they contradict themselves. We record each one, keep it here and on the partner desk, and keep the disputed figures off fan pages."
        wide
      >
        <FlagCases />
      </ExplainerSection>

      <ExplainerSection id="method" kicker="Method" title="How each quote is checked" wide>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
          <ol className="flex flex-col border-t border-line lg:col-span-7">
            <Step n={1} title="Text, page by page">
              Each PDF is converted to plain text one page at a time and committed with the code, so the check needs no network. For the
              team&apos;s reports the page index is the printed page number.
            </Step>
            <Step n={2} title="A page and a quote for every verified figure">
              Each verified fact names its source, its page and a verbatim quote. Table cells the text layer splits apart are quoted as
              fragments.
            </Step>
            <Step n={3} title="The quote is found again">
              <code className="font-mono text-xs">npm run verify:data</code> normalises typography (ligatures, curly quotes, dashes,
              hyphenation, spacing) and checks that every fragment appears on the cited page.
            </Step>
            <Step n={4} title="The value is in the quote">
              The fact&apos;s value must appear inside its own quote, so a figure cannot drift from the words it cites.
            </Step>
            <Step n={5} title="Estimates are recalculated">
              Each estimated fact is recomputed from its inputs with its stored formula and must equal the stored value.
            </Step>
            <Step n={6} title="Every reference resolves">
              Programmes, races, quiz questions and flags must point at facts that exist, and copy phrases may not carry numbers of their
              own. The whole audit runs with the unit tests in <code className="font-mono text-xs">npm run check</code>.
            </Step>
          </ol>
          <aside className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9" aria-labelledby="gaps-heading">
            <h3 id="gaps-heading" className="h3">
              Not published, so not shown
            </h3>
            <p className="text-base leading-relaxed text-ink-2">
              Where the team has not published a figure, {APP_NAME} shows a gap rather than a guess.
            </p>
            <DataGap>Trackside energy for fly-away rounds, including Singapore.</DataGap>
            <DataGap>Emissions and freight for a single race. The closest estimate is the season total divided evenly across the rounds.</DataGap>
            <DataGap>Outcomes for most community programmes beyond headcounts.</DataGap>
            <p className="text-[0.9375rem] leading-relaxed text-ink-2">
              How the AI uses these facts, and the check on every generated number, is on{" "}
              <Link href="/how-it-works" className="link">
                how it works
              </Link>
              .
            </p>
          </aside>
        </div>
      </ExplainerSection>
    </article>
  );
}

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-line py-4">
      <span className="num pt-0.5 text-[0.9375rem] font-semibold text-ink-3">{n}</span>
      <span className="flex flex-col gap-1">
        <span className="font-sans text-base font-semibold text-ink">{title}</span>
        <span className="text-base leading-relaxed text-ink-2">{children}</span>
      </span>
    </li>
  );
}
