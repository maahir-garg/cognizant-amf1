# Impact Lap

**The story of the AMR26 off camera, every figure sourced.** A concept prototype for the Cognizant × Aston Martin Aramco F1 Gen-AI Ideathon (Singapore, October 2026).

Impact Lap turns the team's published sustainability, inclusion and community data into:

- **A fan story**: a scroll-led route from factory preparation to the circuit and beyond the race. It opens without sign-in or a questionnaire. Optional city, experience and interest choices adjust emphasis while environment, belonging, community and governance stay visible. A sourced knowledge challenge follows the story, alongside the Singapore Grand Prix view, sharing and action paths.
- **A partner dashboard**: KPI tiles with a full audit trail, AI-drafted posts and briefs with inline citations, a scenario model, and CSV/JSON export for BI tools.

Underneath both is a **trust layer**: every number is Verified (quoted from a report page and auto-checked), Estimated (calculated with a visible formula) or Simulated (labelled demo data), and every AI sentence passes a numeric guardrail before anyone sees it.

**Live demo:** https://cognizant-amf1.vercel.app (offline demo mode, no sign-in). Backup video: `docs/demo-video/impact-lap-demo.mp4`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, no API key or network needed
```

Optional live AI: copy `.env.example` to `.env.local`, set `GEMINI_API_KEY` and `DEMO_MODE=false`.

The current experience uses published team data. Connected operational feeds would require approved source access and publishing checks before they could support timely reporting.

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
- `docs/PRODUCT_RATIONALE.md`: experience flow, web rationale and production boundaries
- `docs/DECISIONS.md`: judgement calls
- `docs/DEMO_SCRIPT.md`, `docs/ROI.md`: pitch support

---

Concept prototype: Team Growthbeans, Aston Martin Aramco × Cognizant Ideathon. Figures are taken from the team's public reports; see `docs/data-sources.md`.
