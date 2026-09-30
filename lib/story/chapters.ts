/**
 * The story at "/": six chapters that follow the team's own footprint map
 * (2025 report, pp. 17-18): the campus, the supply chain, moving people and
 * parts, life at the circuit, then the people and places beyond the track,
 * and finally the targets.
 *
 * Every step changes something on the stage: a different layer (photo,
 * crop, graphic or quote), a highlight, or a purposeful push-in on what the
 * copy names. Copy rules (enforced by tests/unit/story-chapters.test.ts):
 * - no digits in any copy string: every figure is a fact, written as a
 *   `{f:fact-id}` token (rendered as <InlineFact>) or listed in `facts`
 *   (rendered as <FactValue>);
 * - every fact id exists in data/facts.json;
 * - no disputed figure, pay gap or per-round estimate outside the places the
 *   brief allows them.
 */
import type { ChapterId } from "@/lib/ai/requests";

type Tone = "paper" | "green";

/** A focal point as percentages of the image box (object-position / zoom centre). */
type Focal = { x: number; y: number };

export type ImageKey = "launch-quarter" | "launch-rear" | "render-rear" | "active-aero" | "launch-front";

export type StoryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** object-position at 1024px and wider, then below 1024px. */
  desktop: Focal;
  mobile: Focal;
  shape: "landscape" | "square";
};

export const STORY_IMAGES: Record<ImageKey, StoryImage> = {
  "launch-quarter": {
    src: "/brand/amr26-launch-quarter.jpg",
    width: 2800,
    height: 1600,
    alt: "The AMR26 in green team livery, seen from the front left in a studio",
    // Lower than centre so the car, not the studio backdrop, fills the box.
    desktop: { x: 45, y: 68 },
    mobile: { x: 40, y: 64 },
    shape: "landscape",
  },
  "launch-rear": {
    src: "/brand/amr26-launch-rear.jpg",
    width: 2800,
    height: 1600,
    alt: "The AMR26 from behind, showing the rear wing and rear tyres",
    // Far enough left that the front tyre clears the card column, the rear wing stays in frame.
    desktop: { x: 38, y: 66 },
    mobile: { x: 42, y: 64 },
    shape: "landscape",
  },
  "render-rear": {
    src: "/brand/amr26-render-rear.jpg",
    width: 2800,
    height: 1600,
    alt: "A render of the AMR26 from above and behind on a pale blue ground",
    desktop: { x: 52, y: 50 },
    mobile: { x: 54, y: 55 },
    shape: "landscape",
  },
  "active-aero": {
    src: "/brand/amr26-active-aero.png",
    width: 1024,
    height: 1024,
    alt: "Close-up render of the AMR26 nose and front suspension",
    // Framed on the nose and suspension rather than the front-wing endplate.
    desktop: { x: 70, y: 30 },
    mobile: { x: 78, y: 32 },
    shape: "square",
  },
  "launch-front": {
    src: "/brand/amr26-launch-front.jpg",
    width: 2800,
    height: 1600,
    alt: "The AMR26 seen head-on from above, front wing towards the camera",
    desktop: { x: 50, y: 40 },
    mobile: { x: 50, y: 40 },
    shape: "landscape",
  },
};

export type GraphicKey = "footprint" | "trackside" | "targets" | "tiles";

export type Tile = { key: string; factId: string; label: string };

export type Quote = {
  text: string;
  speaker: string;
  role: string;
  sourceId: string;
  page: number;
};

/** What the sticky stage can show. A chapter lists its layers; each step picks one. */
export type Layer =
  | { kind: "photo"; image: ImageKey }
  | { kind: "graphic"; graphic: Exclude<GraphicKey, "tiles"> }
  | { kind: "tiles"; title: string; tiles: Tile[] }
  | { kind: "quote"; quote: Quote };

type StepFact = { id: string; caption: string };

type Zoom = { scale: number; origin: Focal; mobileOrigin?: Focal };

export type Step = {
  /** One short serif paragraph. `{f:fact-id}` renders the fact inline with its status. */
  copy: string;
  /** Big figures shown under the paragraph. Only where the stage does not already show them. */
  facts?: StepFact[];
  /** Index into the chapter's layers. */
  layer: number;
  /** Parts of a graphic or tiles layer to highlight. */
  highlight?: string[];
  /** Push-in on a photo layer while this step is active (scale 1 to 2). */
  zoom?: Zoom;
};

export type DetailSection = {
  heading?: string;
  /** May contain `{f:fact-id}` tokens. */
  text?: string;
  facts?: string[];
  /** Page reference for a note that has no single fact. */
  cite?: { sourceId: string; page: number };
};

export type Chapter = {
  id: ChapterId;
  number: number;
  /** The chapter's one name: label above the heading and in the tracker. */
  name: string;
  title: string;
  dek: string;
  tone: Tone;
  layers: Layer[];
  steps: Step[];
  detail: DetailSection[];
};

export const STORY_TITLE = "Before the lights go out at Marina Bay";
export const STORY_DEK =
  "The carbon and the community work behind the team's race car, from the factory to Marina Bay, and how you can join in at the Singapore Grand Prix.";

/** The four reasons a fan reads on, one line each (brief: "Why a fan uses it"). */
export const WHAT_YOU_GET: { label: string; line: string }[] = [
  { label: "The story", line: "The side of the car the broadcast never shows, told as a feature rather than a report." },
  { label: "Know what's real", line: "Tap any figure to open the page of the team's report it came from." },
  { label: "Take part", line: "Real programmes at the Singapore Grand Prix and a practical way to get to Marina Bay." },
  { label: "Worth posting", line: "A race-week card with your quiz badge and one sourced team fact." },
];

const HAWKINS: Quote = {
  text: "You do deserve a place at that table.",
  speaker: "Jessica Hawkins",
  role: "Head of F1 Academy",
  sourceId: "esg-2025",
  page: 39,
};

export const CHAPTERS: Chapter[] = [
  {
    id: "campus",
    number: 1,
    name: "The campus",
    title: "A car factory with its own bees",
    dek: "The AMR26, this season's car, is designed, built and tested at the team's campus in Silverstone. Here is what changed there.",
    tone: "paper",
    layers: [
      { kind: "photo", image: "launch-front" },
      {
        kind: "tiles",
        title: "The campus in figures",
        tiles: [
          { key: "solar", factId: "e24-solar-panels", label: "on the campus roof" },
          { key: "circularity", factId: "e25-circularity", label: "circularity score of last season's car" },
          { key: "carbon-fibre", factId: "e25-carbon-fibre-recycled", label: "of carbon fibre recycled" },
          { key: "cups", factId: "e25-cups-removed", label: "taken out of the bin" },
          { key: "meadow", factId: "e25-wild-meadow", label: "of new wild meadow" },
          { key: "nature", factId: "e25-biodiversity-net-gain", label: "biodiversity net gain on site" },
        ],
      },
    ],
    steps: [
      {
        copy: "Everything the team buys, powers and throws away at the campus counts towards its footprint. Start with the roof: it carries {f:e24-solar-panels}, and the rest of the electricity comes from a renewable energy-backed supply.",
        layer: 0,
      },
      {
        copy: "The car is measured too. On the sport's new circularity scale, where a perfectly circular car would score full marks, last season's car scored {f:e25-circularity}. Offcuts of carbon fibre, {f:e25-carbon-fibre-recycled} of them, were recycled.",
        layer: 1,
        highlight: ["circularity", "carbon-fibre"],
      },
      {
        copy: "Small things add up. Scrapping disposable cups took {f:e25-cups-removed} out of the bin, which the team likens to {f:e25-cups-laps} of Silverstone in a petrol road car, its own comparison. Then came the bees: hives, a beekeeper and {f:e25-wild-meadow} of meadow.",
        layer: 1,
        highlight: ["cups", "meadow", "nature"],
      },
    ],
    detail: [
      {
        text: "Running the campus accounted for {f:e25-hq-energy}. On-site solar generated {f:e25-solar-gj} of electricity; in the previous report the panels produced {f:e24-solar-kwh} and saved {f:e24-solar-saving}.",
      },
      {
        text: "Losing the disposable cups saved {f:e25-cups-tco2e}. The laps comparison is the team's own and is not a standard conversion.",
      },
      {
        heading: "Method",
        text: "Circularity follows the FIA Circularity Handbook and applies to last season's car. The team describes its grid electricity as a renewable energy-backed supply. The solar panel count comes from the team's previous report.",
        facts: ["e25-circularity"],
      },
    ],
  },
  {
    id: "supply-chain",
    number: 2,
    name: "The supply chain",
    title: "Most of the footprint is things the team buys",
    dek: "Carbon fibre, electronics, catering and software: the biggest source of the team's emissions arrives through the factory gates.",
    tone: "green",
    layers: [
      // The campus photo again, moved in close on the front wing and suspension: the parts the team buys.
      { kind: "photo", image: "launch-front" },
      { kind: "graphic", graphic: "footprint" },
    ],
    steps: [
      {
        copy: "Behind every lap is a long list of suppliers. The materials, parts and services the team buys carry their own emissions long before they reach Silverstone.",
        facts: [{ id: "e25-supply-chain-share", caption: "of the team's footprint sits in its supply chain, not on the track" }],
        layer: 0,
        zoom: { scale: 1.8, origin: { x: 50, y: 88 } },
      },
      {
        copy: "This bar is the team's whole footprint for the year, {f:e25-ghg-total-sbti}. The highlighted block is the supply chain: {f:e25-supply-chain}.",
        layer: 1,
        highlight: ["supply-chain"],
      },
      {
        copy: "The next three blocks are freight and people on the move: moving cars and kit {f:e25-freight-logistics}, colleagues' commutes {f:e25-commuting} and trips to races and events {f:e25-business-travel}.",
        layer: 1,
        highlight: ["freight", "commuting", "business-travel"],
      },
      {
        copy: "The campus is the thin sliver at the end, {f:e25-hq-energy}. That is why the team is working with its suppliers on better data: it shows where cuts are possible.",
        layer: 1,
        highlight: ["hq-energy", "other"],
      },
    ],
    detail: [
      {
        text: "The bar shows the six categories in the report's own breakdown, which add up to the total.",
        facts: [
          "e25-ghg-total-sbti",
          "e25-supply-chain",
          "e25-commuting",
          "e25-freight-logistics",
          "e25-business-travel",
          "e25-hq-energy",
          "e25-other-emissions",
        ],
      },
      {
        heading: "Method",
        text: "These are market-based figures before Sustainable Aviation Fuel certificates, as in the report's breakdown. Scope one is fuel the team burns, scope two is electricity it buys, and scope three is everything else in its value chain, including suppliers.",
        cite: { sourceId: "esg-2025", page: 18 },
      },
    ],
  },
  {
    id: "moving",
    number: 3,
    name: "Moving the team",
    title: "Moving a Formula One team round the world",
    dek: "Cars, spares and whole garages travel by air, sea and road. A lower-carbon jet fuel is starting to change the numbers.",
    tone: "paper",
    layers: [
      { kind: "photo", image: "launch-rear" },
      {
        kind: "tiles",
        title: "Freight and travel in figures",
        tiles: [
          { key: "sea", factId: "e24-sea-freight-shift", label: "saved by moving freight from air to sea" },
          { key: "saf", factId: "e25-saf-avoided", label: "of air-freight emissions avoided with cleaner fuel" },
          { key: "saf-cut", factId: "e25-saf-airfreight-cut", label: "cut in the emissions tied to air freight" },
          { key: "travel-cut", factId: "e25-travel-logistics-cut", label: "fall in travel and logistics emissions on the year before" },
        ],
      },
    ],
    steps: [
      {
        copy: "A race weekend starts days earlier, in crates. Cars, spares and garage structures travel by air, sea and road. Where time allows, heavy kit goes by ship: that saved {f:e24-sea-freight-shift} in a single year, the previous report found.",
        layer: 0,
        zoom: { scale: 1, origin: { x: 55, y: 60 } },
      },
      {
        copy: "Much still has to fly. So the team bought Sustainable Aviation Fuel certificates: the fuel, made from waste and renewable materials, goes into the wider aviation network and the saving, {f:e25-saf-avoided}, is credited to the team.",
        layer: 0,
        // In on the rear wing: the part that flies between races in the team's own crates.
        zoom: { scale: 1.3, origin: { x: 68, y: 44 }, mobileOrigin: { x: 70, y: 46 } },
      },
      {
        copy: "That cut its air-freight emissions by {f:e25-saf-airfreight-cut}; the team likens the saving to {f:e25-saf-laps} of Silverstone in a petrol road car, its own comparison. With tighter planning, travel and logistics emissions fell {f:e25-travel-logistics-cut} on the year before.",
        layer: 1,
        highlight: ["saf", "saf-cut", "travel-cut"],
      },
      {
        copy: "What about your own trip to a race? Fans' travel is not part of the team's footprint: the report counts the team's own operations and its suppliers. The race-week section at the end compares ways of getting to Marina Bay.",
        layer: 0,
        zoom: { scale: 1, origin: { x: 55, y: 60 } },
      },
    ],
    detail: [
      {
        facts: ["e25-freight-logistics", "e25-business-travel"],
        text: "Freight is shown before Sustainable Aviation Fuel certificates, as in the report's breakdown.",
      },
      {
        heading: "Fans' travel",
        text: "The report counts the categories of scope three emissions that cover the team's own supply chain, freight, business travel and commuting. Spectators' journeys are not among them.",
        facts: ["g25-scope3-boundary"],
      },
      {
        heading: "Method",
        text: "The air-to-sea saving comes from the team's previous report. The certificates follow a book-and-claim system: the fuel is used across the aviation network and the verified saving is allocated to the buyer.",
        cite: { sourceId: "esg-2025", page: 24 },
      },
    ],
  },
  {
    id: "circuit",
    number: 4,
    name: "At the circuit",
    title: "What runs the garage on race day",
    dek: "The garage needs power from Friday practice to Sunday night. At European races it now comes from a shared, lower-carbon system.",
    tone: "green",
    layers: [
      { kind: "photo", image: "render-rear" },
      { kind: "graphic", graphic: "trackside" },
    ],
    steps: [
      {
        copy: "Once the freight lands, the garage is rebuilt around the car. At European races, Formula One runs a shared power system in the paddock, drawing on solar, biofuels, batteries and renewable grid supply instead of each team's own generators.",
        facts: [{ id: "e25-event-energy-cut", caption: "cut in paddock event energy emissions at European races" }],
        layer: 0,
      },
      {
        copy: "The team published what its own garage used at each European round. Most of it came from generators running on HVO, a renewable diesel.",
        layer: 1,
        highlight: ["hvo"],
      },
      {
        copy: "Renewable grid supply and solar made up the rest, where the circuit could offer them. Some rounds had no solar at all.",
        layer: 1,
        highlight: ["grid", "solar"],
      },
      {
        copy: "Singapore is a night race, run under floodlights. The team has not published trackside energy for Marina Bay, so the chart shows a gap rather than a guess.",
        layer: 1,
        highlight: ["singapore"],
      },
    ],
    detail: [
      {
        text: "The paddock energy cut applies to European races only. The chart shows the team's trackside electricity in kilowatt-hours, by source, as printed in the report.",
        cite: { sourceId: "esg-2025", page: 37 },
      },
      {
        heading: "Updated when the team publishes",
        text: "These figures come from the annual report. In the pilot plan, trackside energy would refresh after each race weekend once an approved data feed and an owner at the team exist.",
      },
    ],
  },
  {
    id: "beyond",
    number: 5,
    name: "Beyond the track",
    title: "Off the track: schools, mentors and woodland in Ethiopia",
    dek: "Belong and Community, in the team's words: work that reaches students in Singapore, mentees in Britain and families in the Ethiopian highlands.",
    tone: "paper",
    layers: [
      { kind: "photo", image: "launch-rear" },
      { kind: "quote", quote: HAWKINS },
      {
        kind: "tiles",
        title: "Beyond the track in figures",
        tiles: [
          { key: "stem", factId: "c25-stem-racing-students", label: "met at the STEM Racing World Finals" },
          { key: "maaden", factId: "c25-maaden-target", label: "the Unearth Your Greatness target" },
          { key: "charity", factId: "c25-charity-2025", label: "raised for charities over the year" },
          { key: "schools", factId: "e25-ethiopia-children", label: "at schools built with the Ethiopia woodland project" },
          { key: "removals", factId: "e25-removals", label: "of carbon removed by projects in Ethiopia, Kenya and the USA" },
          { key: "mentoring", factId: "b25-accelerate-pairs", label: "of mentors and mentees in Accelerate Women" },
        ],
      },
    ],
    steps: [
      {
        copy: "Last year the STEM Racing World Finals came to Singapore, where school teams design and race miniature cars. The team met students from {f:c25-stem-racing-countries} there, and launched Unearth Your Greatness with Maaden, whose name is on the car: a free STEM programme that aims to reach {f:c25-maaden-target}.",
        facts: [{ id: "c25-stem-racing-students", caption: "reached at the World Finals launch" }],
        layer: 0,
        // In on the Maaden name on the engine cover, well away from the other sponsors.
        zoom: { scale: 1.9, origin: { x: 46, y: 45 }, mobileOrigin: { x: 44, y: 45 } },
      },
      {
        copy: "Inside the sport, the team mentors people who rarely get a seat at the table. Accelerate Women, with Arm, matched mentors and mentees in {f:b25-accelerate-pairs}; {f:b25-aleto-network} of Aleto Foundation mentees said it grew their network; AFBE-UK's event hosted {f:b25-afbe-students}.",
        layer: 1,
      },
      {
        copy: "Colleagues raise money too, through hikes, football matches and marathons, with the team matching their efforts. Over the year they raised {f:c25-charity-2025} for charities close to the team.",
        layer: 2,
        highlight: ["charity"],
      },
      {
        copy: "Further away, the team pays for projects that take carbon out of the air, {f:e25-removals} last year. One restores woodland in the Ethiopian highlands and has helped build schools for {f:e25-ethiopia-children}. Removals deal with emissions the team cannot eliminate yet.",
        layer: 2,
        highlight: ["schools", "removals"],
      },
    ],
    detail: [
      {
        heading: "Carbon removals",
        text: "Removals equalled {f:e25-removals-vs-scope12} of the team's direct and electricity emissions. They address emissions that cannot be eliminated straight away; they do not cancel the rest of the footprint, and the team's targets are about cutting emissions first.",
        cite: { sourceId: "esg-2025", page: 26 },
      },
      {
        heading: "Who works at the team",
        text: "The team's answer is to widen the way in, through Accelerate Women with Arm, the Aleto Foundation leadership programme and the AFBE-UK Transition Event. Women make up {f:b25-women-share} of the workforce.",
      },
      {
        text: "A gender pay gap is not the same as unequal pay. Equal pay means the same pay for the same work. The pay gap compares average pay across the whole team, so it reflects who holds which roles: the team says it shows the need for more women across roles and levels.",
        facts: ["b25-pay-gap-median", "b25-pay-gap-mean"],
        cite: { sourceId: "esg-2025", page: 55 },
      },
    ],
  },
  {
    id: "finish",
    number: 6,
    name: "The finish line",
    title: "The targets, and how far there is to go",
    dek: "The team has science-based targets for the end of the decade and for net zero. Here is where it stands, in its own chart.",
    tone: "green",
    layers: [
      { kind: "graphic", graphic: "targets" },
      { kind: "photo", image: "launch-quarter" },
    ],
    steps: [
      {
        copy: "The chart starts from the restated baseline, {f:e23-ghg-baseline}. Last year's footprint was {f:e25-ghg-total-sbti}, and the end-of-decade target is {f:e25-target-2030-tco2e}.",
        layer: 0,
        highlight: ["baseline", "current", "target-2030"],
      },
      {
        copy: "Split it up and progress is uneven. Emissions from the fuel and electricity the team uses directly are already past the end-of-decade target of a {f:e25-target-scope12} cut.",
        layer: 0,
        highlight: ["scope12"],
      },
      {
        copy: "The supply chain is harder. Emissions across the rest of the value chain have moved much less, against a target of a {f:e25-target-scope3} cut by the end of the decade.",
        layer: 0,
        highlight: ["scope3"],
      },
      {
        copy: "Net zero by {f:e25-target-netzero-year} means cutting absolute emissions by {f:e25-target-netzero-cut}, leaving no more than {f:e25-target-2050-tco2e} for carbon removals. The Science Based Targets initiative has validated these targets.",
        layer: 0,
        highlight: ["target-2050"],
      },
      {
        copy: "How do you know any of this is true? Independent assurers checked the carbon inventory, CDP rated the team's climate disclosure {f:g25-cdp}, and every figure here opens the report page it came from.",
        layer: 1,
        zoom: { scale: 1, origin: { x: 50, y: 60 } },
      },
    ],
    detail: [
      {
        facts: ["e25-target-scope12", "e25-target-scope3", "e25-target-netzero-cut", "e25-target-2030-tco2e", "e25-target-2050-tco2e"],
      },
      {
        heading: "Why this story does not compare years",
        text: "The team restated its earlier carbon figures after its targets were validated. This story uses the report's own progress figures and target chart rather than comparing one year's total with another's.",
        facts: ["g25-restatement"],
      },
      {
        heading: "Checks",
        facts: ["g25-sbti", "g25-assurance", "g25-cdp"],
      },
    ],
  },
];

/* ----------------------------------------------------------- tokens */

const TOKEN_RE = /\{f:([a-z0-9]+(?:-[a-z0-9]+)*)\}/g;

export type CopyPart = { kind: "text"; text: string } | { kind: "fact"; id: string };

/** Splits copy into text runs and `{f:id}` fact tokens. */
export function parseCopy(copy: string): CopyPart[] {
  const out: CopyPart[] = [];
  let last = 0;
  for (const m of copy.matchAll(TOKEN_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ kind: "text", text: copy.slice(last, i) });
    out.push({ kind: "fact", id: m[1] });
    last = i + m[0].length;
  }
  if (last < copy.length) out.push({ kind: "text", text: copy.slice(last) });
  return out;
}

/** Every fact id a chapter shows: tokens, big figures, tiles and detail facts. */
export function chapterFactIds(c: Chapter): string[] {
  const ids = new Set<string>();
  const fromCopy = (s?: string) => s && parseCopy(s).forEach((p) => p.kind === "fact" && ids.add(p.id));
  for (const s of c.steps) {
    fromCopy(s.copy);
    s.facts?.forEach((f) => ids.add(f.id));
  }
  for (const l of c.layers) if (l.kind === "tiles") l.tiles.forEach((t) => ids.add(t.factId));
  for (const d of c.detail) {
    fromCopy(d.text);
    d.facts?.forEach((id) => ids.add(id));
  }
  return [...ids];
}

/** Every human-readable string in the story config, for the copy tests. */
export function allCopyStrings(): string[] {
  const out: string[] = [STORY_TITLE, STORY_DEK, ...WHAT_YOU_GET.flatMap((w) => [w.label, w.line])];
  for (const c of CHAPTERS) {
    out.push(c.name, c.title, c.dek);
    for (const l of c.layers) {
      if (l.kind === "tiles") out.push(l.title, ...l.tiles.map((t) => t.label));
      if (l.kind === "quote") out.push(l.quote.text, l.quote.speaker, l.quote.role);
    }
    for (const s of c.steps) out.push(s.copy, ...(s.facts ?? []).map((f) => f.caption));
    for (const d of c.detail) out.push(...[d.heading, d.text].filter((x): x is string => Boolean(x)));
  }
  return out;
}
