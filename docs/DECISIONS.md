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
- Fan workstream: added `DEFAULT_SHARE_FACT_IDS` to `lib/ai/requests.ts` (a lead-owned file) as directed by the fan brief, since the share card needed a stable, shared list of figures. Reason: keeps the export deterministic and matches what a cache-warming script would expect.
- The 1080x1920 share card renders its figures with `getFact()` + `factParts()`/`StatusMark` directly rather than `<FactValue>`. Reason: `<FactValue>` is an interactive, click-to-open-source button sized by viewport media queries; neither fits a fixed-size, screenshot-only export. Every number still comes from the fact base and keeps its status mark.
