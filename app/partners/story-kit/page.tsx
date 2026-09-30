import type { Metadata } from "next";
import { PartnerReveal } from "@/components/partner/partner-reveal";
import { StoryKitStudio } from "@/components/partner/story-kit-studio";

export const metadata: Metadata = { title: "Story kit" };

export default function StoryKitPage() {
  return (
    <div className="flex flex-col gap-12 py-10 sm:py-14 lg:gap-16 lg:py-20">
      <header className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-16">
        <div>
          <p className="label">Community story kit</p>
          <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl lg:text-7xl">Give every contribution a sourced story.</h1>
        </div>
        <div className="flex max-w-2xl flex-col justify-end gap-5">
          <p className="text-lg leading-relaxed text-ink-2">
            Select a community or charity partner. AI adapts the same governed evidence into channel-ready copy, with the source
            trail preserved and a visual asset ready to share.
          </p>
          <p className="label border-l-2 border-l-lime pl-3 text-ink-2">One evidence base, adapted for each audience</p>
        </div>
      </header>
      <PartnerReveal>
        <StoryKitStudio />
      </PartnerReveal>
    </div>
  );
}
