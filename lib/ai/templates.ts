/**
 * Deterministic, grounded copy for every AI task. Used when no model is
 * configured, when model output fails the guardrail twice, and in offline
 * demo mode, so for most viewers this IS the AI layer.
 *
 * Sentences come from each fact's hand-written `phrase` (data/facts.json),
 * filled with the fact's own value and followed by its citation. Phrases are
 * checked by verify:data to contain no other numbers, so templates cannot
 * leak an unsourced figure.
 */
import { getCity, initiatives } from "@/lib/data/load";
import type { AiRequest, DerivedValue, Fact, Interest, Pillar } from "@/lib/data/schemas";
import { unitLabel } from "@/lib/format";

/* ------------------------------------------------------------- values */

const nf = (max = 2) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: max });

/** A fact's value written for prose: "more than £140,000", "about 20,000 tCO₂e", "16%". */
export function proseValue(f: Fact, abs = false): string {
  if (f.value === null) return f.valueText ?? "";
  const v = abs ? Math.abs(f.value) : f.value;
  const lead = f.qualifier === "at-least" ? "more than " : f.qualifier === "approximately" ? "about " : "";
  let body: string;
  if (f.unit === "GBP" || f.unit === "USD") body = `${f.unit === "GBP" ? "£" : "$"}${nf(2).format(v)}`;
  else if (f.unit === "%") body = `${nf(1).format(v)}%`;
  else if (f.unit === "x") body = `${nf(1).format(v)} times`;
  else if (["year", "count", "round"].includes(f.unit)) body = nf(0).format(v);
  else {
    const unit = unitLabel(f.unit).split(" / ")[0];
    const num = v >= 1e6 ? `${nf(1).format(v / 1e6)} million` : nf(v < 10 ? 2 : v < 1000 ? 1 : 0).format(v);
    body = `${num} ${unit}`;
  }
  return lead + body;
}

function fill(f: Fact): string {
  if (!f.phrase) return "";
  return f.phrase
    .replace("{v}", proseValue(f))
    .replace("{abs}", proseValue(f, true))
    .replace("{n}", f.value === null ? "" : f.unit === "year" ? String(f.value) : nf(0).format(f.value));
}

/** One cited sentence for a fact. Falls back to a plain construction when no phrase exists. */
export function factSentence(f: Fact): string {
  const text =
    fill(f) ||
    (f.value === null ? `${f.metric}: ${f.valueText}.` : `The team reports ${lowerFirst(f.metric)} at ${proseValue(f)}.`);
  return cite(text, `F:${f.id}`);
}

/** Insert the citation before the sentence's final punctuation. */
function cite(sentence: string, ref: string): string {
  const m = sentence.match(/^(.*?)([.!?])?$/s);
  return `${m?.[1] ?? sentence} [${ref}]${m?.[2] ?? "."}`;
}

function derivedValue(d: DerivedValue): string {
  return d.unit === "%" ? `${nf(1).format(d.value)}%` : `${nf(0).format(d.value)} ${unitLabel(d.unit)}`;
}

/* ------------------------------------------------------------- casing */

const PROPER_FIRST = new Set(["Cognizant", "Arm", "Make", "Singapore", "Citi", "Northamptonshire", "Ultra-runner", "F1's", "AFBE-UK"]);

function lowerFirst(s: string): string {
  const first = s.split(/\s/)[0];
  if (PROPER_FIRST.has(first) || /^[A-Z]{2,}/.test(first) || /^\d/.test(first)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function stripFinal(s: string): string {
  return s.replace(/[.!?]$/, "");
}

/* --------------------------------------------------------------- labels */

const INTEREST_LABELS: Record<Interest, string> = {
  environment: "the environment",
  community: "community work",
  inclusion: "inclusion",
  stem: "STEM",
  tech: "technology",
};

const SECTOR_OPENERS: Record<Pillar, string> = {
  environment: "Sector one: the carbon behind a Formula One season.",
  belong: "Sector two: who gets a seat at the table.",
  community: "Sector three: what the team does away from the track.",
  governance: "Scrutineering: how you can tell any of this is true.",
};

const PILLAR_TITLES: Record<Pillar, string> = {
  environment: "Environment",
  belong: "Belong",
  community: "Community",
  governance: "Governance",
};

const PILLAR_ORDER: Pillar[] = ["environment", "belong", "community", "governance"];

function words(s: string): number {
  return s.replace(/\[(F|D):[a-z0-9-]+\]/g, "").trim().split(/\s+/).filter(Boolean).length;
}

/* -------------------------------------------------------------- fan-story */

function fanStoryTemplate(req: AiRequest, facts: Fact[]): string {
  const fan = req.fan;
  const pillar = (req.params.pillar as Pillar) ?? facts[0]?.pillar ?? "environment";
  const opener = SECTOR_OPENERS[pillar];
  if (!fan || facts.length === 0) return [opener, ...facts.map(factSentence)].join(" ");

  const interest = INTEREST_LABELS[fan.interests[0]] ?? fan.interests[0];
  const city = getCity(fan.cityId);
  const lines = facts.map(factSentence);

  if (fan.level === "die-hard") return [opener, ...lines].join(" ");

  if (fan.level === "casual") {
    return [opener, `Picked for someone into ${interest}: ${lowerFirst(lines[0])}`, ...lines.slice(1, 2)].join(" ");
  }

  // New fans: fewer facts, a friendlier frame, and a pointer to the sources.
  const where = city ? ` in ${city.name}` : "";
  return [
    opener,
    `Because you follow ${interest}${where}, we've started here: ${lowerFirst(lines[0])}`,
    ...lines.slice(1, 2),
    "Tap any number to see the page it comes from.",
  ].join(" ");
}

/* ------------------------------------------------------------ quiz-reveal */

function quizRevealTemplate(req: AiRequest, facts: Fact[]): string {
  const f = facts[0];
  const body = stripFinal(lowerFirst(fill(f) || `the answer is ${proseValue(f)}`));
  return cite(`${req.params.correct ? "Right" : "Not quite"}: ${body}.`, `F:${f.id}`);
}

/* ---------------------------------------------------------- share-caption */

function shareCaptionTemplate(req: AiRequest, facts: Fact[]): string {
  const byId = new Map(facts.map((f) => [f.id, f]));
  const interests = req.fan?.interests ?? [];
  const peopleFirst = interests.some((i) => i === "community" || i === "stem" || i === "inclusion");

  const saf = byId.get("e25-saf-airfreight-cut");
  const students = byId.get("c25-mam-day-students");
  const freight = byId.get("est-freight-per-round");

  const candidates: string[] = [];
  const push = (f: Fact | undefined, text: (v: string) => string) => f && candidates.push(text(`${proseValue(f)} [F:${f.id}]`));
  if (peopleFirst) push(students, (v) => `I did my Impact Lap: ${v} came to Make A Mark Day. I'm in.`);
  push(saf, (v) => `I did my Impact Lap: cleaner fuel cut the team's air-freight emissions by ${v}.`);
  push(freight, (v) => `I did my Impact Lap: one race weekend of freight is roughly ${v}.`);
  push(students, (v) => `I did my Impact Lap: ${v} came to Make A Mark Day.`);
  for (const f of facts) push(f, (v) => `I did my Impact Lap. My number: ${v}.`);

  return candidates.find((c) => c.length <= 110) ?? `I did my Impact Lap [F:${facts[0].id}].`;
}

/* --------------------------------------------------------- linkedin-post */

const TONE_INTROS: Record<string, string> = {
  confident: "Impact stories are only as good as the data behind them. Here's what Cognizant and Aston Martin Aramco have to show.",
  warm: "Some of our favourite work with Aston Martin Aramco happens well away from the track.",
  formal: "An update on Cognizant's partnership with the Aston Martin Aramco Formula One Team.",
};

const TONE_CLOSINGS: Record<string, string> = {
  confident: "Every figure here links back to the team's published report. That's the standard we hold ourselves to.",
  warm: "Thank you to every student, mentor and engineer who made these moments happen.",
  formal: "All figures are drawn from the team's published ESG reporting, with sources cited.",
};

function linkedinPostTemplate(req: AiRequest, facts: Fact[]): string {
  const tone = typeof req.params.tone === "string" && TONE_INTROS[req.params.tone] ? req.params.tone : "confident";
  const simulated = Boolean(req.params.simulated);
  const parts: string[] = [];

  if (simulated && req.derived[0]) {
    const d = req.derived[0];
    parts.push(
      cite(`Race-weekend milestone from our Impact Lap demo: ${lowerFirst(d.label)} just passed ${derivedValue(d)}`, `D:${d.id}`),
      "It's a simulated feed built for this prototype, but it shows the moments a live version would catch.",
      "The real story behind it:",
    );
  } else {
    parts.push(TONE_INTROS[tone]);
  }

  const closing = simulated
    ? "In production, this post would draft itself the moment a real milestone lands, with every figure sourced."
    : TONE_CLOSINGS[tone];

  for (const f of facts) {
    parts.push(factSentence(f));
    if (words([...parts, closing].join(" ")) >= 90) break;
  }

  return `${[...parts, closing].join(" ")}\n\n#MakeAMark #Cognizant #Motorsport`;
}

/* ------------------------------------------------------ quarterly brief */

const SECTION_INTROS: Record<string, string> = {
  Environment: "Carbon, freight and energy across the team's operations.",
  Belong: "Mentoring, representation and wellbeing inside the team.",
  Community: "Education, outreach and fundraising, including the programmes Cognizant helps run.",
  Governance: "How the numbers are checked, and what the team discloses.",
  "Also of note": "Further figures from the same reports.",
  Education: "Programmes that bring students into STEM and motorsport.",
  Emissions: "The team's carbon footprint and how it is moving.",
  Targets: "What the team has committed to, and by when.",
  Freight: "Getting cars, parts and people around the calendar.",
  Mentoring: "Structured routes into the sport for under-represented talent.",
  Fundraising: "Money raised for charities close to the team.",
  Reach: "How far the team's impact stories travel.",
  Workforce: "Who works at the team.",
};

function groupForBrief(facts: Fact[]): { title: string; facts: Fact[] }[] {
  const byPillar = new Map<Pillar, Fact[]>();
  for (const f of facts) byPillar.set(f.pillar, [...(byPillar.get(f.pillar) ?? []), f]);
  const groups = PILLAR_ORDER.filter((p) => byPillar.has(p)).map((p) => ({ title: PILLAR_TITLES[p], facts: byPillar.get(p)! }));
  if (groups.length >= 3) return groups.slice(0, 4);

  // Narrow requests (one pillar): split by topic so the brief still has sections.
  const byTopic = new Map<string, Fact[]>();
  for (const f of facts) byTopic.set(f.topic, [...(byTopic.get(f.topic) ?? []), f]);
  const topics = [...byTopic.entries()].map(([t, fs]) => ({ title: t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, " "), facts: fs }));
  if (topics.length <= 4) return topics;
  return [...topics.slice(0, 3), { title: "Also of note", facts: topics.slice(3).flatMap((g) => g.facts) }];
}

function quarterlyBriefTemplate(req: AiRequest, facts: Fact[]): string {
  const narrow = req.params.pillars === "community";
  const title = narrow
    ? "Community impact brief: Cognizant × Aston Martin Aramco"
    : "Partnership impact brief: Cognizant × Aston Martin Aramco";
  const summary =
    "What the partnership and the team's wider programme delivered, drawn from the team's published reports. Estimates are marked as such.";
  const sections = groupForBrief(facts).map((g) => {
    const intro = SECTION_INTROS[g.title] ?? "";
    return [g.title, intro, ...g.facts.map((f) => `- ${factSentence(f)}`)].filter(Boolean).join("\n");
  });
  const notes =
    "Data notes\nWhere the source reports disagree with themselves, the figure carries a quality flag in the dashboard. Nothing here is published without a source.";
  return [title, summary, ...sections, notes].join("\n\n");
}

/* ---------------------------------------------------- investor summary */

function investorSummaryTemplate(req: AiRequest, facts: Fact[]): string {
  const narrow = req.params.pillars === "community";
  const title = narrow ? "Cognizant × Aston Martin Aramco: community impact" : "Cognizant × Aston Martin Aramco: partnership impact";
  // One bullet per topic first, so four bullets don't all describe the same programme.
  const firstOfTopic = facts.filter((f, i) => facts.findIndex((g) => g.topic === f.topic) === i);
  const ordered = [...firstOfTopic, ...facts.filter((f) => !firstOfTopic.includes(f))];
  const bullets = ordered.slice(0, 4).map((f) => `- ${factSentence(f)}`);
  const fillers = [
    "- Every figure is traceable to a page in the team's published reports.",
    "- Estimates and simulations are labelled; gaps are shown as gaps.",
  ];
  while (bullets.length < 4) bullets.push(fillers[bullets.length % fillers.length]);
  const soWhat = narrow
    ? "So what: a measurable skills pipeline that the sponsorship can point to, not just logo placement."
    : "So what: sponsorship value that can be audited, not just asserted.";
  return [title, ...bullets, soWhat].join("\n");
}

/* ------------------------------------------------ scenario explanation */

function scenarioExplanationTemplate(req: AiRequest): string {
  const d = new Map(req.derived.map((x) => [x.id, x]));
  const out: string[] = [];
  const ref = (id: string) => `[D:${id}]`;

  const students = d.get("sc-students");
  if (students) {
    out.push(
      students.value > 0
        ? `More race-weekend STEM days would reach ${derivedValue(students)} ${ref(students.id)}, assuming each matches last year's Make A Mark Day and your turnout holds.`
        : `With no extra STEM days set, reach stays where it is ${ref(students.id)}.`,
    );
  }
  const mentees = d.get("sc-mentees");
  const growth = d.get("sc-network-growth");
  if (mentees && growth && mentees.value > 0) {
    out.push(
      `Extra mentoring cohorts add ${derivedValue(mentees)} a year ${ref(mentees.id)}; if they match this year's outcomes, ${derivedValue(growth)} would report a stronger professional network ${ref(growth.id)}.`,
    );
  }
  const saf = d.get("sc-saf-avoided");
  const extra = d.get("sc-saf-extra");
  const laps = d.get("sc-saf-extra-laps");
  if (saf && extra) {
    out.push(
      extra.value > 0
        ? `Raising the fuel's reduction target would avoid ${derivedValue(saf)} of air-freight emissions ${ref(saf.id)}, ${derivedValue(extra)} more than last year ${ref(extra.id)}${laps ? `, or ${derivedValue(laps)} of Silverstone ${ref(laps.id)}` : ""}.`
        : `At today's fuel level, air-freight savings hold at ${derivedValue(saf)} ${ref(saf.id)}; raise the target to see the extra.`,
    );
  }
  out.push("It models carbon and reach only: fuel costs aren't published, so treat it as a planning aid rather than a forecast.");
  return out.join(" ");
}

/* ------------------------------------------------------------ story kit */

function storyKitTemplate(req: AiRequest, facts: Fact[]): string {
  const initiative = initiatives.find((i) => i.id === req.params.initiative);
  // "Para-canoe seat with Paddle UK" -> "Para-canoe seat": the partner is named separately.
  const name = (initiative?.name ?? "this programme").replace(/\s*\((with [^)]*)\)$/, "").replace(/\s+with\s+[A-Z].*$/, "");
  const partner = initiative?.partners.find((p) => p !== "Cognizant") ?? "our organisation";
  const own = facts.filter((f) => initiative?.factIds.includes(f.id));
  const wider = facts.filter((f) => !initiative?.factIds.includes(f.id));

  const lines = [
    ...own.map(factSentence),
    ...(wider.length ? [`Across the team's wider ${PILLAR_TITLES[wider[0].pillar].toLowerCase()} work: ${lowerFirst(factSentence(wider[0]))}`] : []),
  ];

  if (req.params.format === "summary") {
    return [`${partner} and the Aston Martin Aramco Formula One Team work together on the ${lowerFirst(name)}.`, ...lines.slice(0, 2)].join(" ");
  }

  const intro = `At ${partner}, we've been working with the Aston Martin Aramco Formula One Team on the ${lowerFirst(name)}.`;
  const body: string[] = [];
  for (const l of lines) {
    body.push(l);
    if (words([intro, ...body].join(" ")) >= 55) break;
  }
  let text = [intro, ...body, "Every figure here comes from the team's published report, so you can check it yourself."].join(" ");
  const extras = [
    "We're proud to be part of it, and there's more to come.",
    `If you'd like to get involved with ${name}, we'd love to hear from you.`,
    "Thank you to everyone at the team who gives their time to make it happen.",
  ];
  for (const e of extras) if (words(text) < 60) text += ` ${e}`;
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
      return facts.map(factSentence).join(" ");
  }
}
