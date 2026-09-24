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

Persona deep links (skip onboarding if time is short):

- Main: `http://localhost:3000/lap?p=new.singapore.environment-stem`
- Casual Singapore fan: `/lap?p=casual.singapore.community-inclusion`
- Die-hard London fan: `/lap?p=die-hard.london.environment-tech`

## Run of show

| Time | Screen | Do | Say (talking points) |
|---|---|---|---|
| 0:00 | `/` | Pause on the headline and the four figures. Point at a status mark. | "Every number here is either quoted from the team's own report, calculated from it with the formula shown, or labelled as demo data. That's the trust layer; everything else sits on top of it." (Innovation) |
| 0:30 | `/start` | Pick **New to F1**, **Singapore**, **Environment** and **STEM**, then **Start your lap**. | "Thirty seconds, no sign-up. Fan level changes the depth: new fans get more explanation and more quiz beats, die-hards get the raw tables and the caveats." (Desirability) |
| 1:00 | `/lap` S1 | Read the first line of the AI intro. Answer the supply-chain quiz (81%). | "Most people think the car is the carbon story. It's the supply chain. The intro was written for this fan and every number in it is cited; the small numbered chips are the citations." |
| 1:30 | Provenance drawer | Click the revealed **81%**. | "Page 19 of the 2025 report, the exact quote, and a check that runs on every build. This is what we mean by trusted." (**Trust moment 1**) |
| 1:50 | `/lap` S2–S4 | **Next** through Belong and Community; answer one quiz. Stop on **Scrutineering**. | "Scrutineering is governance: CDP B, independently assured carbon numbers, validated science-based targets." |
| 2:30 | `/weekend/singapore-2026` | Point at the **Estimated** badge on 231.7 tCO₂e, toggle **London–New York return flights**, scroll to **Data gap**. | "The team publishes annual totals, so a per-race figure is an estimate and we say so. Singapore's trackside energy isn't published at all, so we show the gap instead of inventing a number. In production, Cognizant plugs the logistics feed in and this becomes measured." (Viability) |
| 3:10 | Matched for you → Live feed | Show the verified Singapore STEM outreach, then the illustrative Pit Lane Classroom and the ticking live feed. | "Real programmes first, clearly labelled ideas second. The live feed is a simulated replay of a race weekend; the architecture is the same one a real event stream would use." |
| 3:30 | `/share` | **Download PNG**. | "A 9:16 story card with the status marks kept on. Fans become the distribution channel." (Engagement ROI) |
| 3:45 | `/act` | Pick **MRT**, **Log this trip**, open **Your programme**. | "Awareness to action. Credits are simulated today; in a pilot they'd be partner-sponsored rewards." |
| 4:05 | `/partners` | Click a KPI tile to open provenance. Wait for the milestone alert in the right-hand rail. | "This is Cognizant's view: every KPI audit-ready. When the live counter crosses a milestone, a campaign post drafts itself, grounded and cited, marked as simulated." (Partner relationships) |
| 4:45 | `/partners/narratives` | Switch **LinkedIn post** to **Investor slide summary**, then **Copy as plain text**. | "Minutes instead of days to produce partner content, with footnotes back to the report pages." (Business opportunity) |
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
- **Page stuck or blank**: reload. Fan progress is kept in local storage.
- **Milestone alert slow**: press **Restart** on the live panel; the first alert fires within about 10 seconds.
- **Projector cropping**: Cmd/Ctrl + minus to 90%. Layouts are tested at 1920×1080 and 390 px wide.
- **Anything else**: play `docs/demo-video/impact-lap-demo.mp4` (2 min 53 s, 1920×1080) and narrate over it.

## Likely judge questions

1. **"Where does the data come from, and how do you know it's right?"** The 2025 and 2024 Make A Mark ESG reports, the Manifesto and the Make A Mark page; DEFRA and EPA for conversion factors. Every verified fact has a page and a verbatim quote that an automated check finds on that page. Estimates are recomputed from their inputs. See `docs/data-sources.md`.
2. **"Isn't the AI just making things up?"** It only sees the facts for that request, must cite each claim, and the guardrail rejects any number that doesn't match a cited fact. If a draft fails twice, a grounded template is used. The UI never shows unchecked text and always says what drafted it.
3. **"Per-race emissions aren't published, so isn't the Singapore number fake?"** It's labelled Estimated, shows its formula (annual freight ÷ 24 rounds) and its limits. The production plan replaces it with measured logistics data, which is Phase 1 of the rollout.
4. **"What would it take to build this for real, and what does Cognizant own?"** Phase 1 is one fly-away race with logistics and travel feeds (about 8–10 weeks); Cognizant owns the data platform, governed fact base, grounded-generation service and Impact API; AMF1 owns data, approvals and the fan brand. See `docs/architecture.md`.
5. **"How do you measure ROI if it isn't sales?"** Lap completion, quiz accuracy, share-card rate, return visits, low-carbon pledges, partner content reuse and time-to-post, drawer opens per session. Baselines come from the team's own reporting, for example ESG posts already drawing three times the impressions of a race weekend. See `docs/ROI.md`.
