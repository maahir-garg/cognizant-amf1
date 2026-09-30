# Impact Lap overhaul: final brief (v1, locked)

Repo: /Users/maahirgarg/Downloads/cognizant-amf1. Next.js 16 (read node_modules/next/dist/docs for anything routing-related; params/searchParams are Promises; middleware is `proxy`). Read AGENTS.md first: the non-negotiables (no fabricated data, every number via FactValue/InlineFact/AiText with status, offline, NO AI attribution anywhere incl. commits, British English) still apply. Design spec: design-spec.md in the same folder as this file.

Pitch: 8 Oct 2026, 15 minutes including live demo. Singapore Grand Prix 9-11 Oct 2026.

## The product in one line
Impact Lap is the story of the AMR26 off camera: where it is built, how it is moved round the world, what powers the garage, who the team reaches, and how far it has to go. Every number opens to the page of the team's own report it came from. Fans get the side of the team they never see on the broadcast and a way to take part at their next race; Cognizant and the team's community partners get a desk that turns the same checked facts into content they can publish.

## Why a fan uses it (answer this on screen, in plain words, near the top)
1. The story behind the car, told like a visual feature, not an ESG report.
2. Know what's real: tap any figure to see the report page.
3. Take part at the Singapore GP: real programmes (STEM Racing, Unearth Your Greatness), a practical tip for getting to Marina Bay.
4. Something worth posting: a race-week card with a quiz badge and one sourced team fact.

## Guardrails from stakeholders (must follow)
- Pillar names are the team's: Environment, Belong, Community (plus Governance for reporting). Not "Social/Inclusion".
- Tone: pride and invitation, never guilt. No "save the planet", no green superlatives, no scoring fans, never "help the team hit net zero". Fan travel is NOT in the team's inventory (report counts Scope 3 categories 1-7, p85); say so honestly.
- Carbon removals (2,124 t, 137% of Scope 1+2) must never read as "carbon negative/neutral/offset". Frame: removals deal with emissions the team can't eliminate yet (p26).
- Say plainly that 81% of the footprint is the supply chain. Don't let the campus be the whole story.
- Never compare 2024 and 2025 totals. Use the report's own progress figures: new verified facts `e25-progress-scope12` (-74%) and `e25-progress-scope3` (-14%), plus the p15 target chart: `e23-ghg-baseline` 97,216 -> `e25-ghg-total-sbti` 87,162 -> `e25-target-2030-tco2e` 76,162 -> `e25-target-2050-tco2e` 9,722.
- Pay gap (`b25-pay-gap-median`, `b25-pay-gap-mean`) and women share (`b25-women-share`) only ever appear with the report's p55 explanation (a pay gap is not unequal pay; it reflects representation), and lead with what the team is doing (Accelerate Women, Aleto, AFBE-UK). Never on the share card, never in AI personalisation.
- Don't show derived "87.5% renewable" (`est-rego-share`) to fans; say "renewable energy-backed supply".
- The 90% paddock energy cut (`e25-event-energy-cut`) is European races only. Singapore trackside energy is not published: show a "Data gap" state.
- Even-split per-round estimates (`est-freight-per-round`, `est-travel-per-round`, `est-saf-per-round`) are demoted: never a hero number, never labelled "Singapore". If shown at all, only in a detail layer, clearly "the season total divided evenly across 24 rounds".
- Fan pages never show data-quality flags or disputed figures (facts with `source-conflict`). Those live in `/sources` and the partner desk.
- Laps of Silverstone: only where the report itself prints them (`e25-saf-laps`, `e25-cups-laps`), worded "laps in a petrol road car, the team's own comparison". Never convert a fan's trip to laps (the 2025 equivalence is ~14x a DEFRA petrol factor). Fan trips use a ratio vs taxi/driving from `data/travel-modes.json` (Estimated, DEFRA proxy factors).
- No simulated data in the product UI. Delete the simulated live feed, counters, events, impact credits, and the three `sg-*` illustrative initiatives. If a future capability (live feeds) is described, describe it as the pilot plan in words, not as fake UI.
- "Real-time": never claim live. Label as "Updated when the team publishes" with the report date; the pilot plan says trackside energy refreshes after each race weekend once an approved feed and owner exist.
- AI label in `AiMeta`: rename the "Verified" guardrail badge to "Figures checked" (it must not borrow the fact-status word).

## Information architecture
- `/` THE STORY (flagship, fan). Sections in order:
  0. Title page (paper, centred serif headline, dek, byline line "From the team's 2025 Make A Mark report · every figure sourced", scroll cue, car image band). A small depth toggle: "New to F1" (default) / "Watched for years". No questionnaire.
  0b. "What you'll get" strip: the four reasons above, one line each.
  1. Campus — where the car comes to life (Silverstone). Beats: `e24-solar-panels`, `e25-circularity` + `e25-carbon-fibre-recycled`, `e25-cups-removed` + `e25-cups-laps`, `e25-biodiversity-net-gain`/`e25-wild-meadow`. Image: launch-quarter.
  2. Supply chain — most of the footprint is things the team buys. `e25-supply-chain-share`, footprint bar from `e25-ghg-total-sbti` split: `e25-supply-chain`, `e25-freight-logistics`, `e25-commuting`, `e25-business-travel`, `e25-hq-energy`, remainder (derive "other" only via an estimated fact if needed, or omit). Image: active-aero.
  3. Moving the team — planes, ships and a cleaner fuel. `e25-freight-logistics`, `e25-saf-avoided` + `e25-saf-laps`, `e25-saf-airfreight-cut`, `e24-sea-freight-shift`, `e25-travel-logistics-cut`. Image: launch-rear.
  4. At the circuit — what runs the garage. `e25-event-energy-cut` (European races), trackside kWh chart for European races (lib/fan/trackside.ts), Singapore night race data gap. Image: render-rear.
  5. Beyond the track — Belong and Community. `c25-stem-racing-students`/`-countries`/`-singapore`, `c25-maaden-target` (Unearth Your Greatness), `b25-accelerate-*`, `b25-aleto-network`, Jessica Hawkins line (p39, the one allowed quote), `c25-charity-2025`, `e25-ethiopia-children` + `e25-removals`, pay gap + women share with p55 explanation (detail layer). Image: launch-front or active-aero.
  6. The finish line — how far there is to go. Target chart (p15), `e25-progress-scope12`, `e25-progress-scope3`, `e25-target-scope12`, `e25-target-scope3`, `e25-target-netzero-year`, `g25-sbti`, `g25-assurance`, `g25-cdp`, restatement note (`g25-restatement`). Image: launch-front.
  7. Your race weekend: Singapore GP (9-11 Oct). Take part (real programmes only, from initiatives.json verified entries tied to Singapore/STEM), getting there (home city select + mode, ratio vs taxi, GET form, works without JS), quick check (3 quiz questions, badge), make your card -> /share.
  Depth: each chapter shows one plain beat; a "The detail" disclosure (native <details>) holds numbers, caveats, formula notes. Open by default for "Watched for years". AI "In plain words / The detail" paragraph per chapter via AiText, grounded on that chapter's facts.
- `/weekend/[slug]` race page: what the team published for this race (trackside kWh where it exists, otherwise a data gap), programmes linked to the race/city, getting there, season context in the detail layer, "Updated when the team publishes" line. Singapore 2026 is the hero race.
- `/share` card builder: 9:16 card, fan picks their travel plan line + one team fact (from a curated safe list) + quiz badge if earned; export PNG (html-to-image). Group mode optional. No name by default.
- `/quiz` standalone knowledge check (same questions), optional.
- `/partners` Impact desk (Cognizant + community partners): "This race week" (Singapore: relevant published facts, joint Cognizant facts tagged `partner:cognizant`, suggested posts, data gaps); Narratives (AI drafts with citation chips, approval state draft -> approved with reviewer + timestamp stored locally, rename "investor summary" to "Leadership update"); Check my draft (paste copy; every number is matched against the fact base and a citation suggested, unmatched numbers held back); Scenarios (joint programmes only: drop SAF slider); Story kit for charities (co-branding derived from `initiative.partners`, add STEM Racing, add "Funder report paragraph" format, 9:16 and 1.91:1 sizes); Data quality (flags); ROI panel (published baselines via FactValue next to "measured in pilot" slots, no invented numbers); Export CSV/JSON (`/api/partner/metrics`).
- `/sources` evidence explorer, flags, method. Restyle.
- `/how-it-works` for judges and partners: the problem, audiences, what AI does (select, explain, draft, check), the guardrail, what's real now vs the pilot plan, ROI measures, 2027 pilot plan and business model (from docs/ROI.md, assumptions labelled).
- Remove `/start`, `/lap`, `/act` (redirect to `/` in next.config), their components and lib (lap.ts, credits, quiz-beat etc.), `/api/events/stream`, lib/live, events/counters data + schemas (+ tests).

## Header nav
Impact Lap wordmark · The story · Singapore GP · Partners · How it works · Sources. Offline-demo pill.
