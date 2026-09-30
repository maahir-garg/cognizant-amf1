import type { Metadata } from "next";
import { DeskHeader } from "@/components/partner/desk-header";
import { StoryKitStudio } from "@/components/partner/story-kit-studio";

export const metadata: Metadata = { title: "Impact desk: story kit" };

/** `?initiative=stem-racing-world-finals` opens the kit on that programme (linked from This race week). */
export default async function StoryKitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initiative = Array.isArray(params.initiative) ? params.initiative[0] : params.initiative;
  return (
    <>
      <DeskHeader
        kicker="Impact desk · Story kit for community and charity partners"
        title="Your programme's story, sourced"
        dek="For the charities and community partners the team works with: a social post, a funder report paragraph with footnotes, and a co-branded card in three sizes, all from the team's published figures."
      />
      <StoryKitStudio key={initiative ?? "default"} initialId={initiative} />
    </>
  );
}
