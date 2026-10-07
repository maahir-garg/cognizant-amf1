<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Off Camera: working agreement for anyone (human or agent) touching this repo

Off Camera is a concept prototype for the Cognizant × Aston Martin Aramco F1 (AMF1) Gen-AI Ideathon, Singapore, pitched on 8 Oct 2026. It turns AMF1's published ESG data into (A) a personalised, story-led experience for F1 fans and (B) a trusted impact dashboard for partners such as Cognizant. Read this file, then `DESIGN.md`, before changing anything.

## Non-negotiables

1. **No fabricated AMF1 data.** Every number on screen comes from `data/facts.json` (verified or estimated) and is rendered through `<FactValue>`, `<InlineFact>` or `<AiText>`. Never type a figure into JSX, copy or a prompt. If you need a number that isn't in the fact base, add a fact (see below) or don't show it.
2. **Every number shows its status.** Standalone figures carry a labelled `<StatusBadge>` and the source line ("2025 report, p. 42"). In running sentences and chart labels verified is the default and unmarked; estimates carry a visible "est." cue, and every figure opens the provenance drawer with its status and page. Where the team has not published a figure, show `<DataGap>`, never a number.
3. **No simulated data in the product UI.** No invented counters, live feeds, events, credits or illustrative initiatives. The `simulated` status stays in the schema for completeness (it must say why in `notes`), but nothing shipped uses it. A future capability, such as a trackside feed, is described in words as the pilot plan, never shown as working UI. Never claim "live" or "real time".
4. **The demo runs offline.** No runtime call may be required to render any page. AI text comes from `data/ai-cache/` in demo mode (the default). Fonts are self-hosted: `@fontsource-variable/newsreader` (headlines and body), `@fontsource-variable/archivo` (UI and numbers) and `@fontsource-variable/jetbrains-mono` (fact ids and code only), never Google Fonts. No CDN scripts or images.
5. **Authorship.** Do not credit any AI tool or model anywhere: commit messages, code comments, docs, `package.json`, HTML meta, UI copy. No `Co-authored-by` trailers. Use the machine's configured git identity; never change it.
6. **No secrets in git.** Keys live in `.env.local` (gitignored). `.env.example` documents them.
7. **Brand assets require a source record.** This official collaboration prototype may use team imagery kept locally in `public/brand/` with its source and intended use documented there. Do not introduce third-party imagery or remote runtime assets.
8. **Log judgement calls** in `docs/DECISIONS.md`, one line each: decision and reason.

## Commands

```bash
npm install            # Node 20+ (tested on 26)
npm run dev            # http://localhost:3000, works with no .env at all
npm run check          # lint + typecheck + unit tests + data audit (run before every commit)
npm run verify:data    # re-checks every verified quote against the source page text
npm run test:e2e       # Playwright golden paths (starts its own server)
npm run build          # production build
npm run extract:sources  # regenerate sources/text/*.json from the PDFs (needs poppler's pdftotext)
```

## Repo map

```
app/
  page.tsx               the story (flagship fan experience, scrollytelling)
  how-it-works/          for judges and partners: AI, guardrail, impact measures, pilot plan
  sources/               fact explorer and data-quality flags (governance showcase)
  (fan)/                 weekend/[slug] race page, share card builder, quiz
  partners/              Impact desk: this race week, narratives, check (my draft),
                         scenarios, story kit, data quality, measures, export
  api/ai/generate        POST AiRequest -> AiResponse
  api/partner/metrics    read-only JSON (and ?format=csv) for partner BI tools
                         (/start, /lap and /act redirect to / in next.config.ts)
components/
  ui/                    shadcn/ui primitives (restyled via tokens; keep edits minimal)
  shared/                trust components used everywhere: FactValue, InlineFact,
                         StatusBadge, StatusLegend, DataGap, ProvenanceProvider (drawer),
                         AiText, FactTable, site header/nav/footer; surface.ts tells
                         fan routes from partner/sources/explainer routes
  story/                 the scrollytelling story at /: hero, chapters, graphics, tracker
  explainer/             /how-it-works sections, the live draft and the worked number check
  fan/  partner/         surface-specific components
lib/
  config.ts              product name, footer label, isDemoMode()
  format.ts              number and unit formatting for facts
  data/schemas.ts        THE CONTRACT: Zod schemas and types for all data and AI I/O
  data/load.ts           validated, typed access to /data (client- and server-safe),
                         plus factCitation() / sourceShortName() for source lines
  data/verify.ts         the audit behind `verify:data` (node-only)
  data/numbers.ts        number extraction and matching (verifier + guardrail)
  data/derive.ts         safe arithmetic for estimated facts
  data/travel.ts         travel-mode factors: trip kg and mode-vs-mode ratios
  data/scenario.ts       what-if model for joint initiatives
  story/                 chapter copy and beats, graphic rows, race-week dates
  fan/                   profile (reading depth), quiz, race, share, storage and
                         local-keys, trip, trackside rows
  partner/               race week, approvals, citations, CSV, metrics, measures, story kit
  ai/                    guardrail, engine, templates, provider, prompts, cache, client hook,
                         requests and demo-requests, check-draft (Check my draft)
data/                    facts, sources, initiatives, races, cities, conversion-factors,
                         travel-modes, quizzes, ai-cache/
sources/                 original PDFs (gitignored), text/<id>.json (committed), external/
scripts/                 extract-sources, verify-data, warm-cache, record-demo
tests/unit  tests/e2e    Vitest and Playwright
docs/                    architecture, data-sources, DECISIONS, DEMO_SCRIPT, IMPACT, screenshots/,
                         overhaul/ (locked brief and design spec for the Oct 2026 rebuild)
```

## The data contract

- Schemas: `lib/data/schemas.ts`. All JSON is parsed at import time; a bad file fails the build.
- **Adding a verified fact**: find the figure in `sources/text/<source>.json` (page index = array index + 1; for the AMF1 reports this equals the printed page number). Add an entry to `data/facts.json` with `sourceId`, `page`, and a verbatim `quote` that contains the value. Table cells the text layer splits apart can be quoted as fragments joined by ` … `. Run `npm run verify:data`.
- **Copy phrase**: facts used in generated text should carry a `phrase`, a hand-written sentence with `{v}` (formatted value), `{n}` (bare number) or `{abs}` (absolute value) placeholders and no other numbers. Templates build their sentences from these; the verifier rejects phrases with stray numbers.
- **Adding an estimated fact**: give a `derivation` with a human `formula`, a machine `expression` over `{fact-id}` references, `inputs`, and `assumptions`. The verifier recomputes it.
- **Simulated anything** must say why in `notes`, and the UI must label it. The product currently ships none (a unit test enforces this for facts and initiatives).
- **Quality flags** (`source-conflict`, `restated`, `not-comparable`, `inconsistent-equivalence`) record where the reports disagree with themselves. Keep them; they are a feature (Governance).
- Never compare 2024 and 2025 GHG figures directly: 2023/2024 were restated (see `g25-restatement`). Use the report's own change figures.
- Fact ids: `<pillar letter><yy>-<slug>` for report facts (`e25-saf-avoided`), `est-...` for estimates, `m...` for the Manifesto, `f1-...` for the calendar.

## The AI contract

- Request/response: `AiRequest` / `AiResponse` in `lib/data/schemas.ts`. Client code uses `useAiText()` from `lib/ai/client.ts` and renders with `<AiText>`.
- The model only ever receives the facts named in `factIds` (plus `derived` values) and must cite them inline as `[F:fact-id]` or `[D:derived-id]`.
- `lib/ai/guardrail.ts` rejects any output whose numbers don't match a **cited** fact or derived value, or that cites unknown ids. Rejected output is regenerated once, then replaced by the grounded template (`lib/ai/templates.ts`). The UI never shows unguarded text.
- Demo mode (`isDemoMode()` in `lib/config.ts`) is on unless `DEMO_MODE=false` **and** `GEMINI_API_KEY` is set. In demo mode responses come from `data/ai-cache/<task>.json` (one file per task, statically imported, mapping `cacheKey -> AiResponse`), falling back to the deterministic templates for any request outside the warmed set. The committed cache files are empty (`{}`), so today every offline response is a grounded template. `npm run warm-cache` fills the cache for every demo request (`lib/ai/demo-requests.ts` enumerates them: story chapters at both depths, quiz reveals, the share caption, narratives, the scenario and the story kits); without `GEMINI_API_KEY` it exits without writing, since the templates already cover the offline demo.
- In live mode (`GEMINI_API_KEY` set, `DEMO_MODE=false`) the engine tries the model up to twice, feeding a failed guardrail's reasons back into the retry prompt, then falls back to the template. `lib/ai/engine.ts` never throws to the route.
- Generated text records who drafted it (`generator.kind: "model" | "template"`); the desk and `/how-it-works` show it. Fan pages show one plain line instead, "Every number checked against the report".
- House style for generated copy (enforced in `lib/ai/prompts.ts` and tested in `tests/unit/ai-prompts.test.ts`): third person for the team, no persona address ("As a new fan…"), falls in words ("down 74%", never "by -74%"), no hype words, lower case after a colon. The pay gap, the workforce split and disputed figures are never handed to generated copy.

## Workstreams and ownership

Work happens on branches named `rebuild/<stream>`. Stay inside your directories; if you need a change in a shared file (`lib/data/*`, `components/shared/*`, `app/layout.tsx`, `app/globals.css`, `data/*`), keep it minimal and say so in your report.

| Stream | Owns |
|---|---|
| lead | `lib/data`, `data/` (except `ai-cache`), `components/shared`, `components/ui`, `app/layout.tsx`, `app/page.tsx`, `app/sources`, `docs/`, `AGENTS.md`, `DESIGN.md`, `README.md` |
| ai | `lib/ai` (except `guardrail.ts`, which needs lead review), `app/api/ai`, `scripts/warm-cache.ts`, `data/ai-cache`, `tests/unit/ai*.test.ts` |
| fan | `app/(fan)`, `components/fan`, `lib/fan` |
| partner | `app/partners`, `components/partner`, `app/api/partner`, `lib/partner` |
| story | `components/story`, `lib/story` |
| explainer | `app/how-it-works`, `components/explainer`, `docs/overhaul/how-it-works-copy.md` |
| qa | `tests/e2e`, `playwright.config.ts`, `scripts/record-demo.ts`, `docs/DEMO_SCRIPT.md`, `docs/screenshots/` |

## Conventions

- TypeScript strict. Server components by default; add `"use client"` only where there is state or browser APIs.
- Next.js 16: `params`/`searchParams` are Promises; `middleware` is now `proxy`; no `next lint`.
- Styling: Tailwind v4 with the tokens in `app/globals.css`. Follow `DESIGN.md`. No inline hex colours. Light paper theme by default; wrap a section in `data-tone="green"` for the green ground and use semantic tokens (`bg`, `ink`, `line`, `highlight`, status colours) so components work on both.
- Data-quality flags and disputed figures (`source-conflict`) appear only on `/sources` and the partner desk, never on fan pages (`<FactValue showFlags>` is off by default, and the provenance drawer drops flag notes on fan routes). The one exception is the story's footprint total and baseline, the report's own target-chart values, shown under a plain `fanLabel` (see `docs/DECISIONS.md`).
- Copy: British English, sentence case, plain words. Say "the team" or "Aston Martin Aramco", not "AMF1", in fan-facing copy.
- Comments explain why, not what. Match the density of the surrounding code.
- Commits: small, conventional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), no attribution trailers.
- Layouts must work at 390 px wide (phones) and 1920×1080 (projector). No horizontal scroll.
- Accessibility: keyboard reachable, visible focus, status never conveyed by colour alone, `prefers-reduced-motion` respected.

## Definition of done

`npm install && npm run dev` with no `.env` → both golden paths click through with no errors in the console. `npm run check` and `npm run build` pass. New numbers are in the fact base and verified.
