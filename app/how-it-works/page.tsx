import type { Metadata } from "next";
import Link from "next/link";
import { AiSteps } from "@/components/explainer/ai-steps";
import { CheckDemo } from "@/components/explainer/check-demo";
import { FactLink } from "@/components/explainer/fact-link";
import { LiveDraft } from "@/components/explainer/live-draft";
import { Assumption, ExplainerSection } from "@/components/explainer/section";
import { stack } from "@/components/explainer/table";
import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { DataGap, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { runGeneration } from "@/lib/ai/engine";
import { narrativeRequest } from "@/lib/ai/requests";
import { APP_NAME, PARTNER_ID } from "@/lib/config";

export const metadata: Metadata = {
  title: "How it works",
  description: `How ${APP_NAME} turns the team's published reports into a story for fans and a desk for partners, and how every generated figure is checked.`,
};

const CONTENTS = [
  ["problem", "The problem"],
  ["audiences", "Two audiences"],
  ["ai", "What the AI does"],
  ["check", "See the check work"],
  ["statuses", "What every status means"],
  ["rules", "How we handle the report"],
  ["now-and-pilot", "Now and the pilot"],
  ["measures", "Measuring the impact"],
  ["pilot", "The 2027 pilot"],
] as const;

const NOW_AND_PILOT = [
  ["Fan quick checks and cards", "Kept on the fan's device", "Counted as they happen, with consent"],
  ["Trackside energy by source", "European races in the 2025 report; a gap for Singapore", "One to two weeks after each race"],
  ["Freight by mode", "Annual total", "Monthly"],
  ["Charity totals", "Annual, as published", "Per event, once the charity confirms"],
  ["Carbon inventory (limited assurance)", "Annual", "Annual"],
] as const;

const MEASURES: { name: string; measure: string; baseline: string | { id: string; note?: string } }[] = [
  {
    name: "Partner amplification",
    measure: `Impressions from partner posts using ${APP_NAME} content`,
    baseline: { id: "c24-esg-impressions-partners" },
  },
  { name: "Comms efficiency", measure: "Time from brief to approved post", baseline: "A baseline week of manual timings" },
  {
    name: "Accuracy and trust",
    measure: "First-pass check rate; corrections after publication",
    baseline: "From the first pilot race",
  },
  {
    name: "Fan engagement",
    measure: "Story completion, chapters opened, return at the next race",
    baseline: "From the first pilot races",
  },
  {
    name: "Reach via sharing",
    measure: "Cards created and shared",
    baseline: { id: "c24-esg-posts-multiplier", note: "The team's benchmark for ESG content" },
  },
  { name: "Awareness of Cognizant's role", measure: "Consented recall", baseline: "From the first pilot race" },
  {
    name: "Brand perception",
    measure: `Sentiment on posts using ${APP_NAME} content`,
    baseline: { id: "b25-accelerate-sentiment", note: "A comparable figure the team reports" },
  },
];

const PHASES = [
  ["Q4 2026", "Data-sharing agreement, approval workflow, a baseline week of manual timings."],
  ["Pre-season to race 6", "Launch with published facts."],
  ["Mid-season", "Add one approved per-race feed, trackside energy or freight, with a named owner."],
  ["Season end", "Evaluate against the baseline and decide whether to continue."],
] as const;

export default async function HowItWorksPage() {
  // A real draft through the same engine the desk uses: cache in the offline demo, the model with a key, a template otherwise.
  const request = narrativeRequest("linkedin-post", { partnerId: PARTNER_ID, pillars: ["community"] });
  const response = await runGeneration(request);

  return (
    <article className="flex flex-col">
      <header className="wrap grid gap-x-6 gap-y-10 pt-[clamp(48px,8vw,112px)] pb-[clamp(48px,7vw,96px)] lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <p className="kicker kicker-rule">For judges and partners</p>
          <h1 className="h1-feature">How {APP_NAME} works</h1>
          <p className="dek max-w-[40ch]">
            One checked fact base, built from the team&apos;s own reports, feeds a story for fans and a desk for partners. The AI
            selects, explains, drafts and checks. It never adds a number of its own.
          </p>
        </div>
        <nav aria-label="On this page" className="hidden flex-col gap-3 lg:col-span-3 lg:col-start-10 lg:flex lg:self-end">
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
      </header>

      <ExplainerSection id="problem" kicker="The problem" title="A detailed report that very few fans will read">
        <div className="prose-body">
          <p>
            The team publishes a detailed ESG report every year, with limited external assurance of its carbon inventory, written for
            auditors and analysts. Very little of it
            reaches fans in a form they would read.
          </p>
          <p>The appetite is already there.</p>
        </div>
        <div className="grid gap-8 border-y border-line py-8 sm:grid-cols-2 sm:gap-6">
          <FactValue id="c24-esg-posts-multiplier" size="lg" caption="the impressions of a typical race weekend, for the team's ESG posts" />
          <FactValue
            id="c24-esg-impressions-partners"
            size="lg"
            caption="more impressions when partners, Cognizant among them, shared those stories"
          />
        </div>
        <div className="prose-body">
          <p>
            That retelling is done by hand, from a report that{" "}
            <FactLink id="g25-restatement">restates earlier years</FactLink> and in places{" "}
            <Link href="/sources#disagreements" className="link">
              disagrees with itself
            </Link>
            .
          </p>
          <p className="font-medium">So fans miss the story, and partners have no safe, fast way to retell it.</p>
        </div>
      </ExplainerSection>

      <ExplainerSection id="audiences" kicker="Who it serves" title="Two audiences, one fact base" wide>
        <div className="grid gap-10 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col gap-3 border-t-2 border-ink pt-4">
            <h3 className="h3">Fans</h3>
            <p className="prose-body">
              The story of the AMR26 off camera: where it is built, how it moves round the world, what powers the garage, who the
              team reaches and how far it has to go. Every figure opens to the page it came from. At the Singapore Grand Prix, fans
              find real programmes to take part in and a card worth posting.
            </p>
            <Link href="/" className="link self-start text-[0.9375rem] font-semibold">
              The story →
            </Link>
          </div>
          <div className="flex flex-col gap-3 border-t-2 border-ink pt-4">
            <h3 className="h3">Cognizant and community partners</h3>
            <p className="prose-body">
              A desk for the weekly jobs: what is relevant this race week, drafts with citations, a check for their own copy, an
              approval trail and exports for their own tools.
            </p>
            <Link href="/partners" className="link self-start text-[0.9375rem] font-semibold">
              The desk →
            </Link>
          </div>
        </div>
        <p className="measure font-serif text-[length:clamp(1.25rem,1.1rem+0.5vw,1.5rem)] leading-snug text-ink">
          A figure a fan sees in the story is the same record a partner exports, with the same page and status.
        </p>
      </ExplainerSection>

      <ExplainerSection
        id="ai"
        tone="green"
        kicker="What the AI does"
        title="Select, explain, draft, check"
        dek="Four steps, always in this order, always on the facts it is handed."
        wide
      >
        <AiSteps />
        <p className="measure text-base leading-relaxed text-ink-2">
          Every generated paragraph carries a small label, &ldquo;Figures checked&rdquo;, and says who drafted it. In the offline demo
          that is the cache or a template. With a model key, it is Gemini. The check is the same either way.
        </p>
        <div data-tone="paper" className="flex flex-col gap-6 rounded-md border border-line-strong bg-card p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-2">
            <p className="kicker text-ink-3">Generated for this page</p>
            <h3 className="h3">The four steps on one real draft</h3>
          </div>
          <LiveDraft request={request} response={response} title="A LinkedIn post for Cognizant from Community facts." />
        </div>
      </ExplainerSection>

      <ExplainerSection
        id="check"
        kicker="The guardrail"
        title="See the check work"
        dek="The same check runs on generated text and on copy a partner writes. Here it is on one sentence."
        wide
      >
        <div className="rounded-md border border-line-strong bg-card p-5 sm:p-6 lg:p-8">
          <CheckDemo />
        </div>
      </ExplainerSection>

      <ExplainerSection id="statuses" kicker="Reading the labels" title="What every status means" wide>
        <div className="grid gap-10 md:grid-cols-3 md:gap-6">
          <div className="flex flex-col gap-4 border-t border-line-strong pt-4">
            <StatusBadge status="verified" />
            <p className="text-base leading-relaxed text-ink">
              Printed in one of the team&apos;s reports, with its page and an exact quote. An automated check re-finds the quote on
              that page on every build.
            </p>
            <FactValue id="e25-saf-avoided" size="md" showMetric className="mt-auto pt-2" />
          </div>
          <div className="flex flex-col gap-4 border-t border-line-strong pt-4">
            <StatusBadge status="estimated" />
            <p className="text-base leading-relaxed text-ink">
              Calculated from verified figures. The formula, inputs and assumptions open in the drawer.
            </p>
            <FactValue id="est-airfreight-before-saf" size="md" showMetric className="mt-auto pt-2" />
          </div>
          <div className="flex flex-col gap-4 border-t border-line-strong pt-4">
            <span className="kicker text-ink-3">Data gap</span>
            <p className="text-base leading-relaxed text-ink">The team has not published this. We show the gap, not a guess.</p>
            <DataGap className="mt-auto">Singapore trackside energy is not published.</DataGap>
          </div>
        </div>
        <p className="measure text-base text-ink-2">Status is always shown as a mark and a word, never by colour alone.</p>
      </ExplainerSection>

      <ExplainerSection
        id="rules"
        kicker="Guardrails"
        title="How we handle what the report says"
        dek="The rules this prototype sets itself, following the team's own reporting."
      >
        <ul className="flex flex-col border-t border-line text-[length:clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-relaxed">
          <Rule>The team&apos;s own pillar names: Environment, Belong, Community, and Governance for reporting.</Rule>
          <Rule>
            Most of the footprint is the supply chain: <InlineFact id="e25-supply-chain-share" />. We say so plainly.
          </Rule>
          <Rule>
            Carbon removals deal with emissions the team cannot eliminate yet. We never call the team carbon negative, neutral or
            offset.
          </Rule>
          <Rule>
            Earlier years were restated, so we never compare 2024 and 2025 totals. Progress uses the report&apos;s own figures: Scope 1
            and 2 emissions are down <InlineFact id="e25-progress-scope12" absolute />, Scope 3 down{" "}
            <InlineFact id="e25-progress-scope3" absolute />.
          </Rule>
          <Rule>The paddock energy cut applies to European races. Singapore trackside energy is not published.</Rule>
          <Rule>Fan travel is not in the team&apos;s inventory. The travel tip compares modes using government factors, labelled Estimated.</Rule>
          <Rule>The pay gap only appears with the report&apos;s explanation that a pay gap is not unequal pay and reflects representation.</Rule>
          <Rule>
            Where the report disagrees with itself, the figure is flagged on{" "}
            <Link href="/sources#disagreements" className="link">
              the sources page
            </Link>{" "}
            and on the partner desk, and kept off fan pages.
          </Rule>
        </ul>
      </ExplainerSection>

      <ExplainerSection
        id="now-and-pilot"
        kicker="Honest timing"
        title="What is real now, and what is the pilot"
        dek={
          <>
            Nothing in {APP_NAME} is live today, and nothing claims to be. Every figure says &ldquo;Updated when the team
            publishes&rdquo;, with the report date.
          </>
        }
        wide
      >
        <table className={stack.table}>
          <caption className="sr-only">Data cadence now and in the pilot</caption>
          <thead className={stack.head}>
            <tr>
              <th scope="col" className={`${stack.headCell} w-[26%]`}>
                Data
              </th>
              <th scope="col" className={`${stack.headCell} w-[37%]`}>
                Now
              </th>
              <th scope="col" className={stack.headCell}>
                Pilot plan
                <span className="mt-1 block font-sans text-xs font-normal tracking-normal normal-case">
                  With an approved feed and a named owner
                </span>
              </th>
            </tr>
          </thead>
          <tbody className={stack.body}>
            {NOW_AND_PILOT.map(([data, now, pilot]) => (
              <tr key={data} className={stack.row}>
                <th scope="row" className={stack.rowHead}>
                  {data}
                </th>
                <td data-label="Now" className={`${stack.cell} text-base text-ink`}>
                  {now}
                </td>
                <td data-label="Pilot plan" className={`${stack.cell} text-base text-ink-2`}>
                  {pilot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Assumption>Pilot cadences are subject to the data owner.</Assumption>
      </ExplainerSection>

      <ExplainerSection
        id="measures"
        kicker="Impact"
        title="How we would measure the impact"
        dek="None of these are measured yet; each has a published baseline or starts in the first pilot race."
        wide
      >
        <table className={stack.table}>
          <caption className="sr-only">Impact measures and baselines</caption>
          <thead className={stack.head}>
            <tr>
              <th scope="col" className={`${stack.headCell} w-[24%]`}>
                Outcome
              </th>
              <th scope="col" className={`${stack.headCell} w-[38%]`}>
                Measure
              </th>
              <th scope="col" className={stack.headCell}>
                Baseline
              </th>
            </tr>
          </thead>
          <tbody className={stack.body}>
            {MEASURES.map((r) => (
              <tr key={r.name} className={stack.row}>
                <th scope="row" className={stack.rowHead}>
                  {r.name}
                </th>
                <td data-label="Measure" className={`${stack.cell} text-base text-ink`}>
                  {r.measure}
                </td>
                <td data-label="Baseline" className={`${stack.cell} text-base text-ink-2`}>
                  {typeof r.baseline === "string" ? (
                    r.baseline
                  ) : (
                    <span className="flex flex-col gap-1">
                      <FactValue id={r.baseline.id} size="sm" />
                      {r.baseline.note && <span className="text-[0.875rem] text-ink-3">{r.baseline.note}</span>}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Assumption>Targets for each measure are agreed with the team and Cognizant after the baseline, not before.</Assumption>
      </ExplainerSection>

      <ExplainerSection id="pilot" kicker="The pilot" title="The 2027 pilot" wide>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-3 lg:col-span-5">
            <h3 className="h3">The pilot</h3>
            <p className="text-base leading-relaxed text-ink">
              One fan story and the Impact desk, for three groups: the team&apos;s communications and sustainability staff,
              Cognizant&apos;s communications staff, and two or three Make A Mark charity partners. About six races, including a
              fly-away.
            </p>
            <Assumption />
            <h3 className="h3 mt-6">Approvals</h3>
            <p className="text-base leading-relaxed text-ink">
              Named approvers at the team and Cognizant sign off every external post, with an agreed turnaround.
            </p>
            <Assumption />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-6 lg:col-start-7">
            <h3 className="h3">Phases</h3>
            <ol className="flex flex-col border-t border-line">
              {PHASES.map(([when, what], i) => (
                <li key={when} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-line py-3">
                  <span className="num pt-0.5 text-[0.9375rem] font-semibold text-ink-3">{i + 1}</span>
                  <span className="flex flex-col gap-1">
                    <span className="kicker text-ink">{when}</span>
                    <span className="text-base leading-relaxed text-ink">{what}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Assumption />
          </div>
        </div>
        <p className="border-t border-line pt-4 text-[0.8125rem] text-ink-3">
          Pilot scope, approvals and phases are assumptions for discussion.
        </p>
      </ExplainerSection>

      <ExplainerSection id="method" kicker="Sources and method" title="Every figure goes back to a page">
        <p className="prose-body">
          Every figure comes from the team&apos;s 2025 and 2024 Make A Mark reports, the Make A Mark Manifesto and the Make A Mark web
          page, with DEFRA and EPA factors for travel comparisons. The full list, the extraction method and every flag are on the
          sources page.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button asChild size="lg">
            <Link href="/sources">Explore the sources</Link>
          </Button>
          <Link href="/" className="link text-base font-semibold">
            Read the story
          </Link>
          <Link href="/partners" className="link text-base font-semibold">
            Open the desk
          </Link>
        </div>
      </ExplainerSection>
    </article>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return <li className="border-b border-line py-3 text-ink">{children}</li>;
}
