/**
 * Per-task prompt builders for the live model path. The prompt contains only
 * the facts and derived values the request supplied (the "fact pack") plus
 * the shape rules for the task. The guardrail (lib/ai/guardrail.ts) is the
 * real enforcement; this file exists to make a first-attempt pass likely.
 */
import { getCity } from "@/lib/data/load";
import type { AiRequest, DerivedValue, Fact } from "@/lib/data/schemas";
import { formatFact } from "@/lib/format";

const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

function factLine(f: Fact): string {
  const bits = [
    `[F:${f.id}] ${f.metric} = ${formatFact(f)} (unit: ${f.unit}; period: ${f.period}; status: ${f.status}${
      f.qualifier !== "exact" ? `; qualifier: ${f.qualifier}` : ""
    })`,
  ];
  if (f.status !== "verified" && f.notes) bits.push(`  note: ${f.notes}`);
  for (const flag of f.flags) bits.push(`  quality flag (${flag.kind}): ${flag.note}`);
  return bits.join("\n");
}

function derivedLine(d: DerivedValue): string {
  return `[D:${d.id}] ${d.label} = ${nf.format(d.value)} ${d.unit}\n  formula: ${d.formula}`;
}

export function buildFactPack(facts: Fact[], derived: DerivedValue[]): string {
  const lines = [...facts.map(factLine), ...derived.map(derivedLine)];
  return lines.join("\n");
}

const GENERAL_RULES = `You write short copy for Impact Lap, a companion product to Aston Martin Aramco Formula One Team's published ESG reporting, for the Cognizant x Aston Martin Aramco F1 Gen-AI Ideathon.

Ground rules, all mandatory:
- Use only the facts and derived values listed in the fact pack below. Never invent, guess, infer or recompute a number.
- Immediately after using a fact or derived value, cite it exactly as written, e.g. [F:some-id] or [D:some-id]. Use the ids exactly as given, do not alter them.
- Copy every figure exactly as it appears after "=" in the fact pack (same digits, punctuation and symbol). Do not reformat, round further, or add thousands separators that are not already there.
- Do not write any other number anywhere in the text: no extra years (a year is fine only if it is the value or period of a fact you cite), no counts of things you are describing, no ordinals written as digits.
- Do not spell out quantities as number words either (do not write "three" or "first" to mean a count).
- The first time you use a fact whose status is "estimated" or "simulated", say so in words (e.g. "an estimated", "a simulated demo figure").
- Write in British English, sentence case, short plain sentences. No emoji, no exclamation marks, no markdown bold or headings unless a rule below asks for bullet points (then start each point with "- ").
- Never use these words: unlock, empower, revolutionise, seamless, cutting-edge, journey (except a fan's own "lap"), game-changing, disrupt, leverage (as a verb).
- Output only the requested copy, nothing else (no preamble, no notes to the reader).`;

type TaskRules = (req: AiRequest) => string;

const TASK_RULES: Record<AiRequest["task"], TaskRules> = {
  "fan-story": (req) => {
    const level = req.fan?.level ?? "casual";
    const shape =
      level === "new"
        ? "Write 2-3 sentences for a fan who is new to F1: plain language, explain what the figures mean in everyday terms."
        : level === "die-hard"
          ? "Write 1-2 dense sentences for a die-hard fan: assume F1 knowledge, no hand-holding, pack in detail."
          : "Write 2 sentences for a casual fan: friendly, a little more context than for a die-hard, less hand-holding than for a new fan.";
    return `Task: fan-story. ${shape} Address the fan directly as "you". Tailor it to their interests and city, given below.`;
  },
  "quiz-reveal": () =>
    `Task: quiz-reveal. Write exactly one sentence that reacts to whether the fan answered the quiz correctly (see "correct" below) and restates the fact that answers it.`,
  "share-caption": () =>
    `Task: share-caption. Write exactly one line, at most 110 characters including spaces and the citation marker, written in the first person as the fan sharing their result. Make it sound like something a person would actually post, not a headline.`,
  "linkedin-post": (req) => {
    const simulated = Boolean(req.params.simulated);
    const sim = simulated
      ? " This post is about a live milestone from the demo's simulated feed: say plainly that it is drawn from a simulated demo feed, not a real live figure."
      : "";
    return `Task: linkedin-post. Write 80-140 words in a confident, co-branded Cognizant x Aston Martin Aramco voice, third person, suitable to post on LinkedIn.${sim} End with up to 3 hashtags on their own line; hashtags must be words only, never digits.`;
  },
  "quarterly-brief": () =>
    `Task: quarterly-brief. Write a one-line headline, then 3-4 short sections each with a one-line lead-in and 1-2 bullet points ("- " prefix). Total length 180-260 words. Plain professional partner-facing tone, third person.`,
  "investor-summary": () =>
    `Task: investor-summary. Write a short slide-ready summary: one title line, then exactly 4 bullet points ("- " prefix), then one closing line starting "So what:" that states the implication. No other text.`,
  "scenario-explanation": () =>
    `Task: scenario-explanation. Write 3-4 sentences in plain professional language explaining what the projected scenario outcomes mean, using only the derived values ([D:...]) supplied. Name the assumption each projection scales from (drawn from its formula) as you go.`,
  "story-kit": (req) => {
    const format = req.params.format;
    return format === "post"
      ? `Task: story-kit, format "post". Write 60-100 words in the voice of the charity or community partner talking about the collaboration, first person plural ("we"), warm and specific.`
      : `Task: story-kit, format "summary". Write 2-3 sentences in the third person, suitable as a short catalogue description of the initiative.`;
  },
};

function contextLines(req: AiRequest): string[] {
  const lines: string[] = [];
  if (req.fan) {
    const city = getCity(req.fan.cityId);
    lines.push(
      `Fan: level ${req.fan.level}, based in ${city?.name ?? req.fan.cityId}, interested in ${req.fan.interests.join(", ")}.`,
    );
  }
  for (const [k, v] of Object.entries(req.params)) {
    lines.push(`${k}: ${v}`);
  }
  return lines;
}

/**
 * Builds the system + user prompt for a live generation attempt.
 * `retryReasons`, when given, are the guardrail's reasons the previous
 * attempt failed, fed back so the model can correct itself.
 */
export function buildPrompt(
  req: AiRequest,
  facts: Fact[],
  retryReasons: string[] = [],
): { system: string; prompt: string } {
  const rules = TASK_RULES[req.task](req);
  const system = `${GENERAL_RULES}\n\n${rules}`;
  const parts = [...contextLines(req), "", "Fact pack (the ONLY facts and derived values you may use):", buildFactPack(facts, req.derived)];
  if (retryReasons.length) {
    parts.push(
      "",
      "Your previous attempt failed the numeric guardrail for these reasons - fix every one of them:",
      ...retryReasons.map((r) => `- ${r}`),
    );
  }
  return { system, prompt: parts.join("\n") };
}
