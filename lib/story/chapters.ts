/**
 * The story at "/": six chapters that follow the team's own footprint map
 * (2025 report, pp. 17-18): the campus, the supply chain, moving people and
 * parts, life at the circuit, then the people and places beyond the track,
 * and finally the targets.
 *
 * Copy rules (enforced by tests/unit/story-chapters.test.ts):
 * - no digits in any copy string: every figure is a fact, written as a
 *   `{f:fact-id}` token (rendered as <InlineFact>) or listed in `facts`
 *   (rendered as <FactValue>);
 * - every fact id exists in data/facts.json;
 * - no fact with a source conflict, pay gap or per-round estimate outside
 *   the places the brief allows them.
 */
import type { ChapterId } from "@/lib/ai/requests";


type Tone = "paper" | "green";

/** A focal point as percentages of the image box (object-position / transform-origin). */
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
    desktop: { x: 45, y: 55 },
    mobile: { x: 36, y: 62 },
    shape: "landscape",
  },
  "launch-rear": {
    src: "/brand/amr26-launch-rear.jpg",
    width: 2800,
    height: 1600,
    alt: "The AMR26 from behind, showing the rear wing and rear tyres",
    desktop: { x: 45, y: 60 },
    mobile: { x: 64, y: 60 },
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
    alt: "Close-up render of the AMR26 nose and front wing",
    desktop: { x: 50, y: 45 },
    mobile: { x: 70, y: 50 },
    shape: "square",
  },
  "launch-front": {
    src: "/brand/amr26-launch-front.jpg",
    width: 2800,
    height: 1600,
    alt: "The AMR26 seen head-on from above, front wing towards the camera",
    desktop: { x: 50, y: 50 },
    mobile: { x: 50, y: 50 },
    shape: "landscape",
  },
};

export type GraphicKey = "footprint" | "trackside" | "targets";

type StepFact = { id: string; caption: string };

type Quote = {
  text: string;
  speaker: string;
  role: string;
  sourceId: string;
  page: number;
};

export type Step = {
  /** One short serif paragraph. `{f:fact-id}` renders the fact inline with its status. */
  copy: string;
  /** Big figures shown under the paragraph. */
  facts?: StepFact[];
  quote?: Quote;
  /** Shows the chapter's graphic instead of the photo, with these parts highlighted. */
  graphic?: { key: GraphicKey; highlight: string[] };
  /** Slow push-in on the photo for this step. Scale stays between 1 and 1.2. */
  zoom?: { scale: number; origin: Focal; mobileOrigin?: Focal };
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
  /** Chapter label above the heading. */
  kicker: string;
  /** Short label for the chapter tracker. */
  short: string;
  title: string;
  dek: string;
  tone: Tone;
  image: ImageKey;
  graphic?: GraphicKey;
  steps: Step[];
  detail: DetailSection[];
};

export const STORY_TITLE = "Before the lights go out at Marina Bay";
export const STORY_DEK =
  "Where the AMR26 is built, how it travels, what powers the garage, who the team reaches and how far it still has to go.";

/** The four reasons a fan reads on, one line each (brief: "Why a fan uses it"). */
export const WHAT_YOU_GET: { label: string; line: string }[] = [
  { label: "The story", line: "The side of the car the broadcast never shows, told as a feature rather than a report." },
  { label: "Know what's real", line: "Tap any figure to open the page of the team's report it came from." },
  { label: "Take part", line: "Real programmes at the Singapore Grand Prix and a practical way to get to Marina Bay." },
  { label: "Worth posting", line: "A race-week card with your quiz badge and one sourced team fact." },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "campus",
    number: 1,
    kicker: "The campus",
    short: "The campus",
    title: "A car factory with its own bees",
    dek: "The AMR26 is designed, built and tested at the AMR Technology Campus in Silverstone. Here is what the team changed there.",
    tone: "paper",
    image: "launch-quarter",
    steps: [
      {
        copy: "Before a car reaches the grid, it is drawn, machined, painted and tested at the team's campus in Silverstone. Everything the team buys, powers and throws away there counts towards its footprint.",
        zoom: { scale: 1, origin: { x: 50, y: 55 } },
      },
      {
        copy: "Start with the roof. It is covered in solar panels, which supply part of the electricity the campus runs on. The rest comes from a renewable energy-backed supply.",
        facts: [{ id: "e24-solar-panels", caption: "solar panels on the campus roof, counted in the team's previous report" }],
        zoom: { scale: 1.02, origin: { x: 50, y: 52 } },
      },
      {
        copy: "The car is measured as well. On the sport's new circularity scale, where a perfectly circular car would score full marks, last season's car scored {f:e25-circularity}. Offcuts of carbon fibre, {f:e25-carbon-fibre-recycled} of them, were recycled.",
        zoom: { scale: 1.04, origin: { x: 52, y: 54 } },
      },
      {
        copy: "Small things add up. Scrapping disposable coffee cups took {f:e25-cups-removed} out of the bin. The team compares the carbon saved to {f:e25-cups-laps} of Silverstone in a petrol road car, its own comparison.",
        zoom: { scale: 1.06, origin: { x: 48, y: 58 } },
      },
      {
        copy: "And there are bees. Hives now sit on site, looked after by an in-house beekeeper, beside {f:e25-wild-meadow} of new wild meadow.",
        facts: [{ id: "e25-biodiversity-net-gain", caption: "biodiversity net gain across the campus grounds" }],
        zoom: { scale: 1.08, origin: { x: 48, y: 56 } },
      },
      {
        copy: "The campus is where the car comes to life, but running it accounted for only {f:e25-hq-energy}. Most of the team's carbon starts somewhere else entirely.",
        zoom: { scale: 1.1, origin: { x: 50, y: 55 } },
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
        text: "Circularity follows the FIA Circularity Handbook and applies to last season's car. The team describes its grid electricity as a renewable energy-backed supply.",
        facts: ["e25-circularity"],
      },
    ],
  },
  {
    id: "supply-chain",
    number: 2,
    kicker: "The supply chain",
    short: "Supply chain",
    title: "Most of the footprint is things the team buys",
    dek: "Carbon fibre, electronics, catering and software: the biggest source of the team's emissions arrives through the factory gates.",
    tone: "green",
    image: "active-aero",
    graphic: "footprint",
    steps: [
      {
        copy: "Behind every lap is a long list of suppliers. The materials, parts and services the team buys carry their own emissions long before they reach Silverstone.",
        facts: [{ id: "e25-supply-chain-share", caption: "of the team's footprint sits in its supply chain, not on the track" }],
        zoom: { scale: 1, origin: { x: 50, y: 45 } },
      },
      {
        copy: "This bar is the team's whole footprint for the year, {f:e25-ghg-total-sbti}. The highlighted block is the supply chain: {f:e25-supply-chain}.",
        graphic: { key: "footprint", highlight: ["supply-chain"] },
      },
      {
        copy: "Next is freight: moving cars, parts and garage kit round the world came to {f:e25-freight-logistics}. The next chapter follows it.",
        graphic: { key: "footprint", highlight: ["freight"] },
      },
      {
        copy: "Two blocks are people on the move. Getting colleagues to work added {f:e25-commuting}; flying people to races and events added {f:e25-business-travel}.",
        graphic: { key: "footprint", highlight: ["commuting", "business-travel"] },
      },
      {
        copy: "The campus you just toured is the thin sliver at the end, {f:e25-hq-energy}. That is why the team is working with suppliers on better data: it shows where cuts are possible.",
        graphic: { key: "footprint", highlight: ["hq-energy", "other"] },
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
    kicker: "Freight and travel",
    short: "Moving the team",
    title: "Moving a Formula One team round the world",
    dek: "Cars, spares and whole garages travel by air, sea and road. A lower-carbon jet fuel is starting to change the numbers.",
    tone: "paper",
    image: "launch-rear",
    steps: [
      {
        copy: "A race weekend starts days earlier, in crates. Cars, tools, spare parts and garage structures travel by air, sea, rail and road, and a packed calendar leaves little slack.",
        zoom: { scale: 1, origin: { x: 50, y: 58 } },
      },
      {
        copy: "Where time allows, heavy kit goes by ship rather than plane. Moving freight from air to sea saved {f:e24-sea-freight-shift} in a single year, the team's previous report found.",
        zoom: { scale: 1.02, origin: { x: 50, y: 58 } },
      },
      {
        copy: "Much still has to fly. So the team bought Sustainable Aviation Fuel certificates: the fuel, made from waste and renewable materials, goes into the wider aviation network and the saving is credited to the team.",
        facts: [{ id: "e25-saf-avoided", caption: "of air-freight emissions avoided by the team's first Sustainable Aviation Fuel purchase" }],
        zoom: { scale: 1.04, origin: { x: 52, y: 57 } },
      },
      {
        copy: "That cut the emissions tied to its air freight by {f:e25-saf-airfreight-cut}. The team compares the saving to {f:e25-saf-laps} of Silverstone in a petrol road car, its own comparison.",
        zoom: { scale: 1.06, origin: { x: 54, y: 57 } },
      },
      {
        copy: "Add tighter planning and the team's travel and logistics emissions fell {f:e25-travel-logistics-cut} on the year before, using the report's own comparison.",
        zoom: { scale: 1.08, origin: { x: 50, y: 58 } },
      },
      {
        copy: "What about your own trip to a race? Fans' travel is not part of the team's footprint: the report counts the team's own operations and its suppliers. The race-week section at the end compares ways of getting to Marina Bay.",
        zoom: { scale: 1.1, origin: { x: 48, y: 58 } },
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
    kicker: "At the circuit",
    short: "At the circuit",
    title: "What runs the garage on race day",
    dek: "The garage needs power from Friday practice to Sunday night. At European races it now comes from a shared, lower-carbon system.",
    tone: "green",
    image: "render-rear",
    graphic: "trackside",
    steps: [
      {
        copy: "Once the freight lands, the garage is rebuilt around the car. Every screen, tool and computer in it needs power from the first practice session to the chequered flag.",
        zoom: { scale: 1, origin: { x: 52, y: 50 } },
      },
      {
        copy: "At European races, Formula One runs a shared power system in the paddock, drawing on solar, biofuels, batteries and renewable grid supply instead of each team's own generators.",
        facts: [{ id: "e25-event-energy-cut", caption: "cut in event energy emissions in paddock areas at European races, against previous setups" }],
        zoom: { scale: 1.04, origin: { x: 52, y: 50 } },
      },
      {
        copy: "The team published what its own garage used at each European round. Most of it came from generators running on HVO, a renewable diesel.",
        graphic: { key: "trackside", highlight: ["hvo"] },
      },
      {
        copy: "Renewable grid supply and solar made up the rest, where the circuit could offer them. Some rounds had no solar at all.",
        graphic: { key: "trackside", highlight: ["grid", "solar"] },
      },
      {
        copy: "Singapore is a night race, run under floodlights. The team has not published trackside energy for Marina Bay, so the chart shows a gap rather than a guess.",
        graphic: { key: "trackside", highlight: ["singapore"] },
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
    kicker: "Belong and Community",
    short: "Beyond the track",
    title: "Off the track: schools, mentors and woodland in Ethiopia",
    dek: "The team's work reaches students in Singapore, mentees in Britain and families in the Ethiopian highlands.",
    tone: "paper",
    image: "active-aero",
    steps: [
      {
        copy: "Last year the STEM Racing World Finals came to Singapore, where school teams design and race miniature cars. The team met students there from {f:c25-stem-racing-countries}.",
        facts: [{ id: "c25-stem-racing-students", caption: "students reached at the World Finals launch of Unearth Your Greatness" }],
        zoom: { scale: 1, origin: { x: 50, y: 45 } },
      },
      {
        copy: "That launch was with Maaden, whose name is on the car. Unearth Your Greatness is a free STEM learning programme that aims to reach {f:c25-maaden-target}.",
        zoom: { scale: 1.12, origin: { x: 22, y: 22 } },
      },
      {
        copy: "Inside the sport, the team mentors people who rarely get a seat at the table. Accelerate Women, run with Arm, matched mentors and mentees in {f:b25-accelerate-pairs}.",
        zoom: { scale: 1.14, origin: { x: 30, y: 30 } },
      },
      {
        copy: "Students from under-represented backgrounds joined the Aleto Foundation's leadership programme; {f:b25-aleto-network} said it grew their professional network. The AFBE-UK Transition Event hosted {f:b25-afbe-students} from under-represented ethnic backgrounds.",
        zoom: { scale: 1.16, origin: { x: 40, y: 38 } },
      },
      {
        copy: "Jessica Hawkins, head of F1 Academy, had a message for anyone wondering whether motorsport is for them.",
        quote: {
          text: "You do deserve a place at that table.",
          speaker: "Jessica Hawkins",
          role: "Head of F1 Academy",
          sourceId: "esg-2025",
          page: 39,
        },
        zoom: { scale: 1.17, origin: { x: 52, y: 48 } },
      },
      {
        copy: "Colleagues raise money too, through hikes, football matches and marathons, with the team matching their efforts. Over the year they raised {f:c25-charity-2025} for charities close to the team.",
        zoom: { scale: 1.18, origin: { x: 60, y: 55 } },
      },
      {
        copy: "Further away, the team pays for projects that take carbon out of the air. One restores woodland in the Ethiopian highlands and has helped build primary schools for {f:e25-ethiopia-children}. Removals deal with emissions the team cannot eliminate yet.",
        facts: [{ id: "e25-removals", caption: "of carbon removed by projects in Ethiopia, Kenya and the USA" }],
        zoom: { scale: 1.2, origin: { x: 64, y: 60 } },
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
    kicker: "The finish line",
    short: "The finish line",
    title: "The targets, and how far there is to go",
    dek: "The team has science-based targets for the end of the decade and for net zero. Here is where it stands, in its own chart.",
    tone: "green",
    image: "launch-front",
    graphic: "targets",
    steps: [
      {
        copy: "The team has committed to net zero across its whole value chain by {f:e25-target-netzero-year}, with nearer targets for the end of this decade. The Science Based Targets initiative has validated both.",
        zoom: { scale: 1, origin: { x: 50, y: 50 } },
      },
      {
        copy: "The chart starts from the restated baseline, {f:e23-ghg-baseline}. When the method changed, the team restated its earlier figures, so older totals are not directly comparable.",
        graphic: { key: "targets", highlight: ["baseline"] },
      },
      {
        copy: "Last year's footprint was {f:e25-ghg-total-sbti}. The end-of-decade target is {f:e25-target-2030-tco2e}.",
        graphic: { key: "targets", highlight: ["current", "target-2030"] },
      },
      {
        copy: "Split it up and progress is uneven. Emissions from the fuel and electricity the team uses directly are already past the end-of-decade target of a {f:e25-target-scope12} cut.",
        facts: [{ id: "e25-progress-scope12", caption: "change in the team's direct and electricity emissions since the baseline year" }],
        graphic: { key: "targets", highlight: ["scope12"] },
      },
      {
        copy: "The supply chain is harder. Emissions across the rest of the value chain have moved much less, against a target of a {f:e25-target-scope3} cut by the end of the decade.",
        facts: [{ id: "e25-progress-scope3", caption: "change in emissions across the rest of the value chain since the baseline year" }],
        graphic: { key: "targets", highlight: ["scope3"] },
      },
      {
        copy: "Net zero means cutting absolute emissions by {f:e25-target-netzero-cut}, leaving no more than {f:e25-target-2050-tco2e} for carbon removals to deal with.",
        graphic: { key: "targets", highlight: ["target-2050"] },
      },
      {
        copy: "How do you know any of this is true? Independent assurers checked the carbon inventory, CDP rated the team's climate disclosure {f:g25-cdp}, and every figure here opens the report page it came from.",
        zoom: { scale: 1.04, origin: { x: 50, y: 52 } },
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

/** Every fact id a chapter shows: tokens, big figures and detail facts. */
export function chapterFactIds(c: Chapter): string[] {
  const ids = new Set<string>();
  const fromCopy = (s?: string) => s && parseCopy(s).forEach((p) => p.kind === "fact" && ids.add(p.id));
  for (const s of c.steps) {
    fromCopy(s.copy);
    s.facts?.forEach((f) => ids.add(f.id));
  }
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
    out.push(c.kicker, c.short, c.title, c.dek);
    for (const s of c.steps) {
      out.push(s.copy, ...(s.facts ?? []).map((f) => f.caption));
      if (s.quote) out.push(s.quote.text, s.quote.speaker, s.quote.role);
    }
    for (const d of c.detail) out.push(...[d.heading, d.text].filter((x): x is string => Boolean(x)));
  }
  return out;
}
