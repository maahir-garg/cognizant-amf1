import type { Metadata } from "next";
import Link from "next/link";
import { DeskHeader, DeskSection } from "@/components/partner/desk-header";
import { FactNotes, FactRow, FactTiles } from "@/components/partner/fact-tiles";
import { SuggestedPost } from "@/components/partner/suggested-post";
import { FactValue, InlineFact } from "@/components/shared/fact-value";
import { DataGap, StatusLegend } from "@/components/shared/status-badge";
import { PARTNER_NAME } from "@/lib/config";
import { factCitation, getFact, getSource } from "@/lib/data/load";
import { formatDate } from "@/lib/format";
import {
  jointCognizantFacts,
  progressFigures,
  POST_ANGLES,
  RACE_DATA_GAPS,
  raceFacts,
  raceInitiatives,
  raceWeekRace,
} from "@/lib/partner/race-week";

export const metadata: Metadata = { title: "Impact desk: this race week" };

/** Short, number-free tile captions for the figures this page shows. */
const CAPTIONS: Record<string, string> = {
  "c25-stem-racing-students": "Students at the STEM Racing World Finals in Singapore",
  "c25-stem-racing-countries": "Countries those students came from",
  "m-stem-programme-reach": "Young people reached by the STEM programme, UK and race locations",
  "c25-mam-day-students": "Students at Make A Mark Day, where Cognizant ran the careers sessions",
  "c25-mam-day-schools": "Schools and community groups at Make A Mark Day",
  "c25-mam-day-early-careers": "Make A Mark Day students who met the Early Careers team",
  "c25-ai-skills-gap": "Students unsure, at the start of the day, what skills AI work needs",
  "c24-mam-day-students": "Students at Make A Mark Day in British Grand Prix week, the year before",
  "c24-esg-impressions-partners": "Extra impressions when partners, Cognizant included, shared the team's stories",
};

/** "9 to 11 Oct 2026", or "30 Sept to 2 Oct 2026" across a month. */
function dateRange(start: string, end: string): string {
  const [a, b] = [formatDate(start), formatDate(end)];
  const [ad, am, ay] = a.split(" ");
  const [, bm, by] = b.split(" ");
  if (ay !== by) return `${a} to ${b}`;
  return am === bm ? `${ad} to ${b}` : `${ad} ${am} to ${b}`;
}

export default function RaceWeekPage() {
  const race = raceWeekRace();
  const published = raceFacts(race);
  const joint = jointCognizantFacts().filter((f) => !published.some((p) => p.id === f.id));
  const programmes = raceInitiatives(race);
  const latest = getSource("esg-2025");
  const progress = progressFigures();
  const restatement = getFact("g25-restatement");

  const numeric = (list: typeof published) => list.filter((f) => f.value !== null).map((f) => f.id);
  const text = (list: typeof published) => list.filter((f) => f.value === null).map((f) => f.id);

  return (
    <>
      <DeskHeader
        kicker="Impact desk · This race week"
        title={race.name}
        dek={
          <>
            {race.start && race.end && dateRange(race.start, race.end)}
            {race.circuit && ` · ${race.circuit}`}. What the team has published that you can use this week, what is new, and what is not
            published.
          </>
        }
        aside={
          <>
            <StatusLegend />
            <p className="text-[0.875em] text-ink-3">
              Updated when the team publishes. Latest: {latest.title}.
            </p>
          </>
        }
      />

      <div className="grid gap-x-12 gap-y-12 pt-8 lg:grid-cols-12">
        <DeskSection
          id="published"
          title="Published for this race"
          note={`From the programmes the reports tie to ${programmes.length ? "Singapore" : "this city"}`}
          className="lg:col-span-8"
        >
          <FactTiles ids={numeric(published)} captions={CAPTIONS} />
          <FactNotes ids={text(published)} />
          {programmes.length > 0 && (
            <p className="text-[0.875em] text-ink-3">
              Programmes: {programmes.map((p) => p.name).join("; ")}.
            </p>
          )}
        </DeskSection>

        <DeskSection id="progress" title="Progress figures to use" note="From the report's own target chart" className="lg:col-span-4">
          <div className="flex flex-col gap-3">
            <p className="text-ink-2">
              When a post talks about progress, quote these. Don&apos;t compare one year&apos;s total with another&apos;s: earlier years
              were restated.
            </p>
            <div className="flex flex-col divide-y divide-line border-y border-line">
              {progress.map((f) => (
                <FactRow key={f.id} id={f.id} label={f.label} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-[4px] border border-line bg-surface p-4">
            <p className="kicker text-conflict">Restated</p>
            <FactValue id={restatement.id} size="sm" />
            <Link href="/partners/data-quality" className="link self-start text-[0.875em] font-medium">
              See every restated and disputed figure
            </Link>
          </div>
        </DeskSection>

        <DeskSection
          id="joint"
          title={`Joint with ${PARTNER_NAME}`}
          note={`Facts tagged as joint ${PARTNER_NAME} activity`}
          className="lg:col-span-8"
        >
          <FactTiles ids={numeric(joint)} captions={CAPTIONS} />
          <FactNotes ids={text(joint)} />
        </DeskSection>

        <DeskSection id="gaps" title="Not published" note="Leave these out, or say they are not published" className="lg:col-span-4">
          <ul className="flex flex-col gap-3">
            {RACE_DATA_GAPS.map((g) => (
              <li key={g.title}>
                <DataGap label={`Data gap · ${g.title}`}>{g.body}</DataGap>
              </li>
            ))}
          </ul>
        </DeskSection>

        <DeskSection id="angles" title="Post angles for the week" note="Each angle lists the facts it rests on" className="lg:col-span-8">
          <ul className="grid gap-px overflow-hidden border-y border-line bg-line md:grid-cols-2">
            {POST_ANGLES.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 bg-bg py-5 md:px-5 md:first:pl-0 md:[&:nth-child(odd)]:pl-0">
                <h3 className="text-[1.0625rem] font-semibold text-ink">{a.title}</h3>
                <p className="text-ink-2">{a.why}</p>
                <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  {/* Figures only; the angle's words already carry the qualitative facts. */}
                  {a.factIds
                    .filter((id) => getFact(id).value !== null)
                    .map((id) => (
                      <InlineFact key={id} id={id} />
                    ))}
                  <span className="text-[0.8125rem] text-ink-3">
                    {[...new Set(a.factIds.map((id) => factCitation(getFact(id)).label))].join(" · ")}
                  </span>
                </p>
                <Link href={a.href} className="link mt-auto self-start font-medium">
                  {a.action}
                </Link>
              </li>
            ))}
          </ul>
        </DeskSection>

        <DeskSection id="suggested" title="Suggested post" note="Drafted from the fact base" className="lg:col-span-4">
          <SuggestedPost />
        </DeskSection>
      </div>
    </>
  );
}
