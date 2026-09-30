# Live demo script (6 minutes inside the 15-minute pitch)

Presenter drives, one teammate narrates. Everything runs from a laptop in offline demo mode; no Wi-Fi needed.

## Pre-flight (do this 30 minutes before, on the pitch laptop)

1. `npm install` (already done), then `npm run build && DEMO_MODE=true npx next start -p 3000`.
2. Open Chrome at `http://localhost:3000`, zoom **100%**, window full screen at 1920×1080. Close other tabs.
3. Clear local data: DevTools → Application → Local storage → clear `localhost:3000` (or open a fresh profile). This resets the fan profile and credits.
4. Open the partner dashboard once (`/partners`) to warm the page, then return to `/`.
5. Second tab: `docs/demo-video/impact-lap-demo.mp4` ready to play (backup).
6. Turn Wi-Fi **off** to prove the point, or leave it on; the demo behaves the same.
7. Mirror the display; check the projector shows the full 1920×1080 width.

Exploration and optional persona links:

- Main, no set-up: `http://localhost:3000/lap`
- Casual Singapore fan: `/lap?p=casual.singapore.community-inclusion`
- Die-hard London fan: `/lap?p=die-hard.london.environment-tech`

## Run of show

| Time | Screen | Do | Say (talking points) |
|---|---|---|---|
| 0:00 | `/` | Pause on the illustrated route, then scroll to a published figure and open its status. | "The route introduces the story without a video dependency. Every impact figure carries its evidence status and opens its source." (Innovation) |
| 0:30 | `/lap` | Enter the story directly and begin scrolling. | "A browser link, no download, account or app-store gate. You can explore immediately; personalisation is optional." (Desirability) |
| 1:00 | `/lap` · Factory | Scroll through the opening factory and preparation scene. Read the first line of the grounded introduction. | "We follow the car from preparation to the circuit and beyond the race. The supply chain is a major part of the published carbon story. Every number in this explanation is cited; the small numbered chips lead to the evidence." |
| 1:30 | Provenance drawer | Click the revealed **81%**. | "Page 19 of the 2025 report, the exact quote, and a check that runs on every build. This is what we mean by trusted." (**Trust moment 1**) |
| 1:50 | `/lap` · Factory to post-race | Scroll through the remaining stages and stop at Governance. Point out the optional knowledge challenge link. | "The car gives the story a clear route, while environment, belonging and community remain visible. Governance keeps the source, status and caveats attached. Fans can try the challenge after reading; it never blocks the story." |
| 2:15 | `/start` (optional) | Briefly show the personalisation controls. If time allows, choose **Singapore**, then return to the story. | "Fans who want a closer match can select a city, level and interests after they have started exploring. The choices change emphasis and select a supported nearby race; they do not remove ESG topics." |
| 2:30 | `/weekend/singapore-2026` | Point at the **Estimated** badge on 231.7 tCO₂e, toggle **London–New York return flights**, scroll to **Data gap**. | "The team publishes annual totals, so a per-race figure is an estimate and we say so. Singapore's trackside energy isn't published in our sources, so we show the gap. If approved shipment data becomes available, the pilot can replace or refine the allocation." (Viability) |
| 3:10 | Matched for you → Simulated replay | Show the verified Singapore STEM outreach, then the illustrative Pit Lane Classroom and the ticking replay. | "The city the fan selected ranks relevant published initiatives. Real programmes come first and illustrative ideas are labelled. This panel is a simulated race-weekend replay, proving the interface while the demo stays offline; it is not team telemetry." |
| 3:30 | `/share` | **Download PNG**. | "A 9:16 story card with the status marks kept on. Fans become the distribution channel." (Engagement ROI) |
| 3:45 | `/act` | Pick **MRT**, **Log this trip**, open **Your programme**. | "Awareness to action. Credits are simulated today; in a pilot they'd be partner-sponsored rewards." |
| 4:05 | `/partners` | Click a KPI tile to open provenance. Wait for the simulated milestone alert in the right-hand rail. | "This is Cognizant's view: every KPI links to its evidence. When the simulated counter crosses a milestone, the prototype creates a grounded, cited campaign draft. A person still reviews it before publication." (Partner relationships) |
| 4:45 | `/partners/narratives` | Switch **LinkedIn post** to **Investor slide summary**, then **Copy as plain text**. | "This gives the communications team a sourced first draft with footnotes back to the report pages. A pilot would measure drafting and review time before claiming a saving." (Business opportunity) |
| 5:15 | `/partners/scenarios` | Drag the **SAF** slider to about 45%. | "What-ifs only multiply verified baselines. No invented costs: the report doesn't publish SAF prices, so the model says so." |
| 5:40 | `/sources` → **flagged only** | Scroll the flags. | "Extracting the reports fact by fact surfaced 18 places where they disagree with themselves: cohort sizes, a restated baseline, a lap conversion off by fourteen times. We flag them instead of hiding them. That is governance a partner can stand behind." (**Trust moment 2**) |
| 6:00 | | Hand back to the slides. | |

## Trust moment 3 (Q&A, optional): the guardrail rejecting an invented number

From a terminal on the laptop:

```bash
npx vitest run tests/unit/guardrail.test.ts
```

Point at *"rejects an invented number"* and *"rejects a real number whose fact is not cited"*. The first feeds the guardrail "SAF avoided 1,500 tonnes" when the report says 1,188; it is rejected with the reason. Every AI output in the app passes through the same function before anyone sees it.

## If something goes wrong

- **Wi-Fi down**: nothing changes. Say so; it's a feature.
- **Server crashed**: `npm start` restarts in about 3 seconds (the build is already there). Meanwhile switch to the video tab.
- **Page stuck or blank**: reload. Saved fan preferences remain in local storage; return to the stage through the sticky route guide.
- **Milestone alert slow**: press **Restart** on the simulated replay panel; the first alert fires within about 10 seconds.
- **Projector cropping**: Cmd/Ctrl + minus to 90%. Layouts are tested at 1920×1080 and 390 px wide.
- **Anything else**: play `docs/demo-video/impact-lap-demo.mp4` (2 min 53 s, 1920×1080) and narrate over it.

## Likely judge questions

1. **"Where does the data come from, and how do you know it's right?"** The 2025 and 2024 Make A Mark ESG reports, the Manifesto and the Make A Mark page; DEFRA and EPA for conversion factors. Every verified fact has a page and a verbatim quote that an automated check finds on that page. Estimates are recomputed from their inputs. See `docs/data-sources.md`.
2. **"Isn't the AI just making things up?"** It only sees the facts for that request, must cite each claim, and the guardrail rejects any number that doesn't match a cited fact. If a draft fails twice, a grounded template is used. The UI never shows unchecked text and always says what drafted it.
3. **"Per-race emissions aren't published, so isn't the Singapore number fake?"** It's labelled Estimated, shows its formula (annual freight ÷ 24 rounds) and its limits. A pilot would first assess approved shipment data and then replace or refine the allocation where the source supports it.
4. **"What would it take to build this for real, and what does Cognizant own?"** Start with data discovery and one race: confirm owners, permissions, field mappings, assurance and publishing cadence before giving a delivery estimate. Cognizant's proposed scope is the data platform, governed fact base, grounded-generation service and Impact API; the team retains data, approvals and the fan brand. See `docs/architecture.md`.
5. **"How do you measure ROI if it isn't sales?"** Story completion, stages explored, optional challenge accuracy, share-card rate, return visits, low-carbon pledges, partner content reuse, measured review time and provenance opens. Baselines come from the team's own reporting, for example ESG posts already drawing three times the impressions of a race weekend. See `docs/ROI.md`.
6. **"Is the personalised driver video already working?"** The repository has no rights-approved personalised driver film. It can use a team-provided local clip or motion sequence with captions and approved text or region variants. Driver likeness, voice or name insertion is a production concept that needs approved footage, rights, consent and review. See `docs/PRODUCT_RATIONALE.md`.
