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
- Live feed: SSE route plus a deterministic local replay with the same engine; the client falls back to local if SSE fails. Reason: "real-time" demo that still runs with no network or on serverless time limits.
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
