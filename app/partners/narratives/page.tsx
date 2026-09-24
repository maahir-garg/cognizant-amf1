import type { Metadata } from "next";
import { NarrativeStudio } from "@/components/partner/narrative-studio";

export const metadata: Metadata = { title: "Narratives" };

export default function NarrativesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="label">Narratives</p>
        <h1 className="display text-3xl sm:text-5xl">Draft grounded partner copy.</h1>
        <p className="max-w-2xl text-ink-2">
          Every draft is grounded only in the facts listed alongside it. The numeric guardrail rejects any figure that
          isn&apos;t cited to a fact or a documented calculation. Nothing here should be published without a final human
          read.
        </p>
      </header>
      <NarrativeStudio />
    </div>
  );
}
