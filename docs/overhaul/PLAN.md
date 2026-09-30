# Overhaul plan and milestones

Pitch: Thursday 8 Oct 2026, team presentations from 12:40 at Cognizant Singapore (15 minutes including the live demo, 5 minutes of questions). Final deck to the organiser by 12:00 on 7 Oct. Singapore Grand Prix: 9-11 Oct.

## Goals

1. A fan understands, within the first screen, what Impact Lap is and what they get from it.
2. The story follows the AMR26 from the campus to the circuit and beyond, one idea per screen, with the smoothness and restraint of a Straits Times visual feature.
3. Every number opens to the report page it came from. No simulated data in the product.
4. Cognizant and community partners get a desk they would open every race week: sourced facts, checked drafts, an approval trail, exports.
5. The prototype runs offline, works at 390 px and on a 1920×1080 projector, and passes `npm run check`, `npm run build` and the end-to-end suite.
6. The documentation matches the product.

## Branching and merging

- Integration branch: `rebuild/overhaul`. Each workstream works on its own branch, opens a pull request into `rebuild/overhaul` and is merged when its checks pass.
- `main` receives the overhaul in one pull request once the QA milestone is green, because `main` backs the live demo.
- Conventional commits, no attribution trailers.

## Milestones

| # | Milestone | Done when | Target |
|---|---|---|---|
| M0 | Research and brief | Stakeholder, fan and design reviews synthesised into `overhaul-brief.md` and `design-spec.md` | 30 Sep ✓ |
| M1 | Foundation | New tokens, type, chrome and trust components; simulated features removed; check and build pass | 30 Sep ✓ |
| M2 | Story | `/` scrollytelling: title page, six chapters, Singapore section, depth toggle, AI text per chapter | 1 Oct |
| M3 | Race, share and quiz | `/weekend/[slug]`, `/share`, `/quiz` rebuilt on the new system | 1 Oct |
| M4 | Impact desk | `/partners` race-week desk, narratives with approval, check my draft, scenarios, story kit, ROI panel, exports | 1 Oct |
| M5 | Explainer, sources, docs | `/how-it-works`, `/sources`, README, rationale, ROI, architecture, demo script | 2 Oct |
| M6 | QA | End-to-end specs rewritten; accessibility, responsive and offline checks green; CI green | 2 Oct |
| M7 | Audit rounds | Personas, stakeholders, design, data claims, code hygiene and docs audits; fixes merged; repeat until audits stop finding material issues | 3-5 Oct |
| M8 | Ship | Overhaul merged to `main`, live demo updated, backup video re-recorded, demo script rehearsed | 6 Oct |

## Audit checklist (each round)

- **Personas**: a new fan, a long-time sceptic and a 16-year-old student try the live build on a phone and a laptop.
- **Stakeholders**: Aston Martin Aramco sustainability and brand; Cognizant partnership and comms; a charity partner.
- **Design**: motion smoothness, rhythm, type, contrast, image crops, nothing hidden before JavaScript runs.
- **Data claims**: every figure comes from the fact base, carries its status, and follows the stakeholder guardrails in the brief.
- **Code hygiene**: no dead files, unused dependencies or stale imports; lint, types and tests clean.
- **Docs**: README, AGENTS.md, DESIGN.md, rationale, ROI, architecture and demo script match the running product.

## Log

- 30 Sep: M0 complete. Snapshot of the previous draft committed on `rebuild/experience`. Four verified target figures added from the 2025 report, p15.
- 30 Sep: M1 complete. Paper and racing-green tokens, Newsreader, new header, footer and trust components; simulated feed, counters, credits and illustrative events removed; /start, /lap and /act redirect to the story. Story, race, partner desk and docs streams started in parallel worktrees.
