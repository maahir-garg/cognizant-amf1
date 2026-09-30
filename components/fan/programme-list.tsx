import { FactValue } from "@/components/shared/fact-value";
import { DataGap } from "@/components/shared/status-badge";
import { APP_NAME } from "@/lib/config";
import { findFact, getSource, initiatives, sourceLink, sourceShortName } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { raceCityName, raceProgrammes, WAYS_IN, type Programme } from "@/lib/fan/race";
import { SectionHead } from "./section-head";

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function whereLabel(p: Programme, race: Race): string {
  if (p.where === "online") return "Online, open anywhere";
  if (p.where === "race") return `At this race · ${p.initiative.year}`;
  return `In ${raceCityName(race)} · ${p.initiative.year}`;
}

/** One headline figure per card, with its metric as the caption: a bare percentage means nothing out of context. */
function cardFactIds(p: Programme): string[] {
  return p.initiative.factIds.filter((id) => findFact(id)?.value !== null).slice(0, 1);
}

function ProgrammeCard({ programme, race }: { programme: Programme; race: Race }) {
  const { initiative } = programme;
  const ids = cardFactIds(programme);
  const source = initiative.sourceId ? getSource(initiative.sourceId) : null;
  return (
    <article className="flex flex-col gap-4 border-t border-line-strong pt-5">
      <p className="kicker text-ink-3">{whereLabel(programme, race)}</p>
      <h3 className="h3">{initiative.name}</h3>
      <p className="font-serif text-[1.0625rem] leading-[1.45] text-ink sm:text-lg">{initiative.summary}</p>
      {ids.length > 0 && (
        <div className="border-t border-line pt-4">
          {ids.map((id) => (
            <FactValue key={id} id={id} size="md" showMetric />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1 font-sans text-[0.8125rem] text-ink-3">
        {initiative.partners.length > 0 && <p>With {joinNames(initiative.partners)}</p>}
        {/* Name the programme's page unless a figure above already cites it. */}
        {!ids.some((id) => findFact(id)?.sourceId === initiative.sourceId && findFact(id)?.page === initiative.page) && source && initiative.sourceId && (
          <a
            href={sourceLink(initiative.sourceId, initiative.page)}
            target="_blank"
            rel="noreferrer"
            className="w-fit underline decoration-1 underline-offset-[3px] hover:text-ink"
          >
            {sourceShortName(initiative.sourceId)}
            {source.kind === "pdf" && initiative.page ? `, p. ${initiative.page}` : ""} ↗
          </a>
        )}
      </div>
    </article>
  );
}

/**
 * Real routes into the programmes the team reports, for fans who want more
 * than reading: what each is, who it is for and how people join, in the
 * words of the report. Each opens to its report page. There are no official
 * sign-up links in the source record, so none are shown.
 */
function WaysIn() {
  return (
    <div className="flex flex-col gap-6 border-t border-line pt-10">
      <div className="flex flex-col gap-2">
        <h3 className="h3">Your way in</h3>
        <p className="measure font-serif text-[1.0625rem] leading-[1.45] text-ink-2">
          Want to do more than watch? These are the routes the team&apos;s programmes offer, from school to your first job.{" "}
          {APP_NAME} doesn&apos;t take sign-ups or list invented events.
        </p>
      </div>
      <ol className="grid gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {WAYS_IN.map((w) => {
          const i = initiatives.find((x) => x.id === w.initiativeId);
          if (!i) return null;
          return (
            <li key={w.initiativeId} className="flex flex-col gap-1.5 border-t border-line py-4">
              <span className="kicker text-ink-3">{w.who}</span>
              <span className="font-serif text-lg font-semibold text-ink">{i.name}</span>
              <span className="font-serif text-[1.0625rem] leading-[1.45] text-ink-2">{w.how}</span>
              {i.sourceId && (
                <a
                  href={sourceLink(i.sourceId, i.page)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit font-sans text-[0.8125rem] text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink"
                >
                  {sourceShortName(i.sourceId)}
                  {i.page ? `, p. ${i.page}` : ""} ↗
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** "#take-part": the verified programmes linked to this race, its city, or open online. Nothing invented. */
export function ProgrammeList({ race, upcoming }: { race: Race; upcoming: boolean }) {
  const programmes = raceProgrammes(race);
  const city = raceCityName(race);
  return (
    <section aria-labelledby="take-part-title" id="take-part" className="scroll-mt-20 border-t border-line">
      <div className="wrap flex flex-col gap-10 py-[clamp(64px,10vw,128px)]">
        <SectionHead
          id="take-part-title"
          kicker={upcoming ? "Take part" : "Beyond the circuit"}
          title={upcoming ? `Programmes around the race in ${city}` : `What the team reported in ${city}`}
          dek={
            upcoming
              ? "Real programmes the team has reported here or runs online. Each one opens to its page in the report."
              : "Programmes the team reported at this race or in this city, with the figures it published."
          }
        />
        {programmes.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {programmes.map((p) => (
              <ProgrammeCard key={p.initiative.id} programme={p} race={race} />
            ))}
          </div>
        ) : (
          <DataGap>The team hasn&apos;t reported a community programme at this race or in {city}.</DataGap>
        )}
        {upcoming && <WaysIn />}
      </div>
    </section>
  );
}
