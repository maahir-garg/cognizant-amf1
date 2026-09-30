import type { Metadata } from "next";
import { DeskHeader } from "@/components/partner/desk-header";
import { NarrativeStudio } from "@/components/partner/narrative-studio";
import { NARRATIVE_FORMATS, type NarrativeFormat } from "@/lib/ai/requests";
import { PILLARS, type Pillar } from "@/lib/data/schemas";

export const metadata: Metadata = { title: "Impact desk: narratives" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** `?format=leadership-update&focus=community` preselects the studio (links from This race week). */
export default async function NarrativesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const formatParam = one(params.format);
  const format: NarrativeFormat = NARRATIVE_FORMATS.includes(formatParam as NarrativeFormat)
    ? (formatParam as NarrativeFormat)
    : "linkedin-post";
  const focus = one(params.focus);
  const pillars: Pillar[] = focus && PILLARS.includes(focus as Pillar) ? [focus as Pillar] : focus === "all" ? [...PILLARS] : ["community"];

  return (
    <>
      <DeskHeader
        kicker="Impact desk · Narratives"
        title="Drafts you can trace to the page"
        dek="Pick a format and a focus. The draft uses only the facts listed beside it, cites every figure, and goes to a named reviewer before it can be copied."
      />
      <NarrativeStudio key={`${format}-${pillars.join(",")}`} initialFormat={format} initialPillars={pillars} />
    </>
  );
}
