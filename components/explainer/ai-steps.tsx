const STEPS = [
  {
    name: "Select",
    body: "For each chapter, race or partner request, the app picks the facts that are relevant and allowed. Disputed figures stay off fan pages. Pay-gap figures are never used for personalisation. Only the chosen fact ids are sent to the model.",
  },
  {
    name: "Explain",
    body: "The model writes a short paragraph in plain words, at the depth the reader chose, and cites each claim with the fact it came from.",
  },
  {
    name: "Draft",
    body: "The same method writes partner formats: a LinkedIn post, a race-week brief, a leadership update, a funder report paragraph for charities.",
  },
  {
    name: "Check",
    body: "A guardrail reads every number in the text and holds it back unless it matches a fact the text cites. A draft that fails is retried once with the reasons, then replaced by a template built only from the facts. The same check runs on copy a partner pastes into Check my draft.",
  },
] as const;

/**
 * The four AI steps as a plain sequence: boxes joined by arrows, across at
 * 1024 px and wider, stacked below. No icons.
 */
export function AiSteps() {
  return (
    <ol className="grid gap-10 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.name} className="relative flex flex-col gap-3 rounded-md border border-line-strong p-5 lg:p-6">
          <p className="flex items-baseline gap-3">
            <span className="big-num text-[2.5rem] text-highlight">{i + 1}</span>
            <span className="h3 text-ink">{s.name}</span>
          </p>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">{s.body}</p>
          {i < STEPS.length - 1 && (
            <span
              aria-hidden
              className="absolute -bottom-9 left-6 text-xl leading-none text-ink-3 lg:top-1/2 lg:-right-8 lg:bottom-auto lg:left-auto lg:-translate-y-1/2"
            >
              <span className="lg:hidden">↓</span>
              <span className="hidden lg:inline">→</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
