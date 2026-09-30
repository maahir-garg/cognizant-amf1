/**
 * Per-task prompt builders for the live model path. The prompt contains only
 * the facts and derived values the request supplied (the "fact pack") plus
 * the shape rules for the task. The guardrail (lib/ai/guardrail.ts) is the
 * real enforcement; this file exists to make a first-attempt pass likely.
 */
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

function buildFactPack(facts: Fact[], derived: DerivedValue[]): string {
  const lines = [...facts.map(factLine), ...derived.map(derivedLine)];
  return lines.join("\n");
}

const GENERAL_RULES = `You write short copy for Off Camera, a companion product to Aston Martin Aramco Formula One Team's published ESG reporting, for the Cognizant x Aston Martin Aramco F1 Gen-AI Ideathon.

Ground rules, all mandatory:
- Use only the facts and derived values listed in the fact pack below. Never invent, guess, infer or recompute a number.
- Immediately after using a fact or derived value, cite it exactly as written, e.g. [F:some-id] or [D:some-id]. Use the ids exactly as given, do not alter them.
- Copy every figure exactly as it appears after "=" in the fact pack (same digits, punctuation and symbol). Do not reformat, round further, or add thousands separators that are not already there.
- A figure with a minus sign is a fall. Put the fall in words and drop the sign: write "cut by 74%" or "down 74%", never "by -74%" or "down -74%".
- Do not write any other number anywhere in the text: no extra years (a year is fine only if it is the value or period of a fact you cite), no counts of things you are describing, no ordinals written as digits.
- Do not spell out quantities as number words either (do not write "three" or "first" to mean a count).
- The first time you use a fact whose status is "estimated" or "simulated", say so in words (e.g. "an estimated", "a simulated demo figure").

Style, all mandatory. Write like a good newspaper explainer:
- British English spelling, sentence case, short plain sentences with one idea each. No emoji, no exclamation marks, no markdown bold or headings unless a rule below asks for bullet points (then start each point with "- ").
- Refer to the team in the third person as "the team" or "Aston Martin Aramco". Never write "we", "our" or "us" for the team or for this product.
- Never address the reader by who they are: do not mention their level, city or interests, and never open with "As a new fan", "As a long-time fan" or "Because you follow". Just explain the facts.
- After a colon, carry on in lower case unless the next word is a name.
- Never use these words: massive, huge, incredible, amazing, journey, unlock, empower, revolutionise, seamless, cutting-edge, game-changing, disrupt, leverage (as a verb), carbon neutral, carbon negative, offset.
- Output only the requested copy, nothing else (no preamble, no notes to the reader).`;

type TaskRules = (req: AiRequest) => string;

const TASK_RULES: Record<AiRequest["task"], TaskRules> = {
  "fan-story": (req) => {
    const shape =
      req.fan?.level === "die-hard"
        ? "Write 2 sentences for a reader who has watched F1 for years: assume they know the sport, and give the detail and the caveat that matter."
        : "Write 2-3 sentences for a reader new to F1: plain words, and say what each figure means in everyday terms.";
    const chapter =
      typeof req.params.chapter === "string"
        ? ` This is the closing paragraph of the "${req.params.chapter}" chapter of a visual story; keep to that chapter and the supplied facts.`
        : "";
    return `Task: fan-story. ${shape} Never more than 3 sentences. Explain the facts; do not address the reader or say who they are.${chapter}`;
  },
  "quiz-reveal": () =>
    `Task: quiz-reveal. Write exactly one sentence that says whether the answer matched the report (see "correct" below) and restates the fact that answers it. Start with "Right:" or "Not quite:" and carry on in lower case.`,
  "share-caption": () =>
    `Task: share-caption. Write exactly one line, at most 110 characters including spaces and the citation marker, in the first person as the fan sharing what they learned ("I", never "we"). Make it sound like something a person would actually post, not a headline.`,
  "linkedin-post": () =>
    `Task: linkedin-post. Write 80-140 words in a confident, co-branded Cognizant x Aston Martin Aramco voice, third person, suitable to post on LinkedIn. End with up to 3 hashtags on their own line; hashtags must be words only, never digits.`,
  "quarterly-brief": () =>
    `Task: quarterly-brief. Write a one-line headline, then 3-4 short sections each with a one-line lead-in and 1-2 bullet points ("- " prefix). Total length 180-260 words. Plain professional partner-facing tone, third person.`,
  "leadership-update": () =>
    `Task: leadership-update. Write a short update for Cognizant's leadership team: one title line, then exactly 4 bullet points ("- " prefix), then one closing line starting "So what:" that states the implication. No other text.`,
  "scenario-explanation": () =>
    `Task: scenario-explanation. Write 3-4 sentences in plain professional language explaining what the projected scenario outcomes mean, using only the derived values ([D:...]) supplied. Name the assumption each projection scales from (drawn from its formula) as you go.`,
  "story-kit": (req) => {
    const format = req.params.format;
    return format === "post"
      ? `Task: story-kit, format "post". Write 60-100 words in the voice of the charity or community partner talking about the collaboration, first person plural ("we" means the charity, never the team), warm and specific. Name the team as "the team" or "Aston Martin Aramco".`
      : `Task: story-kit, format "funder". Write one paragraph of 40-110 words in formal third person, suitable for a charity's report to its funders: what the collaboration is, then its published outcomes. No first person, no hashtags.`;
  },
};

/**
 * The request's knobs. The fan's city and interests are deliberately left
 * out: the copy explains the facts and never restates who the reader is.
 */
function contextLines(req: AiRequest): string[] {
  const lines: string[] = [];
  if (req.fan) lines.push(`Reading depth: ${req.fan.level === "die-hard" ? "watched F1 for years" : "new to F1"}.`);
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
