# Decisions log

One line per judgement call: decision, then reason.

## Foundation (24 Sep 2026)

- Rebuilt from scratch on `main`, keeping git history; old `feat/*` branches left untouched. Reason: the previous prototype was not salvageable, and rewriting history would need a force-push.
- Next.js 16 (App Router) + Tailwind v4 + shadcn/ui (radix base), Zod 4, Recharts, Framer Motion, html-to-image, Vitest, Playwright. Reason: the brief's stack at current versions.
- Pillar names follow the 2025 report and website: Environment, Belong, Community, plus the report's Governance section. Reason: names differ across documents (Manifesto: Sustainability/Community/Inclusion; 2024 report: Sustainability/We Belong/Community); the 2025 wording is current.
- The fan "lap" maps sectors to pillars (S1 Environment, S2 Belong, S3 Community) and Governance to "Scrutineering". Reason: F1 vocabulary that fits the ESG split.
- Facts carry a verbatim quote that `npm run verify:data` finds on the cited page, and the value must appear in the quote. Reason: makes "verified" checkable rather than asserted.
- Page text is extracted with `pdftotext` (raw order) and committed as `sources/text/<id>.json`; PDFs stay gitignored. Reason: CI can audit facts without 38 MB of PDFs.
- Where the PDF text layer scrambles table layout (trackside energy, p37), the race-to-value mapping was checked against a rendered image of the page and noted on each fact. Reason: the text alone can't prove the association.
- Kept every internal inconsistency found in the reports as a quality flag instead of silently choosing one value (e.g. Aleto cohort 14 vs 15, Aramco interns 8 vs 9, 2023 Scope 3 three ways, 71% reused for two survey questions, "SBTi-aligned" label on two totals). Reason: showing them is the Governance story; hiding them would undermine trust.
- The 2024 report's Silverstone-lap equivalence (≈0.97 kg/lap) is ~14× lower than the 2025 report's (≈13.5 kg/lap); only the 2025 one is used. Reason: two 2025 equivalences agree within 1%.
- Per-race-weekend freight and travel are estimates: 2025 annual totals ÷ 24 rounds, with the assumptions stated (even split, includes non-race logistics). Reason: AMF1 does not publish per-race emissions.
- No direct 2024→2025 GHG comparisons; use the report's own "-14% travel and logistics" instead. Reason: 2023/2024 figures were restated in the 2025 report and are "not directly comparable".
- Singapore trackside energy is shown as a data gap. Reason: only nine European rounds are published.
- The private ideathon kickoff deck is not used as a fact source and its text is not committed; Singapore GP 2026 dates come from the public F1 calendar. Reason: it's a participant briefing, and the repo may be public.
- Fan-friendly equivalents: AMF1's own laps-of-Silverstone and London–New York flight equivalences (derived from report figures), plus US EPA equivalencies (car-years, tree-years, phone charges, home electricity). Reason: every factor is cited; the F1-native ones come from the team itself.
- Transport choice uses UK DEFRA 2025 per-passenger factors as proxies for Singapore modes (light rail for MRT), labelled Estimated. Reason: EMA Singapore pages could not be retrieved programmatically; DEFRA is what the AMF1 report itself uses.
- Illustrative Singapore 2026 activations (Pit Lane Classroom, shoreline clean-up, women-in-engineering breakfast) are `simulated` initiatives modelled on real programmes. Reason: the brief asks for race-linked volunteering; none are announced for Singapore 2026.
- Fonts are self-hosted via `@fontsource-variable` (Archivo with width axis, JetBrains Mono). Reason: the demo must work offline; `next/font/google` fetches at build/dev time.
- Single dark theme. Reason: F1 fan apps are dark, and one theme keeps the projector demo consistent.
- `DEMO_MODE` defaults to on and stays on unless `DEMO_MODE=false` and a Gemini key exists. Reason: a fresh clone or keyless deploy must always work.
- Guardrail requires every number to match a fact the text actually cites (not just any supplied fact). Reason: stops a correct number being attached to the wrong claim.
- Simulated event replay: SSE route plus a deterministic local replay with the same engine; the client falls back to local if SSE fails. Reason: demonstrates the event flow while remaining accurate about its offline demo data.
- Committed `CLAUDE.md`/`AGENTS.md` agent docs at the root. Reason: requested so other agents can pick up the work; `next dev` also regenerates the managed block.

## AI layer (24 Sep 2026)

- `GeminiProvider` calls the plain Gemini REST API with `fetch` (no `@google/genai` SDK). Reason: keeps the bundle small and the request shape fully visible; the SDK adds nothing this prototype needs.
- `getProvider()` re-reads `GEMINI_API_KEY` on every call rather than caching an instance. Reason: lets tests mock `getProvider()` per case and keeps the module free of hidden global state.
- Cache is one JSON file per task (`data/ai-cache/<task>.json`, `cacheKey -> AiResponse`), not one file per key. Reason: fewer files to bundle/import, still statically importable, and a single diff per task on `warm-cache` reruns.
- Templates build sentences from a hand-written `phrase` on each fact (placeholders `{v}`, `{n}`, `{abs}`), falling back to a plain construction. Reason: splicing verbatim metric labels into sentences read robotically; `verify:data` rejects any phrase containing a number outside its placeholders, so the copy stays grounded. (Replaced the first version, which rotated connector verbs around metric labels.)
- `partnerNarrativeFactIds()` now caps partner-tagged facts at `max(4, 10 - heroFacts.length)` before appending hero facts (was: all partner facts first, sliced to 10). Reason: the Cognizant tag alone already supplies 11 facts across pillars, so a narrower `pillars: ["community"]` request produced the same fact set as the full four-pillar request; reserving room for hero facts makes the two actually differ. Fact selection only, not the request builder's signature.
- `scenario-explanation` names its assumptions by quoting each derived value's `formula` string (e.g. "3 editions x 257 students x 80% turnout") rather than a separate assumptions list. Reason: `DerivedValue` (the schema the guardrail and prompt both use) has no `assumptions` field, only `formula`; the guardrail already allows any number inside a cited value's formula, so this is the one place assumption detail can safely appear as prose.
- `quarterly-brief` groups facts into sections by pillar when three or more pillars are present, else by `topic`, else a plain round-robin split into 3-4 generic sections. Reason: a single-pillar partner request (e.g. `pillars: ["community"]`) still needs "3-4 short sections" per the task's shape rule; grouping by the next-most-specific field keeps sections meaningful instead of arbitrary.
- The numeric guardrail (`lib/ai/guardrail.ts`) was not changed. Reason: it already does exactly what the brief asks (cite-then-match, unknown-citation and no-citation checks); every template and prompt was built to satisfy it rather than the reverse.
- Warm-cache request enumeration lives in `lib/ai/demo-requests.ts`, imported by both `scripts/warm-cache.ts` and `tests/unit/ai-templates.test.ts`. Reason: keeps the demo's request set defined once; the alternative (duplicating it, or importing the script directly) would either drift or run the script's `main()` as a side effect of importing it in tests.

## Fan experience (24 Sep 2026)

- Fan workstream: added `DEFAULT_SHARE_FACT_IDS` to `lib/ai/requests.ts` (a lead-owned file) as directed by the fan brief, since the share card needed a stable, shared list of figures. Reason: keeps the export deterministic and matches what a cache-warming script would expect.
- The 1080x1920 share card renders its figures with `getFact()` + `factParts()`/`StatusMark` directly rather than `<FactValue>`. Reason: `<FactValue>` is an interactive, click-to-open-source button sized by viewport media queries; neither fits a fixed-size, screenshot-only export. Every number still comes from the fact base and keeps its status mark.

## QA pass (24 Sep 2026)

- `ink-3` on `--racing` (both share-card footers) measures 2.5:1, below the 3:1/4.5:1 axe requires; switched those two lines to `ink-2` (4.6:1 on racing). Reason: minimal, local fix — `ink-3` is fine on `bg`/`surface` (5.2–5.7:1) so the token itself is untouched.
- `components/ui/slider.tsx`: `id`/`aria-label`/`aria-labelledby` were spread onto `SliderPrimitive.Root` (a non-interactive wrapper) instead of the `role="slider"` `Thumb`, so every slider (the km distance picker, all four scenario sliders) had no accessible name and the km slider's `<label htmlFor>` pointed at nothing focusable. Forwarded those three props to the (single, in every current usage) thumb instead. Reason: shared primitive bug, not a caller bug; fixing call sites individually would have meant adding a visually-hidden label next to every slider instead.
- `components/ui/progress.tsx`: `value` was read for the indicator's inline transform but never passed to `ProgressPrimitive.Root`, so Radix always rendered `data-state="indeterminate"` with no `aria-valuenow` — every progress bar in the app (lap tiers, live-feed milestones) was accessibly "loading, unknown amount" regardless of its actual value. Passed `value` through to the root and added `aria-label` at both call sites. Reason: same class of shared-primitive bug as the slider.
- `components/fan/lap-progress.tsx`'s hand-built `role="progressbar"` had valuemin/max/now but no name; added `aria-label="Lap progress"` and an `aria-valuetext` (the same "Step X of Y" copy already shown visually). Reason: cheaper and more precise than reusing the (bar-chart-shaped) `<Progress>` primitive for a five-segment stepper.
- Landing page's inline "Browse every source" link (`text-lime` inside `text-ink-2` body copy) had no underline at rest and only 1.13:1 contrast against the surrounding text — axe's `link-in-text-block`. Added a permanent `underline`. Reason: the two other `text-lime` inline links in the app (provenance drawer, data-quality panel) sit outside a paragraph of body text, so the rule doesn't apply to them; left those as they were rather than restyle links that weren't flagged.
- `components/partner/story-kit-studio.tsx`'s initiative `<Select>` had no visible `<label>` association and no `aria-label`, unlike every other `Select` in the app (`/start`'s city picker has one). Added `aria-label="Community or charity partner"` matching the adjacent visible caption. Reason: same fix pattern already used elsewhere, just missed here.

## Product framing (30 Sep 2026)

- Use a responsive website as the public surface, with no account required for the learning path. Reason: a browser link removes installation and account steps, supports public sharing and source pages, and can still be linked or embedded by team and partner channels.
- Start the fan story with defaults and make level, city and interest choices optional. Reason: personalisation should improve relevance without becoming a questionnaire that blocks the main experience.
- Fan story follows the car from factory preparation to the race and post-race impact, with the quiz offered after learning. Reason: team feedback calls for an exploratory scroll experience and identifies the quiz as a side activity rather than the entry point.
- Interest selection changes emphasis and explanation depth but keeps environment, belonging, community and governance visible. Reason: a fan's initial topic choice should not remove parts of sustainability they may not already recognise.
- Regional matching uses the fan's explicit city selection and shows gaps where no local fact is published. Reason: this is useful personalisation without claiming precise geolocation or complete race-by-race coverage.
- The intro film is documented as a locally available approved asset with safe text and region variants; synthetic driver likeness or voice remains a rights-dependent production concept. Reason: the prototype cannot credibly promise personalised driver footage without assets, consent and review.
- Race-weekend events are called a simulated replay; “live” and “real time” are reserved for connected, owned and quality-checked production feeds. Reason: the current endpoint replays deterministic demo data offline.
- Position Impact Lap beside AWorld by its team-data provenance and car-operations narrative, without claiming AWorld lacks personalisation, reporting or motorsport content. Reason: AWorld's own product and MotoGP materials show those capabilities.
- The landing uses a static illustrated opening and scroll-led route rather than a runtime film. Reason: the prototype has no approved film asset, and the opening must remain reliable offline.
- Quiz choices use qualitative concepts and reveal the exact cited figure afterwards; each correct concept carries a checked fragment from its supporting fact. Reason: invented numeric distractors looked like unbadged impact claims and obscured the learning point.
- Removed the simulated race-weekend feed from public fan and partner pages. Reason: it distracted from the challenge's core transformation of published ESG data into cited, useful insight.
- Replaced generic car outlines with locally bundled official team car images for this collaboration prototype. Reason: the car should carry the scroll narrative with credible visual detail; `public/brand/README.md` records the asset sources and reuse limits.
- Use locally stored, high-resolution AMR26 images from Aston Martin Aramco's official site for the car-led visual story, with a source and rights manifest in `public/brand/`. Reason: the collaboration team explicitly requested official car imagery, the prototype must work offline, and the public site terms do not provide a general reuse licence beyond this approved collaboration context.

## Overhaul (30 Sep 2026)

- Switched from the dark racing-green theme to a light paper ground with racing-green chapters (`data-tone="green"`). Reason: the locked design spec follows a newspaper visual feature; a warm paper ground reads as a story rather than a dashboard and projects better in a lit room.
- Implemented tones as token scopes that redefine the same semantic names (`bg`, `ink`, `line`, `highlight`, status colours, focus), including the shadcn mapping on every scope. Reason: a custom property referencing another resolves where it is declared, so the mapping has to be re-declared for components to pick up the green values.
- Added self-hosted Newsreader for headlines and body, kept Archivo for UI and numbers, and limited JetBrains Mono to ids and code. Reason: serif storytelling with sans metadata is the spec's core pairing; condensed Archivo keeps figures legible at hero sizes; the mono numbers looked like telemetry.
- Dropped the uppercase `.display` headings; kept `.label` as an alias of the new `.kicker` style. Reason: the spec bans uppercase headings at scale, and the alias keeps pages that have not been rebuilt yet compiling and readable.
- Removed the simulated race-weekend feed (`lib/live`, `/api/events/stream`, `data/events.json`, `data/counters.json` and their schemas), impact credits, the milestone post request and the three `sg-*` illustrative initiatives. Reason: the brief rules out simulated data in the product UI; illustrative items next to verified ones blur what is real.
- Removed `/start`, `/lap` and `/act` with permanent redirects to `/`. Reason: the questionnaire and lap flow are replaced by the single story at `/`; old demo links and bookmarks should still land somewhere useful.
- Added a unit test that no fact or initiative ships with `status: "simulated"`. Reason: makes the new rule mechanical rather than a matter of review.
- Renamed the AI guardrail badge from "Verified" to "Figures checked". Reason: "Verified" is a fact status; generated text is checked against cited facts, which is a different claim.
- `FactValue` hides data-quality flags unless `showFlags` is set. Reason: fan pages never show disputed figures or flags; `/sources` and the partner desk opt in. The provenance drawer still lists a fact's flags, since it is the full record.
- Source lines under figures read "2025 report, p. 42" (estimates read "Calculated"), built by `factCitation()` in `lib/data/load.ts`. Reason: one short, consistent citation format everywhere instead of raw source ids.
- `StatusLegend` defaults to Verified and Estimated. Reason: nothing in the product is simulated any more, so a Simulated key would imply there is.
- Removed backdrop blur and shadows from the sheet and dialog primitives and gave the overlay a light ink tint. Reason: the spec bans glass, blur and drop shadows.
- Replaced the partner hero (parallax photo with gradient overlay) and the scroll-reveal wrapper with plain markup. Reason: both broke spec rules (photo overlays, text starting at opacity 0); the partner engineer rebuilds the page next.
