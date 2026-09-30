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
import { getRace, initiatives } from "@/lib/data/load";
import type { AiRequest, DerivedValue, Fact, Initiative, Pillar } from "@/lib/data/schemas";
import { unitLabel } from "@/lib/format";

/* ------------------------------------------------------------- values */

const nf = (max = 2) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: max });

/** A fact's value written for prose: "more than £140,000", "about 20,000 tCO₂e", "16%". */
function proseValue(f: Fact, abs = false): string {
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

/** The fact's hand-written sentence with its value filled in and no citation, or "" when it has no phrase. */
export function factPhrase(f: Fact): string {
  return fill(f);
}

/** One cited sentence for a fact. Falls back to a plain construction when no phrase exists. */
function factSentence(f: Fact): string {
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

/** Words that only start a sentence, so they lower-case even before a name ("At European races"). */
const PLAIN_FIRST = new Set(["At", "In", "On", "By", "With", "From", "For", "Across", "Over", "Since", "During", "After", "That", "This"]);

function lowerFirst(s: string): string {
  const [first, second = ""] = s.split(/\s/);
  if (PROPER_FIRST.has(first) || /^[A-Z]{2,}/.test(first) || /^\d/.test(first)) return s;
  if (PLAIN_FIRST.has(first)) return s.charAt(0).toLowerCase() + s.slice(1);
  // "Racing Pride partnership", "Aleto Foundation ...": a capitalised second word marks a name.
  if (!/^(The|A|An)$/.test(first) && /^[A-Z]/.test(second)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function stripFinal(s: string): string {
  return s.replace(/[.!?]$/, "");
}

/* --------------------------------------------------------------- labels */

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

/**
 * Story chapters at "/". "new" is the "In plain words" recap, "die-hard" the
 * denser paragraph inside "The detail". Openers carry no digits, so the only
 * numbers in the text are the cited facts'.
 */
const CHAPTER_OPENERS: Record<string, { new: string; "die-hard": string; close?: string }> = {
  campus: {
    new: "The car is designed and built at the team's campus in Silverstone, which is where its most visible changes have happened.",
    "die-hard": "The campus is the part of the footprint the team controls most directly, and a small part of the total.",
  },
  "supply-chain": {
    new: "Most of the team's carbon comes from the things it buys, not from racing itself.",
    "die-hard": "Scope three dominates, and within it the goods and services the team buys.",
  },
  moving: {
    new: "Getting cars and kit to every race means a lot of flying, so the team is shipping more by sea and paying for a lower-carbon jet fuel.",
    "die-hard": "Freight is counted before Sustainable Aviation Fuel certificates, alongside the team's first certificate purchase and a shift from air to sea.",
  },
  circuit: {
    new: "At the track the garage needs power all weekend, and at European races it now comes from a shared, lower-carbon system.",
    "die-hard": "Trackside, the team draws on the sport's shared paddock energy at European rounds.",
    close: "The team has not published trackside energy for Singapore.",
  },
  beyond: {
    new: "Away from racing, the team works with students, mentors and communities, some of them a long way from Silverstone.",
    "die-hard": "Belong and Community: STEM outreach, mentoring, and what the removal projects give back locally.",
  },
  finish: {
    new: "The team has set targets to cut its emissions, and it is further along on some than on others.",
    "die-hard": "Against the restated baseline, progress is uneven between the emissions the team controls and the rest of its value chain.",
  },
};

const TRACKSIDE_RE = /^e25-trackside-([a-z]+)-(hvo|grid|solar)$/;
const TRACKSIDE_SOURCE: Record<string, string> = { hvo: "HVO generators", grid: "renewable grid supply", solar: "solar" };

/** Trackside kWh facts have no phrase: fold one race's sources into a single sentence. */
function tracksideSentence(facts: Fact[]): string {
  const parts = facts.map((f) => `${proseValue(f)} from ${TRACKSIDE_SOURCE[TRACKSIDE_RE.exec(f.id)?.[2] ?? "hvo"]} [F:${f.id}]`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  return `At the British Grand Prix the team's garage used ${list}.`;
}

function fanChapterTemplate(req: AiRequest, facts: Fact[]): string {
  const level = req.fan?.level === "die-hard" ? "die-hard" : "new";
  const copy = CHAPTER_OPENERS[String(req.params.chapter)];
  const trackside = facts.filter((f) => TRACKSIDE_RE.test(f.id));
  const lines = facts.filter((f) => !trackside.includes(f)).map(factSentence);
  if (trackside.length) lines.push(tracksideSentence(trackside));
  return [copy?.[level], ...lines, copy?.close].filter(Boolean).join(" ");
}

/** Every fan-story request is a story chapter; anything else just tells its facts. */
function fanStoryTemplate(req: AiRequest, facts: Fact[]): string {
  if (typeof req.params.chapter === "string") return fanChapterTemplate(req, facts);
  return facts.map(factSentence).join(" ");
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
  const stemRacing = byId.get("c25-stem-racing-students");
  const students = byId.get("c25-mam-day-students");

  // Captions never name the product: the card already carries the wordmark.
  const candidates: string[] = [];
  const push = (f: Fact | undefined, text: (v: string) => string) => f && candidates.push(text(`${proseValue(f)} [F:${f.id}]`));
  if (peopleFirst) push(stemRacing, (v) => `I didn't know the team met ${v} at the STEM Racing World Finals.`);
  if (peopleFirst) push(students, (v) => `I didn't know ${v} came to the factory for Make A Mark Day.`);
  push(saf, (v) => `I learned SAF certificates helped cut the team's air-freight emissions by ${v}.`);
  push(stemRacing, (v) => `I learned the team met ${v} at the STEM Racing World Finals.`);
  push(byId.get("e25-supply-chain-share"), (v) => `I learned ${v} of the team's footprint is its supply chain, not the track.`);
  push(students, (v) => `I learned ${v} came to Make A Mark Day.`);
  for (const f of facts) push(f, (v) => `I checked the team's own report. My pick: ${v}.`);

  return candidates.find((c) => c.length <= 110) ?? `I checked the team's own report [F:${facts[0].id}].`;
}

/* --------------------------------------------------------- linkedin-post */

const POST_INTRO: Record<string, string> = {
  community: "Away from the track, the Aston Martin Aramco Formula One Team spends much of its year in classrooms and careers sessions.",
  belong: "Mentoring and inclusion programmes are a quiet part of the Aston Martin Aramco Formula One Team's year.",
  environment: "The Aston Martin Aramco Formula One Team has published how its footprint is changing, and where it has to go.",
  governance: "The Aston Martin Aramco Formula One Team's impact figures are checked and published, and here is how.",
  mixed: "The Aston Martin Aramco Formula One Team's latest impact report covers the car, the campus and the people around it.",
};
const POST_CLOSING = "Each figure comes from the team's published report, with the page it is on.";

/** A phrase that leans on the sentence before it ("They came from ..."), so it can't open a bullet or follow an unrelated fact. */
const leansOnPrevious = (f: Fact) => /^(They|Those|These|It|That's|That)\b/.test(f.phrase ?? "");

/** Facts in order, dropping any leaning phrase whose predecessor is not about the same thing. */
function flowing(facts: Fact[]): Fact[] {
  const out: Fact[] = [];
  for (const f of facts) {
    const prev = out.at(-1);
    if (leansOnPrevious(f) && !(prev && prev.topic === f.topic && prev.pillar === f.pillar)) continue;
    out.push(f);
  }
  return out;
}

function linkedinPostTemplate(req: AiRequest, facts: Fact[]): string {
  const pillars = String(req.params.pillars ?? "").split(",").filter(Boolean);
  // A race-week post opens on the race, named without its year so the only figures are cited ones.
  const race = typeof req.params.race === "string" ? getRace(req.params.race) : null;
  const intro = race
    ? `The Aston Martin Aramco Formula One Team races at the ${race.name.replace(/\s*\d{4}$/, "")} this week, and its work with students there started well before the lights go out.`
    : (POST_INTRO[pillars.length === 1 ? pillars[0] : "mixed"] ?? POST_INTRO.mixed);
  const parts: string[] = [intro];
  const closing = POST_CLOSING;

  for (const f of flowing(facts)) {
    parts.push(factSentence(f));
    // A race-week post has two programmes to cover, so it may run a little longer.
    if (words([...parts, closing].join(" ")) >= (race ? 115 : 90)) break;
  }

  return `${[...parts, closing].join(" ")}\n\n#MakeAMark #Cognizant #Motorsport`;
}

/* ------------------------------------------------------ quarterly brief */

const SECTION_INTROS: Record<string, string> = {
  Environment: "Carbon, freight and energy across the team's operations.",
  Belong: "Mentoring, representation and wellbeing inside the team.",
  Community: "Education, outreach and fundraising, including the programmes Cognizant helps run.",
  Governance: "How the numbers are checked, and what the team discloses.",
  Partners: "Where Cognizant fits in the partnership.",
  Disclosure: "What the team reports, and to whom.",
  Assurance: "Who has checked the figures, and to what standard.",
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

/** Phrases that lean on the sentence before ("They came from ..."). */
const LEANS_ON_PREVIOUS = /^(They|Those|These|It|That's|That)\b/;

/**
 * One bullet per fact, except that a phrase leaning on the one before joins
 * its antecedent's bullet (same topic) or is dropped, so no bullet starts
 * with an orphaned "They".
 */
/** True when both facts belong to the same programme, so "They came from ..." can follow its lead. */
function sameProgramme(a: Fact, b: Fact): boolean {
  return initiatives.some((i) => i.factIds.includes(a.id) && i.factIds.includes(b.id));
}

function briefBullets(facts: Fact[]): string[] {
  const bullets: { fact: Fact; text: string }[] = [];
  for (const f of facts) {
    if (LEANS_ON_PREVIOUS.test(f.phrase ?? "")) {
      const prev = bullets.at(-1);
      if (prev && sameProgramme(prev.fact, f)) prev.text += ` ${factSentence(f)}`;
      continue;
    }
    bullets.push({ fact: f, text: factSentence(f) });
  }
  return bullets.map((b) => `- ${b.text}`);
}

function quarterlyBriefTemplate(req: AiRequest, facts: Fact[]): string {
  const narrow = req.params.pillars === "community";
  const title = narrow
    ? "Community impact brief: Cognizant × Aston Martin Aramco"
    : "Partnership impact brief: Cognizant × Aston Martin Aramco";
  const summary =
    "What the partnership and the team's wider programme delivered, drawn from the team's published reports. Estimates are marked as such.";
  const notes =
    "Data notes\nWhere the source reports disagree with themselves, the figure carries a quality flag on the desk's Data quality page. Nothing here is published without a source.";
  const groups = groupForBrief(facts).map((g) => ({ title: g.title, bullets: briefBullets(g.facts) }));
  const render = () =>
    [
      title,
      summary,
      ...groups.filter((g) => g.bullets.length).map((g) => [g.title, SECTION_INTROS[g.title] ?? "", ...g.bullets].filter(Boolean).join("\n")),
      notes,
    ].join("\n\n");
  // Keep the brief to a page: trim the last bullet of the longest section until it fits.
  while (words(render()) > 255) {
    const longest = groups.reduce((a, b) => (b.bullets.length > a.bullets.length ? b : a));
    if (longest.bullets.length <= 1) break;
    longest.bullets.pop();
  }
  return render();
}

/* --------------------------------------------------- leadership update */

function leadershipUpdateTemplate(req: AiRequest, facts: Fact[]): string {
  const narrow = req.params.pillars === "community";
  const title = narrow
    ? "Leadership update: community impact with Aston Martin Aramco"
    : "Leadership update: the Aston Martin Aramco partnership";
  // Bullets stand alone, so skip phrases that lean on the one before ("They came from ...").
  // Leadership already knows the partnership title, so it is not a bullet.
  const pool = facts.filter((f) => !LEANS_ON_PREVIOUS.test(f.phrase ?? "") && f.topic !== "partners");
  // One bullet per topic first, so four bullets don't all describe the same programme.
  const firstOfTopic = pool.filter((f, i) => pool.findIndex((g) => g.topic === f.topic) === i);
  const ordered = [...firstOfTopic, ...pool.filter((f) => !firstOfTopic.includes(f))];
  const bullets = ordered.slice(0, 4).map((f) => `- ${factSentence(f)}`);
  const fillers = [
    "- Every figure is traceable to a page in the team's published reports.",
    "- Estimates are labelled; gaps are shown as gaps.",
  ];
  while (bullets.length < 4) bullets.push(fillers[bullets.length % fillers.length]);
  const soWhat = narrow
    ? "So what: a measurable skills pipeline the partnership can point to, in the team's own figures."
    : "So what: partnership value that can be checked against the team's own reports.";
  return [title, ...bullets, soWhat].join("\n");
}

/* ------------------------------------------------ scenario explanation */

function scenarioExplanationTemplate(req: AiRequest): string {
  const d = new Map(req.derived.map((x) => [x.id, x]));
  const out: string[] = [];
  const ref = (id: string) => `[D:${id}]`;

  const total = d.get("sc-young-people");
  if (total) {
    out.push(
      total.value > 0
        ? `Together these plans would reach an estimated ${derivedValue(total)} beyond today's programmes ${ref(total.id)}, if no one is counted twice.`
        : `With every lever at zero, reach stays at the published baselines ${ref(total.id)}.`,
    );
  }
  const students = d.get("sc-mam-students");
  if (students && students.value > 0) {
    out.push(
      `Extra Make A Mark Day editions account for ${derivedValue(students)} ${ref(students.id)}, assuming each matches last year's day and your turnout holds.`,
    );
  }
  const stem = d.get("sc-stem-extra");
  if (stem && stem.value > 0) {
    out.push(`Growing the STEM learning programme adds ${derivedValue(stem)} ${ref(stem.id)}, scaled from its published reach.`);
  }
  const mentees = d.get("sc-mentees");
  const network = d.get("sc-network-growth");
  if (mentees && network && mentees.value > 0) {
    out.push(
      `Extra mentoring cohorts add ${derivedValue(mentees)} a year ${ref(mentees.id)}; if they match this year's outcomes, ${derivedValue(network)} would report a stronger professional network ${ref(network.id)}.`,
    );
  }
  out.push("Programme costs aren't published, so treat this as a planning aid rather than a forecast.");
  return out.join(" ");
}

/* ------------------------------------------------------------ story kit */

/** Names that end in one of these read as "the ..." ("the Racing Pride partnership"); event names don't ("Neurodiversity Week"). */
const TAKES_ARTICLE = /\b(programme|partnership|seat|internships|tours|Day|Event|Finals)(,.*)?$/;

/**
 * The programme as a sentence names it: the partner suffix dropped (the
 * partner is named separately), "The" moved to the article, and a common
 * first word lower-cased ("the para-canoe seat", "Unearth Your Greatness").
 */
function programmeName(initiative: Initiative): string {
  const bare = initiative.name
    .replace(/\s*\((with [^)]*)\)$/, "")
    .replace(/\s+with\s+(the\s+)?[A-Z].*$/, "")
    .replace(/^The\s+/, "");
  const named = lowerFirst(bare);
  return TAKES_ARTICLE.test(named) ? `the ${named}` : named;
}

/**
 * How each story-kit programme is introduced, in the charity's own voice
 * ("post") and in a funder's third person ("funder"). Written per programme
 * so the relationship reads the right way round; programmes outside the kit
 * get a neutral line.
 */
const STORY_KIT_VOICE: Record<string, { post: string; funder: string }> = {
  "stem-racing-world-finals": {
    post: "The Aston Martin Aramco Formula One Team supports STEM Racing, and was with us at the World Finals in Singapore.",
    funder: "The Aston Martin Aramco Formula One Team supports STEM Racing and took part in the World Finals in Singapore.",
  },
  "aleto-leadership": {
    post: "Our leadership programme pairs university students from under-represented backgrounds with mentors at the Aston Martin Aramco Formula One Team.",
    funder: "The Aleto Foundation runs a leadership programme for university students from under-represented backgrounds, with mentoring from the Aston Martin Aramco Formula One Team.",
  },
  "afbe-transition": {
    post: "Our Transition Event brought engineering and STEM students to the Aston Martin Aramco Formula One Team.",
    funder: "AFBE-UK held its Transition Event for engineering and STEM students with the Aston Martin Aramco Formula One Team.",
  },
  "racing-pride": {
    post: "We work with the Aston Martin Aramco Formula One Team on inclusion in motorsport, on track and in engineering.",
    funder: "Racing Pride works with the Aston Martin Aramco Formula One Team on inclusion in motorsport.",
  },
  "gp-trust-industry-day": {
    post: "The Aston Martin Aramco Formula One Team joined our Motorsport Industry Day to meet students thinking about careers in the sport.",
    funder: "The Aston Martin Aramco Formula One Team took part in The Grand Prix Trust's Motorsport Industry Day for students.",
  },
  "paddle-uk-seat": {
    post: "We worked with the Aston Martin Aramco Formula One Team and Darkside Canoes on a bespoke seat for a Paralympic paddler.",
    funder: "Paddle UK worked with the Aston Martin Aramco Formula One Team and Darkside Canoes on a bespoke para-canoe seat.",
  },
};

/** "Figures are for the 2024-2025 cohort." or "Figures are for 2025.", from the facts' own periods. */
function periodNote(facts: Fact[]): string {
  const period = facts.find((f) => /\d{4}/.test(f.period))?.period;
  if (!period) return "";
  return /cohort|season/i.test(period) ? `Figures are for the ${period}.` : `Figures are for ${period}.`;
}

function storyKitTemplate(req: AiRequest, facts: Fact[]): string {
  const initiative = initiatives.find((i) => i.id === req.params.initiative);
  const name = initiative ? programmeName(initiative) : "this programme";
  const partners = initiative?.partners.filter((p) => p !== "Cognizant") ?? [];
  const voice = initiative ? STORY_KIT_VOICE[initiative.id] : undefined;
  const lines = flowing(facts).map(factSentence);

  if (req.params.format === "funder") {
    // One formal, third-person paragraph for a grant or funder report; the
    // citations become numbered footnotes when it is copied.
    const who = partners.length > 1 ? `${partners.slice(0, -1).join(", ")} and ${partners.at(-1)}` : partners[0];
    // "The Aleto Foundation ... on its leadership programme", not the charity's name twice.
    const own = partners.length === 1 ? name.replace(new RegExp(`^the ${partners[0].replace(/^The /, "")}\\s+`), "its ") : name;
    const opener = !who
      ? `The Aston Martin Aramco Formula One Team runs ${name}.`
      : own === "its partnership"
        ? `${who} is a partner of the Aston Martin Aramco Formula One Team.`
        : `${who} ${partners.length > 1 ? "work" : "works"} with the Aston Martin Aramco Formula One Team on ${own}.`;
    return [voice?.funder ?? opener, periodNote(facts), ...lines.slice(0, 3), "Sources are given in the footnotes."]
      .filter(Boolean)
      .join(" ");
  }

  // The charity's own post, so it speaks as "we"; the team is always "the team".
  const intro = voice?.post ?? `We've been working with the Aston Martin Aramco Formula One Team on ${name}.`;
  const body: string[] = [];
  for (const l of lines) {
    body.push(l);
    if (words([intro, ...body].join(" ")) >= 55) break;
  }
  let text = [intro, ...body, "Every figure here comes from the team's published report, so anyone can check it."].join(" ");
  const extras = [
    "Thank you to everyone at the team who gave their time to it.",
    "It is the kind of work we want more young people to see.",
    "Find out more about the programme on our website.",
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
    case "leadership-update":
      return leadershipUpdateTemplate(req, facts);
    case "scenario-explanation":
      return scenarioExplanationTemplate(req);
    case "story-kit":
      return storyKitTemplate(req, facts);
    default:
      return facts.map(factSentence).join(" ");
  }
}
