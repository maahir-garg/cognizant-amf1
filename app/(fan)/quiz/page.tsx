import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { JourneyQuiz } from "@/components/fan/journey-quiz";

export const metadata: Metadata = { title: "Knowledge check" };

export default function QuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-col items-start gap-4">
        <Link href="/lap" className="label flex items-center gap-2 text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" /> Back to the car journey
        </Link>
        <p className="label">Optional · pit wall challenge</p>
        <h1 className="display text-[clamp(3rem,10vw,5.5rem)]">A quick pit stop</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2">
          Pick what sounds right. Each choice reveals the published fact and its source status.
        </p>
      </header>
      <JourneyQuiz />
    </main>
  );
}
