import type { Metadata } from "next";
import { StoryKitStudio } from "@/components/partner/story-kit-studio";

export const metadata: Metadata = { title: "Story kit" };

export default function StoryKitPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="label">Community partner story kit</p>
        <h1 className="display text-3xl sm:text-5xl">Tell a partner&apos;s story, sourced.</h1>
        <p className="max-w-2xl text-ink-2">
          For the team&apos;s community and charity partners rather than Cognizant itself: a grounded social post, a short
          summary, and a shareable card sized for Instagram and LinkedIn (1080 × 1350 px).
        </p>
      </header>
      <StoryKitStudio />
    </div>
  );
}
