<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Impact Lap: working agreement for anyone (human or agent) touching this repo

Impact Lap is a concept prototype for the Cognizant × Aston Martin Aramco F1 (AMF1) Gen-AI Ideathon, Singapore, pitched on 8 Oct 2026. It turns AMF1's published ESG data into (A) a personalised, story-led experience for F1 fans and (B) a trusted impact dashboard for partners such as Cognizant. Read this file, then `DESIGN.md`, before changing anything.

## Non-negotiables

1. **No fabricated AMF1 data.** Every number on screen comes from `data/facts.json` (verified, estimated or simulated) and is rendered through `<FactValue>`, `<InlineFact>` or `<AiText>`. Never type a figure into JSX, copy or a prompt. If you need a number that isn't in the fact base, add a fact (see below) or don't show it.
2. **Every number shows its status.** Verified, Estimated and Simulated are always labelled (`<StatusBadge>`). Illustrative initiatives, events and counters are `status: "simulated"` with a `notes` explanation.
3. **The demo runs offline.** No runtime call may be required to render any page. AI text comes from `data/ai-cache/` in demo mode (the default). Fonts are self-hosted (`@fontsource-variable/*`), never Google Fonts. No CDN scripts or images.
4. **Authorship.** Do not credit any AI tool or model anywhere: commit messages, code comments, docs, `package.json`, HTML meta, UI copy. No `Co-authored-by` trailers. Use the machine's configured git identity; never change it.
5. **No secrets in git.** Keys live in `.env.local` (gitignored). `.env.example` documents them.
6. **No official logos or copyrighted imagery** unless added to `public/brand/` by the team. Use text names.
7. **Log judgement calls** in `docs/DECISIONS.md`, one line each: decision and reason.

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
  page.tsx               landing
  sources/               fact explorer and data-quality flags (governance showcase)
  (fan)/                 fan experience: start, lap, weekend/[slug], share, act
  partners/              partner dashboard: overview, scenarios, narratives, story-kit
  api/ai/generate        POST AiRequest -> AiResponse
  api/events/stream      SSE replay of the simulated race-weekend feed
  api/partner/metrics    read-only JSON (and ?format=csv) for partner BI tools
components/
  ui/                    shadcn/ui primitives (restyled via tokens; keep edits minimal)
  shared/                trust components used everywhere: FactValue, StatusBadge,
                         ProvenanceProvider (drawer), AiText, FactTable, header/footer
  fan/  partner/         surface-specific components
lib/
  config.ts              product name, footer label, isDemoMode()
  format.ts              number and unit formatting for facts
  data/schemas.ts        THE CONTRACT: Zod schemas and types for all data and AI I/O
  data/load.ts           validated, typed access to /data (client- and server-safe)
  data/verify.ts         the audit behind `verify:data` (node-only)
  data/numbers.ts        number extraction and matching (verifier + guardrail)
  data/derive.ts         safe arithmetic for estimated facts
  data/equivalents.ts    CO2e -> laps of Silverstone, flights, car-years, trips
  data/relevance.ts      fan profile -> ranked initiatives
  data/scenario.ts       what-if model for joint initiatives
  live/                  replay engine + useLiveFeed hook (SSE with local fallback)
  ai/                    guardrail, engine, templates, provider, prompts, cache, client hook
data/                    facts, sources, initiatives, races, cities, conversion-factors,
                         travel-modes, events, counters, quizzes, ai-cache/
sources/                 original PDFs (gitignored), text/<id>.json (committed), external/
scripts/                 extract-sources, verify-data, warm-cache, record-demo
tests/unit  tests/e2e    Vitest and Playwright
docs/                    architecture, data-sources, DECISIONS, DEMO_SCRIPT, ROI, screenshots/
```

## The data contract

- Schemas: `lib/data/schemas.ts`. All JSON is parsed at import time; a bad file fails the build.
- **Adding a verified fact**: find the figure in `sources/text/<source>.json` (page index = array index + 1; for the AMF1 reports this equals the printed page number). Add an entry to `data/facts.json` with `sourceId`, `page`, and a verbatim `quote` that contains the value. Table cells the text layer splits apart can be quoted as fragments joined by ` … `. Run `npm run verify:data`.
- **Adding an estimated fact**: give a `derivation` with a human `formula`, a machine `expression` over `{fact-id}` references, `inputs`, and `assumptions`. The verifier recomputes it.
- **Simulated anything** must say why in `notes`, and the UI must label it.
- **Quality flags** (`source-conflict`, `restated`, `not-comparable`, `inconsistent-equivalence`) record where the reports disagree with themselves. Keep them; they are a feature (Governance).
- Never compare 2024 and 2025 GHG figures directly: 2023/2024 were restated (see `g25-restatement`). Use the report's own change figures.
- Fact ids: `<pillar letter><yy>-<slug>` for report facts (`e25-saf-avoided`), `est-...` for estimates, `m...` for the Manifesto, `f1-...` for the calendar.

## The AI contract

- Request/response: `AiRequest` / `AiResponse` in `lib/data/schemas.ts`. Client code uses `useAiText()` from `lib/ai/client.ts` and renders with `<AiText>`.
- The model only ever receives the facts named in `factIds` (plus `derived` values) and must cite them inline as `[F:fact-id]` or `[D:derived-id]`.
- `lib/ai/guardrail.ts` rejects any output whose numbers don't match a **cited** fact or derived value, or that cites unknown ids. Rejected output is regenerated once, then replaced by the grounded template (`lib/ai/templates.ts`). The UI never shows unguarded text.
- Demo mode (`isDemoMode()` in `lib/config.ts`) is on unless `DEMO_MODE=false` **and** `GEMINI_API_KEY` is set. In demo mode responses come from `data/ai-cache/<task>/<cacheKey>.json`, falling back to templates. `npm run warm-cache` fills the cache for every demo persona and path.
- Generated text records who drafted it (`generator.kind: "model" | "template"`); the UI shows it.

## Workstreams and ownership

Work happens on branches named `rebuild/<stream>`. Stay inside your directories; if you need a change in a shared file (`lib/data/*`, `components/shared/*`, `app/layout.tsx`, `app/globals.css`, `data/*`), keep it minimal and say so in your report.

| Stream | Owns |
|---|---|
| lead | `lib/data`, `data/` (except `ai-cache`), `components/shared`, `components/ui`, `app/layout.tsx`, `app/page.tsx`, `app/sources`, `docs/`, `AGENTS.md`, `DESIGN.md`, `README.md` |
| ai | `lib/ai` (except `guardrail.ts`, which needs lead review), `app/api/ai`, `scripts/warm-cache.ts`, `data/ai-cache`, `tests/unit/ai*.test.ts` |
| fan | `app/(fan)`, `components/fan`, `lib/fan` |
| partner | `app/partners`, `components/partner`, `app/api/partner`, `lib/partner` |
| qa | `tests/e2e`, `playwright.config.ts`, `scripts/record-demo.ts`, `docs/DEMO_SCRIPT.md`, `docs/screenshots/` |

## Conventions

- TypeScript strict. Server components by default; add `"use client"` only where there is state or browser APIs.
- Next.js 16: `params`/`searchParams` are Promises; `middleware` is now `proxy`; no `next lint`.
- Styling: Tailwind v4 with the tokens in `app/globals.css`. Follow `DESIGN.md`. No inline hex colours.
- Copy: British English, sentence case, plain words. Say "the team" or "Aston Martin Aramco", not "AMF1", in fan-facing copy.
- Comments explain why, not what. Match the density of the surrounding code.
- Commits: small, conventional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), no attribution trailers.
- Layouts must work at 390 px wide (phones) and 1920×1080 (projector). No horizontal scroll.
- Accessibility: keyboard reachable, visible focus, status never conveyed by colour alone, `prefers-reduced-motion` respected.

## Definition of done

`npm install && npm run dev` with no `.env` → both golden paths click through with no errors in the console. `npm run check` and `npm run build` pass. New numbers are in the fact base and verified.
