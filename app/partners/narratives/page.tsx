import type { Metadata } from "next";
import { NarrativeStudio } from "@/components/partner/narrative-studio";

export const metadata: Metadata = { title: "Narratives" };

export default function NarrativesPage() {
  return (
    <div className="flex flex-col gap-12 py-10 sm:py-14 lg:gap-16 lg:py-20">
      <header className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-16">
        <div>
          <p className="label">Grounded narratives</p>
          <h1 className="font-serif font-medium leading-[1.05] tracking-tight mt-4 max-w-3xl text-4xl sm:text-6xl lg:text-7xl">From disclosure to a draft you can trace.</h1>
        </div>
        <div className="flex max-w-2xl flex-col justify-end gap-5">
          <p className="text-lg leading-relaxed text-ink-2">
            AI retrieves only the published facts relevant to your choices, turns them into plain language and cites each claim.
            A numeric guardrail checks the draft before it appears.
          </p>
          <p className="label border-l-2 border-l-lime pl-3 text-ink-2">Human review remains the final editorial step</p>
        </div>
      </header>
      <div>
        <NarrativeStudio />
      </div>
    </div>
  );
}
