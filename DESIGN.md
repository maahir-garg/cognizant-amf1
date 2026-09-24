# Impact Lap design system

The product should feel like a well-made F1 broadcast graphic or a team's own app: confident type, real numbers, nothing decorative. It must not feel like a corporate ESG report, and it must not feel like a generic AI dashboard.

## Principles

1. **The number is the hero.** Big tabular figures, small plain captions, a status mark. No chart where one number says it.
2. **Trust is visible, not a footnote.** Every figure carries Verified / Estimated / Simulated. Tapping a figure opens its source. Data-quality flags are shown, not hidden.
3. **One accent.** Lime (`--lime`) means "act here" (primary buttons, focus, the active nav marker) and "verified". Nothing else is lime.
4. **Structure from type and rules, not boxes.** Prefer hairline rules and alignment over cards-in-cards. Use a surface panel only when content is a distinct object (a KPI tile, a drawer, a share card).
5. **F1 by vocabulary, not by costume.** Laps, sectors, scrutineering, parc fermé, pit wall are the organising metaphors. No fake telemetry, fake RPM gauges, carbon-fibre textures, speed lines or chequered-flag clip art.
6. **Mobile first for fans, projector first for partners.** Fan pages are designed at 390 px and scale up. Partner pages are designed at 1440–1920 px and must still work at 390 px.

## Tokens (defined in `app/globals.css`)

| Token | Use |
|---|---|
| `bg` `#0b1a16` | page ground (deep racing green-black) |
| `surface`, `surface-2`, `surface-3` | panels, hover, pressed |
| `line`, `line-strong` | hairlines, input borders |
| `ink`, `ink-2`, `ink-3` | primary text, secondary text, labels |
| `racing` `#0f5c49` | large brand fills (share card ground, sector bands). Sparingly. |
| `lime` `#cedc00` | primary action, focus ring, verified. Text on lime uses `lime-ink`. |
| `verified` | lime. Filled square mark. |
| `estimated` `#f2b84b` | amber. Half-filled square mark. |
| `simulated` `#7cc6fe` | sky. Dashed-outline square mark. |
| `conflict` `#ff8a65` | coral. Rotated square mark. Only for data-quality flags and guardrail failures. |

Radius is small (`--radius: 0.375rem`). Shadows are not used; elevation comes from surface steps.

## Type

- **Archivo Variable** (self-hosted, width axis 62–125%). Body at 100% width.
- **Display**: the `.display` class: Archivo at 72% width, weight 800, uppercase, tight leading. Use for page titles, sector names, the wordmark. Never for body copy, never for more than about 8 words.
- **JetBrains Mono Variable** for numbers (`.num`, tabular figures) and for `.label`: 11 px uppercase tracked captions such as section markers, units and timing-screen style metadata.
- Sizes: body 16 px (fans) / 14 px (dense partner tables). Headline scale via `clamp()`; keep line length under about 70 characters.

## Components

- `FactValue`: the only way to show a headline number. Sizes `sm | md | lg | xl`. Opens the provenance drawer.
- `InlineFact`: a number inside a sentence, with a status mark.
- `StatusBadge` / `StatusMark` / `StatusLegend`: trust status. Shape and text carry meaning, not just colour.
- `ProvenanceProvider`: a single drawer in the root layout. Call `useProvenance().openFact(id)`.
- `AiText`: generated text with numbered citation chips, a "Verified" guardrail badge and a "drafted by" line. Never render model text any other way.
- `Button` (shadcn, restyled): `default` = lime, one per view where possible; `outline` for secondary; `ghost` for tertiary. Minimum height 40 px (48 px for `lg`, used on fan mobile CTAs).
- Section markers: `.label` text such as `S1 · ENVIRONMENT`, followed by a `.display` heading.

## Patterns

- **Fan lap**: one idea per screen on mobile. Sector progress bar across the top (S1 Environment, S2 Belong, S3 Community, then Scrutineering for Governance). Quiz beats: question → three options → reveal the fact with its status and a one-line explainer. Transitions are short slides (≤ 250 ms).
- **Weekend view**: the hero number is an *estimate* and says so up front, with the assumption in one sentence. Equivalents lead with F1-native units (laps of Silverstone), then everyday ones.
- **Share card**: 1080×1920 (9:16). Racing-green ground, huge display type, 2–3 figures max, status marks kept, source line at the bottom.
- **Partner dashboard**: dense but calm. KPI tiles in a hairline grid; tables with right-aligned tabular numbers; charts only for trends or comparisons (Recharts, `--chart-*` colours, no gridline clutter, direct labels over legends).
- **Empty and gap states**: when data isn't published (for example Singapore trackside energy), say so plainly with a "Data gap" label. Never fill a gap with a plausible-looking number.

## Motion

Framer Motion for step transitions, number reveals and feed items. Durations 150–300 ms, ease-out. Nothing loops except the live-feed pulse dot. Everything respects `prefers-reduced-motion`.

## Copy

- British English, sentence case, short sentences. Second person for fans ("your lap"), plain professional for partners.
- Avoid: "unlock", "empower", "revolutionise", "seamless", "cutting-edge", "journey" (except the fan lap), exclamation marks, emoji.
- Say what a number means in one clause after it. Don't editorialise beyond the source.

## Don't

- Gradients, glows, glassmorphism, neon, drop shadows, animated backgrounds.
- Fake live data that isn't labelled Simulated.
- Icons as decoration. Use a Lucide icon only when it aids scanning (arrows, external link, check).
- More than one primary button per view.
- Centred paragraphs longer than two lines.
- Official team or partner logos (none are licensed for this prototype).
