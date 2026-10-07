# Off Camera

**The side of Aston Martin Aramco you never see on the broadcast.** A concept prototype for the Cognizant × Aston Martin Aramco F1 Gen-AI Ideathon (Singapore, October 2026).

Off Camera turns the team's published Make A Mark reports into the story of the AMR26 away from the track: where it is built, how it is moved round the world, what powers the garage, who the team reaches and how far it has to go. Every figure opens to the page of the team's own report it came from.

**Live demo:** https://cognizant-amf1.vercel.app (offline demo mode, no sign-in). Backup video: `docs/demo-video/impact-lap-demo.mp4` shows the previous build; it is re-recorded on the final build as `docs/demo-video/off-camera-demo.mp4` before the pitch.

## Who it is for

- **Fans**, from new to long-time. A scroll-led visual story with no sign-in or questionnaire, a depth toggle ("New to F1" or "Watched for years"), real programmes to take part in at the Singapore Grand Prix, and a race-week card worth posting.
- **Cognizant and the team's community partners.** The Impact desk: what is relevant this race week, drafts with citation chips, a check for their own copy, an approval trail, and CSV or JSON export for their own tools.

Both read from the same checked fact base.

## Run it

Node 20 or later.

```bash
npm install
npm run dev        # http://localhost:3000, no API key or network needed
```

Optional live AI: copy `.env.example` to `.env.local`, set `GEMINI_API_KEY` and `DEMO_MODE=false`. Without them the app runs in offline demo mode, serving AI text from grounded templates (and from `data/ai-cache/`, which stays empty until `npm run warm-cache` fills it).

For the pitch laptop: `npm run build`, then `npm start`.

## Check it

```bash
npm run check         # lint, types, unit tests and the source audit (verify:data)
npm run verify:data   # re-checks every verified quote against its source page
npm run test:e2e      # Playwright golden paths, including an offline run
npm run build         # production build
```

Other scripts: `npm run warm-cache` (fills `data/ai-cache/` when `GEMINI_API_KEY` is set), `npm run extract:sources` (rebuilds `sources/text/` from the PDFs; needs poppler's `pdftotext`), `npm run record-demo` (records the demo video), `npm run format`.

## Routes

| Route                     | What it is                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/`                       | The story: title page, six chapters following the team's footprint map, then your Singapore race weekend          |
| `/weekend/singapore-2026` | The race page: what the team published for it, programmes, getting there, data gaps                               |
| `/share`                  | Build a 9:16 race-week card and download it as a PNG                                                              |
| `/quiz`                   | The three-question knowledge check                                                                                |
| `/partners`               | The Impact desk: This race week, Narratives, Check my draft, Scenarios, Story kit, Data quality, Measures, Export |
| `/how-it-works`           | For judges and partners: the problem, the AI steps, the guardrail, impact measures and the pilot                  |
| `/sources`                | Every fact, its source page, quality flags and method                                                             |
| `/api/partner/metrics`    | Read-only JSON, or CSV with `?format=csv`, for partner BI tools                                                   |

Old links to `/start`, `/lap` and `/act` redirect to `/`, and `/partners/roi` redirects to `/partners/measures`.

## How trust works

- **Every number has a status.** Verified (printed in a team report, with page and exact quote, re-checked on every build) or Estimated (calculated from verified figures, with the formula shown). Where the team has not published something, the page shows a data gap, not a number.
- **Every number opens its source.** Tap a figure to see the quote, the report page and any caveat.
- **The AI only uses what it is given.** Each request names the facts it may use; the model must cite each one.
- **A guardrail checks every figure.** Generated text is held back unless each number matches a fact it cites. A failed draft is retried once, then replaced by a grounded template. The same check runs on copy a partner pastes into Check my draft.
- **The drafter is labelled.** On the Impact desk and `/how-it-works`, every generated block says "Figures checked" and whether a model or a template wrote it. Fan pages keep one plain line: "Every number checked against the report".
- **Nothing is simulated.** The product shows no demo data, and nothing is called live. Figures say "Updated when the team publishes".
- **The report's own inconsistencies are shown.** Quality flags live on `/sources` and the Impact desk, and are kept off fan pages.

## Docs

| File                        | What it covers                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                 | How the repo is organised and the rules for changing it                                                                                |
| `DESIGN.md`                 | The design system                                                                                                                      |
| `docs/PRODUCT_RATIONALE.md` | The problem, the two audiences, how AI transforms the data, the story structure, stakeholder guardrails, now versus pilot, positioning |
| `docs/IMPACT.md`            | Impact measures, the 2027 pilot, risks                                                                                                 |
| `docs/DEMO_SCRIPT.md`       | The timed 15-minute pitch and demo, with fallbacks                                                                                     |
| `docs/architecture.md`      | System design, routes, layers and how production feeds would plug in                                                                   |
| `docs/data-sources.md`      | Sources, extraction method and known data-quality issues                                                                               |
| `docs/partner-api.md`       | The partner metrics endpoint                                                                                                           |
| `docs/DECISIONS.md`         | Judgement calls, one line each                                                                                                         |
| `docs/overhaul/`            | The locked overhaul brief, design spec, plan and `/how-it-works` copy                                                                  |
| `public/brand/README.md`    | Source and permitted use of the car images                                                                                             |

---

Concept prototype: Team Growthbeans, Aston Martin Aramco × Cognizant Ideathon. Figures are taken from the team's public reports; see `docs/data-sources.md`.
