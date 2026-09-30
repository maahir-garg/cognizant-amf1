# Impact Lap design spec (from the design director; implement exactly unless it conflicts with AGENTS.md)

Reference: Straits Times "No mere child's play" visual feature. Principles taken: one idea per screen, opaque caption cards on a fixed column over a sticky visual, a full viewport of breathing room between cards, serif storytelling with sans metadata, graphics introduced by a chapter card. Motion: opacity 0.5s ease-in-out; transforms 0.4-0.9s cubic-bezier(.4,0,.2,1). No scroll-scrubbed video.

## Type (self-hosted, all @fontsource-variable 5.3.0)
- `@fontsource-variable/newsreader` (import opsz.css + opsz-italic.css): headlines, dek, body, captions.
  - H1 clamp(2rem, 1.25rem + 3vw, 4.25rem), wt 500, lh 1.08, ls -0.01em, max 18ch, centred (title page only).
  - H2 chapter clamp(1.75rem, 1.2rem + 2.2vw, 3rem), wt 500, lh 1.1.
  - H3 clamp(1.375rem, 1.2rem + .6vw, 1.75rem), wt 600, lh 1.2.
  - Dek clamp(1.25rem, 1.1rem + .5vw, 1.5rem), wt 400, lh 1.33, max 34ch.
  - Body/cards clamp(1.125rem, 1.05rem + .3vw, 1.3125rem), lh 1.45; measure 65ch body, 40ch cards.
- `@fontsource-variable/archivo` (wdth.css): UI + numbers. Labels/byline 12/16 uppercase ls .06em wt 600. Nav/buttons 15-16 wt 500-600. Big numbers: font-stretch 75%, wt 700, tabular-nums lining-nums, clamp(3rem, 2rem + 5vw, 7.5rem), lh .95; unit at .35em, 100% width, wt 500. Partner tables 14-15px.
- `@fontsource-variable/jetbrains-mono`: only fact ids, page refs, API/CSV text, 12px.
- Drop uppercase `.display` headings.

## Colour tokens
Paper: paper #F5F3EC (ground), paper-2 #ECE9E0, card #FFFFFF, ink #15201C (15.07 on paper), ink-2 #3F4B46 (8.20), ink-3 #5C6863 (5.23 paper / 4.70 paper-2), line #D9D5CA (decorative), line-strong #7F8782 (3.32, inputs/axes).
Green (immersive): racing #00594F (brand fill, links; 7.44 on paper), green #0B3B32 (ground), green-2 #0F4A3F, on-green #F3F1EA (11.02), on-green-2 #B9CCC5 (7.42), on-green-3 #8FAAA1 (5.00), green-line #2F6457, green-line-strong #5E9183 (3.47).
Lime #CEDC00 (8.22 on green; 1.36 on paper: NEVER text on paper), lime-ink #15201C, lime-tint #EEF3B8, lime hover #BCC900.
Status on paper: verified #4A6B00, estimated #8A5300, simulated #1D5D8C, conflict #B03A1C. On green: verified #CEDC00, estimated #F2B84B, simulated #7CC6FE, conflict #FF8A65. Shapes unchanged (filled / half / dashed / rotated) + label text always.
Focus: 2px solid, 2px offset; racing on paper, lime on green.
Implement tones as scopes: `:root` = paper tokens; `[data-tone="green"]` redefines the same semantic tokens (bg, surface, ink, ink-2, ink-3, line, line-strong, status colours, focus) so components work unchanged on both grounds. Light colour-scheme by default.

## Layout
12-col grid, gap 24. Margins: 16px <640, 24px 640-1023, min(5vw,80px) >=1024. Max widths: fan 1440, partner 1680, reading 680. Spacing 4 8 12 16 24 32 48 64 96 128; section rhythm clamp(64px,10vw,128px). Radius 2 badges, 4 cards/buttons/inputs, 0 images. Hairlines 1px line; a 2px ink kicker rule 32px wide above each chapter label.

## Scrollytelling
```
<section class="chapter" data-tone="paper|green" aria-labelledby>
  <header class="chapter-open">label, H2, one-line dek</header>   (normal flow)
  <div class="scrolly">
    <div class="stage" aria-hidden>                               (sticky; top:56px; height:calc(100svh - 56px))
      <figure class="layer" data-step="0" data-active>img + visible credit</figure> …
    </div>
    <ol class="steps">                                            (margin-top:-100svh; relative; z-1)
      <li class="step" data-step="n">card</li>
    </ol>
  </div>
</section>
```
- Desktop >=1024: stage full width; image box left:30vw width:70vw; left 30% solid chapter ground, hard edge. Cards width min(420px,34vw) at left 5vw, overlapping the image edge slightly. Card: opaque #FFF, 1px line-strong border, 4px radius, padding 20/20/24, serif. Cards are always light, even in green chapters. Each step min-height 100svh, card vertically centred; last step padding-bottom 50svh.
- Mobile <1024: image box = top 60svh of stage, full width; solid ground below. Cards calc(100vw - 32px) scroll over.
- Active step: one IntersectionObserver, rootMargin "-50% 0px -50% 0px", threshold 0; sets data-active-step on the stage. Cards are never animated.
- Transitions: layer crossfade 600ms cubic-bezier(.4,0,.2,1); within a chapter a slow push-in scale(1)->scale(1.12-1.2) with transform-origin at the step's focal point, 900ms. No blur, parallax, scrubbing. Reduced motion: no scale; 120ms opacity swap.
- No JS: server renders layer 0 active; every card visible in HTML. RULE: no text element may render with opacity < 1 or be displaced before JS runs. No reveal-on-scroll for text or numbers.
- Image + focal crop (object-position desktop / mobile):
  - Campus + hero: amr26-launch-quarter.jpg 45% 55% / 36% 62%
  - Moving the team: amr26-launch-rear.jpg 45% 60% / 64% 60%
  - Circuit: amr26-render-rear.jpg 52% 50% / 54% 55% (pale blue ground ~#CFE3E6)
  - Supply chain / engineering / Beyond the track: amr26-active-aero.png (square) 50% 45% / 70% 50%
  - Finish line: amr26-launch-front.jpg 50% 50% / 50% 50%
  - Visible small credit on each image: "Image: Aston Martin Aramco".
- Hero: paper ground 100svh; title block centred in top 55% (reference title page); quarter image as a full-width band at the bottom (max-height 45svh, object-position 50% 60%); scroll cue "Scroll to follow the car" 12px label + 1px x 24px vertical line in ink-3. No text on the photo.
- Chapter tracker: 40px strip below the header, sticky within the story; 5-6 labelled segments; active = ink text wt 600 + 2px lime bar with 1px ink outline + aria-current="step"; segments are links. Mobile: "2/6 · Moving the team" + segment bar.

## Data graphics
- Footprint bar: one horizontal SVG bar, full measure, 40px (32 mobile), 2px ground-colour gaps. Segment under discussion racing (lime on green); others ink-3 / line-strong (on green: on-green-3 / green-line-strong). Estimated segments: 45° line pattern 1.5px on 6px. Direct labels above: number, label, status mark; small segments get 1px leader lines. No legend.
- Target progress (p15 chart): bars or a stepped line 2023 baseline -> 2025 -> 2030 target -> 2050; racing for achieved, outlined/ticked for targets, each labelled "2030 target"; words for "past the 2030 target" where true.
- Big number: number + unit stacked, one serif sentence of meaning, row with StatusBadge · "2025 report, p. 42 ↗" (Archivo 13px ink-3, 1px underline offset 3px). Whole block is one button opening provenance.
- StatusBadge: 10px mark + 12px uppercase label in the ground's status colour. "Data gap": ink-3 label in a dashed 1px box, never a number.
- Charts (Recharts or SVG): one highlight (racing), others ink-3/line, direct labels, baseline only.

## Chrome and controls
- Header 56px, solid paper, 1px line below. Wordmark "Impact Lap" Newsreader 600 20px beside a 6x16 lime bar (lime bar on paper is fine: it's not text). Nav Archivo 15/500; active 2px ink underline + aria-current. Mobile: "Menu" text button opens a full-screen paper sheet. Offline demo pill: 12px label with 1px border.
- Footer: green ground, on-green text, 3 columns (about the prototype, sources and method, status legend), green-line hairlines.
- Buttons 4px radius. Primary: lime bg, lime-ink text, Archivo 16/600, height 48 fan / 40 partner, padding 0 20px, hover #BCC900, active translateY(1px). One per view. Secondary: 1px ink border (on-green on green), transparent. Tertiary: underlined link.
- Choice chips: native radios visually hidden but focusable; chip min 48px, 1px line-strong, Archivo 16/500; selected 2px ink border + lime-tint fill + a ✓ in the text.
- Selects: native select 48px.
- Share card 1080x1920: green ground, 72px margins, keep top 250 and bottom 340 clear. Wordmark y96. Title Newsreader 500 112px. Quarter car image 1080x600 band at y330 object-position 50% 55%. 2-3 figures Archivo 75% width wt 700 150px (primary lime, others on-green), serif label 40px, status badge 28px. Plan line in Newsreader italic 44px. Source line ~y1520 Archivo 26px on-green-2.

## Partner desk
Paper ground only, max 1680, 12-col. KPI tiles in a hairline grid (1px line between cells, no card boxes), tile min 280px; number 48-64px Archivo 75% width; label + status beneath. Tables Archivo 14px (15 at 1920), 40px rows, sticky header, 12px uppercase header labels, right-aligned tabular numbers, no zebra. Serif only for page title and AI narratives (prose at 65ch). Tabs across the top. Base text 16px at >=1800.

## Don't
Gradients (incl. photo overlays), glows, glass/backdrop blur, drop shadows, dark overlays; text directly on photos; lime text on paper; initial opacity:0 / reveal-on-scroll for text or numbers; scroll-scrubbed video, scroll-jacking, parallax, number count-ups; fake telemetry, speed lines, chequered clip art, decorative icons (arrows and ✓ only); uppercase headings at scale; >1 primary button per view; status by colour alone; legends where direct labels fit; remote images/fonts; cropping out or distorting the car; logos beyond what the livery shows; centred paragraphs longer than two lines.
