# Impact Lap

**Aston Martin Aramco's impact, one lap at a time.** A concept prototype for the Cognizant × Aston Martin Aramco F1 Gen-AI Ideathon (Singapore, October 2026).

Impact Lap turns the team's published sustainability, inclusion and community data into:

- **A fan lap**: a personalised, 30-second-onboarding story through the Make A Mark pillars, with quiz beats, a Singapore Grand Prix carbon and logistics view in relatable units, matched community initiatives, a shareable 9:16 card and low-carbon choices that earn (simulated) impact credits.
- **A partner dashboard**: KPI tiles with a full audit trail, AI-drafted co-branded posts and briefs with inline citations, a what-if scenario model, milestone alerts from a live race-weekend feed, and CSV/JSON export for BI tools.

Underneath both is a **trust layer**: every number is Verified (quoted from a report page and auto-checked), Estimated (calculated with a visible formula) or Simulated (labelled demo data), and every AI sentence passes a numeric guardrail before anyone sees it.

**Live demo:** https://cognizant-amf1.vercel.app (offline demo mode, no sign-in). Backup video: `docs/demo-video/impact-lap-demo.mp4`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, no API key or network needed
```

Optional live AI: copy `.env.example` to `.env.local`, set `GEMINI_API_KEY` and `DEMO_MODE=false`.

## Check it

```bash
npm run check       # lint, types, unit tests, and the source audit (verify:data)
npm run test:e2e    # Playwright golden paths, including an offline run
npm run build
```

## Read more

- `AGENTS.md`: how the repo is organised and the rules for changing it
- `DESIGN.md`: the design system
- `docs/data-sources.md`: sources, extraction method, known data-quality issues
- `docs/architecture.md`: system design and production rollout
- `docs/DECISIONS.md`: judgement calls
- `docs/DEMO_SCRIPT.md`, `docs/ROI.md`: pitch support

---

Concept prototype: Team Growthbeans, AMF1 × Cognizant Ideathon 2026. Not affiliated with or endorsed by Aston Martin Aramco F1 Team. Figures are taken from the team's public reports; see `docs/data-sources.md`.
