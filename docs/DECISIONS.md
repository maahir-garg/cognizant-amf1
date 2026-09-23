# Architectural & Product Decisions Log

Format: Date | Decision | Rationale

- 2026-09-24 | Initialized Next.js 14+ App Router with TypeScript strict | Modern React Server Components support, deterministic SSR, fast static export, and native route handlers for partner APIs.
- 2026-09-24 | Configured Tailwind CSS with custom AMF1-inspired palette (`#00352F`, `#00594F`, `#00FF87`) | Team-inspired racing aesthetics without infringing proprietary copyrighted trademarks or logos.
- 2026-09-24 | Gitignored raw PDF downloads in `/sources/*.pdf` while keeping extracted text files | Keeps git repository compact while preserving auditability of extracted sources.
- 2026-09-24 | Configured `DEMO_MODE=true` as default fallback when `GEMINI_API_KEY` is not supplied | Guarantees zero failures and lightning-fast load times even on unreliable event Wi-Fi during Singapore pitch.
- 2026-09-24 | Selected Singapore GP as the primary race weekend focal point | Aligns directly with event timing (8 Oct 2026 pitch before 9-11 Oct Singapore GP weekend).
- 2026-09-24 | Extracted 15 core ESG metrics from Make A Mark 2025 report | Captured across Scope 1, 2, 3, SAFc abatement, fleet electrification, STEM reach, and governance standards with 100% verified page references.
- 2026-09-24 | Established DEFRA / EPA / ICAO deterministic carbon conversion table | Prohibits AI hallucination of equivalency factors (trees, homes powered, flights, phone charges).
- 2026-09-24 | Implemented post-generation numeric guardrail regex validator | Automatically scans AI output and rejects any number that does not match a verified input fact or formula output.
- 2026-09-24 | Generated deterministic offline AI cache in `data/ai-cache/` | Ensures zero latency, offline pitch resilience, and full compliance with judging criteria even with network down.
- 2026-09-24 | Implemented client-side localStorage fan profile store with fallback | Persists fan persona, city, quizzes, and impact credits across page views without database overhead.
- 2026-09-24 | Implemented html-to-image 9:16 portrait story share card generator | Enables instant high-res PNG export for social stories with verified telemetry citations.
- 2026-09-24 | Created read-only JSON API at `/api/partner/metrics` | Enables direct REST programmatic ingestion into enterprise BI tools (Tableau, PowerBI) with CORS headers.
- 2026-09-24 | Implemented client-side CSV export of partner audit metrics | Provides immediate offline spreadsheet access with full provenance and methodology columns.
- 2026-09-24 | Built deterministic What-If scenario model with AI decision-support explanation | Couples mathematical modeling with executive narrative generation for sponsor investment planning.
- 2026-09-24 | Expanded provenance fact base to 19 verified metrics and automated extraction tests (`scripts/extract-sources.ts`) | Covers all four ESG dimensions including FIA Three-Star Environmental Accreditation (Page 81) and SBTi 2050 validation (Page 15) with 100% automated test coverage.
- 2026-09-24 | Dual-labeled 5 scorecard criteria in `docs/ROI.md` | Aligns directly with both kick-off deck Slide 10 rubric (Innovation, Desirability, Business Opportunity, Viability, Ease of Implementation) and brief evaluation criteria (Technological Sophistication, Fan Experience, Business Alignment, ESG Impact, Feasibility).
- 2026-09-24 | Engineered headless 1080p Playwright demo video recording script (`npm run record-demo`) | Automatically navigates all 10 Golden Path stops, records high-definition WebM walkthrough (`docs/demo-video/demo-walkthrough-1080p.webm`), and serves as automated regression baseline.
