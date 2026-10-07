# Off Camera design system

Off Camera reads like a newspaper visual feature about a racing car, not like an ESG report and not like an AI dashboard. Warm paper, racing green, serif storytelling, condensed numbers, one lime accent. Every figure opens to the page of the team's own report it came from.

The reference is the Straits Times visual feature "No mere child's play": one idea per screen, opaque caption cards on a fixed column over a sticky picture, a full viewport of breathing room between cards, serif prose with sans-serif metadata, and graphics that a chapter card introduces before they appear.

Tokens and classes live in `app/globals.css`. The shared components live in `components/shared/`. If this document and the code disagree, fix one of them in the same change.

## Principles

1. **One idea per screen.** A chapter makes one plain point per step. Detail goes in a "The detail" disclosure, not on top of the story.
2. **Trust is visible.** Every number shows its status (Verified or Estimated) and a source line such as "2025 report, p. 42 ↗". The whole figure is a button that opens the provenance drawer.
3. **The car carries the story.** The approved AMR26 images in `public/brand/` anchor each chapter. Never crop out or distort the car, never put text on a photo.
4. **Nothing simulated in the product.** No invented counters, feeds, events, credits or illustrative programmes. Where the team has not published a figure, show a Data gap.
5. **Mobile first for fans, projector first for partners.** Fan pages are designed at 390 px and scale up to 1440. The partner desk is designed at 1440 to 1920 and still works at 390.

## Colour

### Palette

| Token                                  | Value                           | Use                                                                                   |
| -------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| `paper`                                | `#F5F3EC`                       | Page ground                                                                           |
| `paper-2`                              | `#ECE9E0`                       | Quiet panels, hover                                                                   |
| `white` / `card`                       | `#FFFFFF`                       | Story cards, raised surfaces                                                          |
| `racing`                               | `#00594F`                       | Brand fill, links and the highlighted mark on paper (7.44:1)                          |
| `green`                                | `#0B3B32`                       | Immersive ground (footer, green chapters, share card)                                 |
| `green-2`                              | `#0F4A3F`                       | Raised surface on green                                                               |
| `on-green`, `on-green-2`, `on-green-3` | `#F3F1EA`, `#B9CCC5`, `#8FAAA1` | Text on green (11.02, 7.42, 5.00:1)                                                   |
| `green-line`, `green-line-strong`      | `#2F6457`, `#5E9183`            | Hairlines and axes on green                                                           |
| `lime`                                 | `#CEDC00`                       | Primary button fill, active markers, highlight on green. Never text on paper (1.36:1) |
| `lime-ink`                             | `#15201C`                       | Text on lime                                                                          |
| `lime-tint`                            | `#EEF3B8`                       | Selected chip fill                                                                    |
| `lime-hover`                           | `#BCC900`                       | Primary button hover                                                                  |

### Semantic tokens and tones

Components use semantic tokens only. `:root` (and `data-tone="paper"`) sets them for paper; `data-tone="green"` redefines the same names for the green ground, so a component works unchanged on either. A tone scope paints its own background and text colour.

| Token         | Paper                               | Green             |
| ------------- | ----------------------------------- | ----------------- |
| `bg`          | paper                               | green             |
| `surface`     | white                               | green-2           |
| `surface-2`   | paper-2                             | green-2           |
| `ink`         | `#15201C` (15.07:1)                 | on-green          |
| `ink-2`       | `#3F4B46` (8.20:1)                  | on-green-2        |
| `ink-3`       | `#5C6863` (5.23:1)                  | on-green-3        |
| `line`        | `#D9D5CA` (decorative only)         | green-line        |
| `line-strong` | `#7F8782` (3.32:1, inputs and axes) | green-line-strong |
| `highlight`   | racing                              | lime              |
| `link`        | racing                              | lime              |
| `focus`       | racing                              | lime              |
| `verified`    | `#4A6B00`                           | `#CEDC00`         |
| `estimated`   | `#8A5300`                           | `#F2B84B`         |
| `simulated`   | `#1D5D8C`                           | `#7CC6FE`         |
| `conflict`    | `#B03A1C`                           | `#FF8A65`         |

```tsx
<section data-tone="green">…</section>          // green chapter
<div data-tone="paper" className="bg-card">…</div>  // a light card inside a green chapter
```

Story cards are always light, even in green chapters: give them `data-tone="paper"`. Status colours mean trust status and nothing else. The colour-scheme is light.

## Type

All fonts are self-hosted through `@fontsource-variable` (Newsreader, Archivo, JetBrains Mono). No Google Fonts, no CDN.

| Class           | Font                                                           | Size                                                          | Use                                              |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `.h1-feature`   | Newsreader 500                                                 | clamp(2rem, 1.25rem + 3vw, 4.25rem), lh 1.08, max 18ch        | Page title; centred on the story title page only |
| `.h2-chapter`   | Newsreader 500                                                 | clamp(1.75rem, 1.2rem + 2.2vw, 3rem), lh 1.1                  | Chapter and section headings                     |
| `.h3`           | Newsreader 600                                                 | clamp(1.375rem, 1.2rem + .6vw, 1.75rem), lh 1.2               | Sub-heads, card titles                           |
| `.dek`          | Newsreader 400, ink-2                                          | clamp(1.25rem, 1.1rem + .5vw, 1.5rem), lh 1.33, max 34ch      | One-line summary under a heading                 |
| `.prose-body`   | Newsreader                                                     | clamp(1.125rem, 1.05rem + .3vw, 1.3125rem), lh 1.45, max 65ch | Body and card text (cards set 40ch)              |
| `.kicker`       | Archivo 600, 12/16, uppercase, .06em                           |                                                               | Chapter labels, bylines, metadata                |
| `.kicker-rule`  | adds a 2px × 32px ink rule above                               |                                                               | Use with `.kicker` above every chapter label     |
| `.label`        | as `.kicker`, in ink-3                                         |                                                               | Legacy alias; prefer `.kicker`                   |
| `.num`          | Archivo, tabular lining figures                                |                                                               | Every number in running UI and tables            |
| `.big-num`      | Archivo 75% width 700, clamp(3rem, 2rem + 5vw, 7.5rem), lh .95 |                                                               | Hero figures                                     |
| `.big-num-unit` | .35em, 100% width, 500                                         |                                                               | The unit stacked under a big number              |

JetBrains Mono (`font-mono`) is only for fact ids, page references in technical views, API and CSV text, at 12 px. Nav and buttons use Archivo 15 to 16 px at 500 to 600. There are no uppercase headings at scale.

Other helpers: `.wrap` (fan frame, max 1440), `.wrap-desk` (partner frame, max 1680), `.measure` (680 px reading column), `.link` (underlined link in the tone's link colour), `.rule` (1px hairline).

## Layout

- 12-column grid, 24 px gap. Side margins 16 px below 640, 24 px from 640 to 1023, min(5vw, 80px) from 1024 (`.wrap` does this).
- Spacing scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section rhythm clamp(64px, 10vw, 128px).
- Radius: 2 px badges, 4 px cards, buttons and inputs, 0 on images.
- Hairlines are 1px `line`. Inputs and chart axes use `line-strong`.
- Every layout works at 390 px and at 1920 × 1080 with no horizontal scroll.

## Scrollytelling

```html
<section class="chapter" data-tone="paper|green" aria-labelledby="…">
  <header class="chapter-open">kicker, H2, one-line dek</header>
  <div class="scrolly">
    <div class="stage" aria-hidden>
      <!-- sticky; top: 56px; height: calc(100svh - 56px) -->
      <figure class="layer" data-step="0" data-active>image + visible credit</figure>
    </div>
    <ol class="steps">
      <!-- margin-top: -100svh; relative; z-1 -->
      <li class="step" data-step="n">card</li>
    </ol>
  </div>
</section>
```

- **Desktop (1024 and up).** The image box sits at left 30vw, width 70vw; the left 30% is solid chapter ground with a hard edge. Cards are min(420px, 34vw) wide, aligned to the page margin and overlapping the image edge slightly: opaque white, 1px `line-strong` border, 4 px radius, padding 20/20/24, serif text. Steps are 88svh tall from 1024 px with the card vertically centred in the first screen of the step; the last step carries a shorter tail so the stage lingers.
- **Mobile.** The picture or chart box fills the top of the stage (up to min(58svh, 100vw)); solid ground below. Cards are calc(100vw − 32px) and rest just under the box, so a card never covers the part of a chart its step discusses.
- **Active step.** One IntersectionObserver with rootMargin "-50% 0px -50% 0px" and threshold 0 sets `data-active-step` on the stage. Cards never animate.
- **Transitions.** Layers dip to ground: the outgoing layer fades out over 240 ms (cubic-bezier(.4, 0, 1, 1)), the incoming one fades in over 360 ms (cubic-bezier(0, 0, .2, 1)) after 180 ms, so a chart never double-exposes over a photo. Every photo first appears whole at scale 1; a later step may push in to about 1.35 over 1600 ms (`--settle`, cubic-bezier(.22, .61, .36, 1)) after a 200 ms beat, as a composited translate and scale about the step's focal point. Chart marks grow from their axis the first time their layer appears (armed only after hydration). With reduced motion there is no scale and a 120 ms opacity swap.
- **Without JavaScript.** The server renders layer 0 active and every card in the HTML. No text or number may render below full opacity or displaced before scripts run. No reveal-on-scroll for text or numbers.
- **Image crops** (object-position desktop / mobile). Every image carries a visible "Image: Aston Martin Aramco" credit.

| Use                                       | Image                                                            | Desktop | Mobile  |
| ----------------------------------------- | ---------------------------------------------------------------- | ------- | ------- |
| Title band, at the circuit, share card    | `amr26-launch-quarter.jpg`                                       | 45% 68% | 40% 64% |
| Campus, the finish line, race page header | `amr26-render-rear.jpg`, contained whole on its pale blue ground | 52% 50% | 54% 55% |
| Supply chain                              | `amr26-launch-front.jpg`                                         | 50% 40% | 50% 40% |
| Moving the team, beyond the track         | `amr26-launch-rear.jpg`                                          | 38% 66% | 42% 64% |

Every use of a photo shares one `sizes` value (`STORY_SIZES` in `lib/story/chapters.ts`), so the browser downloads each photo once; phones stop at 130vw. No sponsor's name is ever the focal point of a push-in beside copy about young people.

- **Title page.** Paper ground, 100svh. The title block is centred in the top 55%; the quarter image is a full-width band at the bottom (max 45svh, object-position 45% 68%, 40% 64% on phones); on phones the title block is left-aligned. Scroll cue: "Scroll to follow the car" as a 12 px kicker above a 1px × 24px vertical line in ink-3.
- **Chapter tracker.** A 40 px strip below the header, sticky within the story, with five or six labelled segments that are links. Active: ink text at 600 and a 2px lime bar with a 1px ink outline, plus `aria-current="step"`. Mobile shows "2/6 · Moving the team" and a segment bar.

## Data graphics

- **Big number.** Number and unit stacked, one serif sentence of meaning, then a row with the status badge and "2025 report, p. 42 ↗" in Archivo 13 px ink-3 with a 1px underline offset 3px. The whole block is one button. This is `<FactValue size="lg|xl" caption="…" />`.
- **Footprint bar.** One horizontal SVG bar across the measure, 40 px tall (32 on mobile), with 2 px gaps in the ground colour. The segment under discussion is `highlight`; the others are ink-3 and line-strong. Estimated segments use a 45° line pattern (1.5 px on 6 px). Direct labels above each segment: number, label, status mark; small segments get 1px leader lines. No legend.
- **Target progress (report p. 15).** Bars or a stepped line from the 2023 baseline to 2025, the 2030 target and 2050. Achieved values are filled in `highlight`; targets are outlined and labelled "2030 target". Say "past the 2030 target" in words where it is true.
- **Charts** (Recharts or SVG). One highlighted series in `highlight`, the rest ink-3 or line, direct labels, a baseline only, no gridline clutter.
- **Status badge.** A 10 px mark and a 12 px uppercase label in the ground's status colour. Shapes carry meaning without colour: verified filled square, estimated half-filled, simulated dashed outline, conflict rotated square.
- **Data gap.** A dashed 1px box, the ink-3 label "Data gap" and a short sentence saying what is missing. Never a number.

## Shared components

| Component                      | Use                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FactValue`                    | Every stand-alone figure. `size`: `sm`, `md`, `lg`, `xl` (`lg`/`xl` use `.big-num` with the unit stacked). `caption` for the serif meaning sentence (or `showMetric` to use the fact's metric). `showStatus`, `showSource` default true. `showFlags` defaults false: fan pages never show data-quality flags |
| `InlineFact`                   | A figure inside a sentence, with its status mark                                                                                                                                                                                                                                                             |
| `StatusBadge`, `StatusMark`    | Trust status. `compact` shows the mark only, label for screen readers                                                                                                                                                                                                                                        |
| `StatusLegend`                 | Explains the labels. Defaults to Verified and Estimated; `variant="list"` adds a line of explanation each                                                                                                                                                                                                    |
| `DataGap`                      | Missing published data. Children are the sentence; `label` overrides "Data gap"                                                                                                                                                                                                                              |
| `useProvenance().openFact(id)` | Opens the provenance drawer: metric, value, source and page link, quoted text, formula and assumptions, data-quality notes                                                                                                                                                                                   |
| `AiText`, `AiMeta`             | Generated text with numbered citation chips, the "Figures checked" badge and a line saying what drafted it. Never render model text any other way                                                                                                                                                            |
| `FactTable`                    | Searchable fact list for `/sources`                                                                                                                                                                                                                                                                          |
| `Button`                       | See controls                                                                                                                                                                                                                                                                                                 |

Source lines come from `factCitation(fact)` and `sourceShortName(id)` in `lib/data/load.ts`, so every page names sources the same way ("2025 report", "2024 report", "Manifesto", "DEFRA 2025"; estimates say "Calculated").

## Chrome and controls

- **Header.** 56 px, solid paper, 1px line below, sticky. Wordmark "Off Camera" in Newsreader 600 20 px beside a 6 × 16 px lime bar. Nav: The story, Singapore GP, Partners, in Archivo 15/500 (How it works and Sources are footer links, listed at footer size under the phone menu's main links); the active link has a 2px ink underline and `aria-current="page"`. Below 768 px a "Menu" text button opens a full-screen paper sheet. An "Offline demo" pill (12 px kicker, 1px border) shows in demo mode.
- **Footer.** Green ground, three columns: about the prototype, sources and method, and the status legend with a Data gap example.
- **Buttons.** 4 px radius. Primary: lime fill, lime-ink text, Archivo 16/600, 48 px on fan pages (`size="lg"`) and 40 px on the partner desk (default size), padding 0 20px, hover `lime-hover`, pressed moves down 1px. One primary per view. Secondary: `variant="outline"`, 1px ink border (on-green on green), transparent. Tertiary: `variant="link"`, underlined.
- **Choice chips.** Native radios, visually hidden but focusable. Chip at least 48 px tall, 1px line-strong, Archivo 16/500. Selected: 2px ink border, lime-tint fill and a ✓ in the text.
- **Selects.** Native `<select>`, 48 px.
- **Focus.** 2px solid outline, 2px offset: racing on paper, lime on green. Provided globally.
- **Share card.** 1080 × 1920, green ground, 72 px margins, top 250 and bottom 340 px kept clear. Wordmark at y 96. Title in Newsreader 500 112 px. Quarter car image as a 1080 × 600 band at y 330 (object-position 50% 55%). Two or three figures in Archivo 75% width 700 at 150 px (the first lime, the others on-green) with a 40 px serif label and a 28 px status badge. The fan's plan line in Newsreader italic 44 px. Source line near y 1520 in Archivo 26 px on-green-2.

## Partner desk

Paper ground only, max width 1680, 12 columns, tabs across the top. KPI tiles sit in a hairline grid (1px line between cells, no card boxes), at least 280 px wide, number 48 to 64 px in Archivo 75% width, label and status beneath. Tables use Archivo 14 px (15 px at 1920), 40 px rows, a sticky header with 12 px uppercase labels, right-aligned tabular numbers and no zebra striping. Serif appears only in page titles and AI narratives (prose at 65ch). Base text is 16 px from 1800 px wide. Data-quality flags and disputed figures belong here and on `/sources`, never on fan pages.

## Motion

Outside the story, opacity changes take 150 to 300 ms and transforms use cubic-bezier(.22, 1, .36, 1) (the source drawer opens over 260 ms from 24 px and closes over 160 ms; disclosures fade and rise 4 px over 200 ms). The story's own values are under Scrollytelling. Motion never reveals information that is not already on the page. Everything honours `prefers-reduced-motion` (a global rule in `globals.css` shortens every animation and transition).

## Copy

- British English, sentence case, plain words, short sentences. Second person for fans, plain professional for partners.
- Pillars use the team's names: Environment, Belong, Community, and Governance for reporting. Not "Social" or "Inclusion".
- Fan-facing copy says "the team" or "Aston Martin Aramco", never "AMF1".
- Tone is pride and invitation, never guilt. No "save the planet", no green superlatives, no scoring fans, never "help the team hit net zero".
- Say what a number means in one clause. Do not editorialise beyond the source.
- Avoid "unlock", "empower", "revolutionise", "seamless", "cutting-edge", exclamation marks and emoji.

### Stakeholder guardrails

- **Fan travel.** It is not in the team's inventory (the report counts Scope 3 categories 1 to 7, p. 85). Say so. Fan trips are compared with a taxi or driving using `data/travel-modes.json` (Estimated, DEFRA proxy factors), never converted to laps.
- **Carbon removals** never read as "carbon negative", "neutral" or "offset". They deal with emissions the team cannot eliminate yet (p. 26).
- **Supply chain.** Say plainly that most of the footprint is the supply chain (`e25-supply-chain-share`). The campus is not the whole story.
- **Progress.** Never compare 2024 and 2025 totals: earlier years were restated. Use the report's own progress figures (`e25-progress-scope12`, `e25-progress-scope3`) and the p. 15 target chart.
- **Pay gap and women's share** appear only with the report's p. 55 explanation (a pay gap is not unequal pay; it reflects representation), lead with what the team is doing (Accelerate Women, Aleto, AFBE-UK), and never appear on the share card or in AI personalisation.
- **Renewables.** Say "renewable energy-backed supply". Do not show the derived share (`est-rego-share`) to fans.
- **Paddock energy.** The 90% cut (`e25-event-energy-cut`) is European races only. Singapore trackside energy is not published: show a Data gap.
- **Per-round estimates** (`est-freight-per-round`, `est-travel-per-round`, `est-saf-per-round`) are never a hero number and never labelled "Singapore". If shown, only in a detail layer, as the season total divided evenly across the rounds.
- **Laps of Silverstone** only where the report prints them (`e25-saf-laps`, `e25-cups-laps`), worded as laps in a petrol road car, the team's own comparison.
- **"Real time".** Never claim live data. Label figures "Updated when the team publishes" with the report date. A future trackside feed is described in words as the pilot plan, never shown as fake UI.
- **AI label.** The guardrail badge reads "Figures checked", so it never borrows the fact-status word "Verified".

## Don't

- Gradients (including photo overlays), glows, glass or backdrop blur, drop shadows, dark overlays.
- Text directly on photos; lime text on paper.
- Initial `opacity: 0` or reveal-on-scroll for text and numbers; scroll-scrubbed video, scroll-jacking, parallax, number count-ups.
- Fake telemetry, speed lines, chequered clip art, decorative icons (arrows and ✓ only).
- Uppercase headings at scale; more than one primary button per view; status shown by colour alone; legends where direct labels fit.
- Remote images or fonts; cropping out or distorting the car; logos beyond what the livery shows.
- Centred paragraphs longer than two lines.
