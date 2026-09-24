/**
 * Deterministic, grounded copy for every AI task. Used when no model is
 * configured, when the model output fails the guardrail twice, and as the
 * baseline the cache is warmed with - so for most judges this IS the AI
 * layer. Every sentence cites the fact or derived value it uses; every
 * figure is copied verbatim from formatFact()/the derived value so the
 * guardrail always passes.
 */
import { getCity, initiatives } from "@/lib/data/load";
import type { AiRequest, DerivedValue, Fact, FanLevel, Interest, Pillar } from "@/lib/data/schemas";
import { formatFact } from "@/lib/format";

/* ------------------------------------------------------------- helpers */

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

function formatDerived(d: DerivedValue): string {
  const num = nf.format(d.value);
  return d.unit === "%" ? `${num}%` : `${num} ${d.unit}`;
}

function statusPrefix(status: Fact["status"]): string {
  if (status === "estimated") return "an estimated ";
  if (status === "simulated") return "a simulated ";
  return "";
}

const FACT_VERBS = ["reached", "came to", "now stands at", "totalled", "landed at"];

/** One grounded, cited sentence for a fact: "<Metric> <verb> <value> [F:id]." */
function factSentence(f: Fact, seed: number): string {
  const value = `${statusPrefix(f.status)}${formatFact(f)}`;
  if (f.value === null) {
    // Qualitative facts (valueText) usually read as their own clause or
    // phrase, so a "verb + value" construction reads as nonsense; use a
    // plain appositive instead.
    return `${cap(f.metric)} - ${value} [F:${f.id}].`;
  }
  const verb = FACT_VERBS[seed % FACT_VERBS.length];
  return `${cap(f.metric)} ${verb} ${value} [F:${f.id}].`;
}

/** One grounded, cited sentence for a derived value. */
function derivedSentence(d: DerivedValue, seed: number, opener?: string): string {
  const lead = opener ?? (seed % 2 === 0 ? "That would mean" : "On top of that,");
  return `${lead} ${lowerFirst(d.label)} - ${formatDerived(d)} [D:${d.id}] - based on ${d.formula}.`;
}

function wordCount(s: string): string[] {
  return s
    .replace(/\[(F|D):[a-z0-9-]+\]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const INTEREST_LABELS: Record<Interest, string> = {
  environment: "sustainability",
  community: "community impact",
  inclusion: "inclusion",
  stem: "STEM",
  tech: "tech",
};

const PILLAR_LABELS: Record<Pillar, string> = {
  environment: "Environment",
  belong: "Belong",
  community: "Community",
  governance: "Governance",
};

const PILLAR_ORDER: Pillar[] = ["environment", "belong", "community", "governance"];

/* -------------------------------------------------------------- fan-story */

function fanStoryTemplate(req: AiRequest, facts: Fact[]): string {
  const fan = req.fan;
  if (!fan || facts.length === 0) return facts.map((f, i) => factSentence(f, i)).join(" ");
  const city = getCity(fan.cityId);
  const interest = INTEREST_LABELS[fan.interests[0]] ?? fan.interests[0];
  const level: FanLevel = fan.level;

  if (level === "new") {
    const sentences = [`Here's one for you: ${lowerFirst(factSentence(facts[0], 0))}`];
    if (facts[1]) sentences.push(`Put simply, ${lowerFirst(factSentence(facts[1], 1))}`);
    sentences.push(
      `Following the team as someone into ${interest}${city ? ` from ${city.name}` : ""}, that's the sort of detail worth knowing before the next race.`,
    );
    return sentences.join(" ");
  }

  if (level === "die-hard") {
    const sentences = [`You'll want the detail: ${lowerFirst(factSentence(facts[0], 3))}`];
    if (facts[1]) sentences.push(factSentence(facts[1], 4));
    return sentences.join(" ");
  }

  // casual
  const sentences = [`For you as a fan who follows ${interest}, ${lowerFirst(factSentence(facts[0], 1))}`];
  if (facts[1]) sentences.push(factSentence(facts[1], 2));
  return sentences.join(" ");
}

/* ------------------------------------------------------------ quiz-reveal */

function quizRevealTemplate(req: AiRequest, facts: Fact[]): string {
  const f = facts[0];
  const correct = Boolean(req.params.correct);
  const reaction = correct ? "Spot on" : "Not quite, but now you know";
  return `${reaction} - ${lowerFirst(factSentence(f, 0))}`;
}

/* ---------------------------------------------------------- share-caption */

function shareCaptionTemplate(_req: AiRequest, facts: Fact[]): string {
  const f = facts[0];
  const value = `${statusPrefix(f.status)}${formatFact(f)}`;
  const candidates = [
    `I just found out my race weekend links to ${value} [F:${f.id}] of impact.`,
    `Turns out my race weekend is worth ${value} [F:${f.id}] of impact.`,
    `${value} [F:${f.id}] - that's my race weekend impact.`,
  ];
  for (const c of candidates) if (c.length <= 110) return c;
  return candidates[candidates.length - 1];
}

/* --------------------------------------------------------- linkedin-post */

const TONE_INTROS: Record<string, string> = {
  confident: "Cognizant and Aston Martin Aramco Formula One Team keep turning shared ambition into results people can see.",
  warm: "There's a lot to be proud of in how Cognizant and Aston Martin Aramco Formula One Team are working together.",
  formal: "Cognizant is pleased to share the latest results from its partnership with Aston Martin Aramco Formula One Team.",
};

const TONE_CLOSINGS: Record<string, string> = {
  confident: "This is what a technology partnership looks like when it is built to last beyond a single season.",
  warm: "Thank you to everyone across both organisations making this happen, on and off the track.",
  formal: "Cognizant remains committed to supporting the team's programme through the seasons ahead.",
};

const PILLAR_HASHTAGS: Record<Pillar, string> = {
  environment: "#SustainableRacing",
  belong: "#InclusionInMotion",
  community: "#CommunityInGear",
  governance: "#TrustedData",
};

function linkedinPostTemplate(req: AiRequest, facts: Fact[]): string {
  const tone = typeof req.params.tone === "string" ? req.params.tone : "confident";
  const simulated = Boolean(req.params.simulated);
  const intro = TONE_INTROS[tone] ?? TONE_INTROS.confident;
  const closing = simulated
    ? "This milestone is drawn from a simulated demo feed built for this prototype, standing in for the kind of live moment the partnership could celebrate."
    : (TONE_CLOSINGS[tone] ?? TONE_CLOSINGS.confident);

  const items = [...req.derived.map((d, i) => () => derivedSentence(d, i)), ...facts.map((f, i) => () => factSentence(f, i))];

  const included: string[] = [];
  for (const build of items) {
    included.push(build());
    if (wordCount([intro, ...included, closing].join(" ")).length >= 90) break;
  }

  const pillarsParam = typeof req.params.pillars === "string" ? req.params.pillars : "";
  const firstPillar = pillarsParam.split(",").find((p): p is Pillar => PILLAR_ORDER.includes(p as Pillar));
  const hashtags = ["#ImpactLap", firstPillar ? PILLAR_HASHTAGS[firstPillar] : "#RacingWithPurpose", "#TeamCognizant"];

  return `${[intro, ...included, closing].join(" ")}\n\n${hashtags.join(" ")}`;
}

/* ------------------------------------------------------------- brief kit */

const TOPIC_TITLES: Record<string, string> = {
  emissions: "Emissions",
  freight: "Freight and logistics",
  energy: "Event energy",
  education: "Education and STEM",
  mentoring: "Mentoring",
  fundraising: "Fundraising",
  recognition: "Recognition",
  methodology: "Methodology and disclosure",
  targets: "Targets",
};

const GENERIC_SECTION_TITLES = ["Highlights", "Impact in numbers", "People and community", "Trust and disclosure"];

const SECTION_LEAD_INS: Record<string, string> = {
  Environment: "On the environmental side of the partnership:",
  Belong: "On inclusion and belonging:",
  Community: "In the community:",
  Governance: "On governance and disclosure:",
  "Also of note": "A few more figures worth flagging:",
};

function sectionLeadIn(title: string): string {
  return SECTION_LEAD_INS[title] ?? `${title}, in brief:`;
}

/**
 * Groups the supplied facts into 3-4 short sections for the quarterly
 * brief, keeping every fact (never dropping one to fit a section cap).
 * Prefers pillar groups; falls back to topic groups, then a plain
 * round-robin split, so a narrow request (e.g. one pillar) still reads as
 * several short sections rather than one long list.
 */
function groupForBrief(facts: Fact[]): { title: string; facts: Fact[] }[] {
  const byPillar = new Map<Pillar, Fact[]>();
  for (const f of facts) {
    if (!byPillar.has(f.pillar)) byPillar.set(f.pillar, []);
    byPillar.get(f.pillar)!.push(f);
  }
  const pillarGroups = PILLAR_ORDER.filter((p) => byPillar.has(p)).map((p) => ({ title: PILLAR_LABELS[p], facts: byPillar.get(p)! }));
  if (pillarGroups.length >= 3) return pillarGroups.slice(0, 4);

  const byTopic = new Map<string, Fact[]>();
  for (const f of facts) {
    const key = f.topic || f.pillar;
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key)!.push(f);
  }
  const topicGroups = [...byTopic.entries()].map(([topic, fs]) => ({ title: TOPIC_TITLES[topic] ?? cap(topic), facts: fs }));
  if (topicGroups.length >= 3) {
    if (topicGroups.length <= 4) return topicGroups;
    const kept = topicGroups.slice(0, 3);
    const overflow = topicGroups.slice(3).flatMap((g) => g.facts);
    kept.push({ title: "Also of note", facts: overflow });
    return kept;
  }

  // Not enough natural groups: spread the facts round-robin across 3-4
  // generic sections so the brief still has several short sections.
  const sectionCount = Math.min(4, Math.max(3, facts.length));
  const buckets: Fact[][] = Array.from({ length: sectionCount }, () => []);
  facts.forEach((f, i) => buckets[i % sectionCount].push(f));
  return buckets.filter((b) => b.length > 0).map((fs, i) => ({ title: GENERIC_SECTION_TITLES[i], facts: fs }));
}

function quarterlyBriefTemplate(req: AiRequest, facts: Fact[]): string {
  const pillarsParam = typeof req.params.pillars === "string" ? req.params.pillars : "";
  const headline =
    pillarsParam === "community"
      ? "Community impact this quarter: measurable, cited, growing."
      : "Partnership impact this quarter: the numbers behind the collaboration.";
  const groups = groupForBrief(facts);
  const sections = groups.map((g) => {
    const bullets = g.facts.map((f, i) => `- ${factSentence(f, i)}`);
    return `${g.title}\n${sectionLeadIn(g.title)}\n${bullets.join("\n")}`;
  });
  return [headline, "", ...sections].join("\n\n");
}

function investorSummaryTemplate(req: AiRequest, facts: Fact[]): string {
  const pillarsParam = typeof req.params.pillars === "string" ? req.params.pillars : "";
  const title =
    pillarsParam === "community"
      ? "Cognizant x Aston Martin Aramco: community impact snapshot"
      : "Cognizant x Aston Martin Aramco: partnership impact snapshot";
  const bulletFacts = facts.slice(0, 4);
  const bullets = bulletFacts.map((f, i) => `- ${factSentence(f, i)}`);
  while (bullets.length < 4) {
    bullets.push("- Every figure above is drawn from the team's published, verified reporting or a documented estimate.");
  }
  return [title, ...bullets, "So what: verified data turns a sponsorship into a partnership investors can measure."].join("\n");
}

/* ------------------------------------------------------ scenario-explain */

function scenarioExplanationTemplate(req: AiRequest): string {
  const derived = req.derived.slice(0, 4);
  if (derived.length === 0) return "No scenario inputs were supplied.";
  const sentences = derived.map((d, i) => derivedSentence(d, i, i === 0 ? "Scaling this up," : undefined));
  return sentences.join(" ");
}

/* ------------------------------------------------------------- story-kit */

function storyKitTemplate(req: AiRequest, facts: Fact[]): string {
  const format = req.params.format;
  const initiative = initiatives.find((i) => i.id === req.params.initiative);
  const name = initiative?.name ?? "this partnership";

  if (format === "summary") {
    const sentences = [`${name} is one of the ways Aston Martin Aramco Formula One Team turns its published figures into action.`];
    if (facts[0]) sentences.push(factSentence(facts[0], 0));
    if (facts[1]) sentences.push(factSentence(facts[1], 1));
    return sentences.join(" ");
  }

  // "post": charity/community partner voice, first person plural.
  const intro = `We're proud of what ${name} has achieved working alongside Aston Martin Aramco Formula One Team.`;
  const included: string[] = [];
  for (let i = 0; i < facts.length; i++) {
    included.push(factSentence(facts[i], i));
    if (wordCount([intro, ...included].join(" ")).length >= 55) break;
  }
  const closing = "None of this happens without a team willing to put its own numbers on the table, and we're glad to be part of it.";
  let text = [intro, ...included, closing].join(" ");
  if (wordCount(text).length < 60) {
    text += " It is exactly the kind of partnership Impact Lap was built to make visible.";
  }
  return text;
}

/* -------------------------------------------------------------- dispatch */

export function renderTemplate(req: AiRequest, facts: Fact[]): string {
  switch (req.task) {
    case "fan-story":
      return fanStoryTemplate(req, facts);
    case "quiz-reveal":
      return quizRevealTemplate(req, facts);
    case "share-caption":
      return shareCaptionTemplate(req, facts);
    case "linkedin-post":
      return linkedinPostTemplate(req, facts);
    case "quarterly-brief":
      return quarterlyBriefTemplate(req, facts);
    case "investor-summary":
      return investorSummaryTemplate(req, facts);
    case "scenario-explanation":
      return scenarioExplanationTemplate(req);
    case "story-kit":
      return storyKitTemplate(req, facts);
    default:
      return facts.map((f, i) => factSentence(f, i)).join(" ");
  }
}
