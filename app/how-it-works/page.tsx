import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works" };

// Placeholder: the full page (problem, audiences, what the AI does, guardrail, pilot plan) replaces this.
export default function HowItWorksPage() {
  return (
    <article className="wrap flex flex-1 flex-col gap-6 py-16 lg:py-24">
      <p className="kicker kicker-rule">For judges and partners</p>
      <h1 className="h1-feature">How it works</h1>
      <p className="prose-body">
        Impact Lap reads only from a checked fact base built from the team&apos;s published reports. The AI selects the facts that
        matter to a reader, explains them in plain words and drafts partner content; a guardrail then checks every figure it writes
        against the fact it cites, and anything that does not match is held back.
      </p>
    </article>
  );
}
