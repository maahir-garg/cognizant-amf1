# Product rationale

Off Camera is the side of Aston Martin Aramco you never see on the broadcast: the story of the AMR26 away from the track, where it is built, how it is moved round the world, what powers the garage, who the team reaches and how far it has to go. Every figure opens to the page of the team's own report it came from. Fans get that story and a way to take part at their next race. Cognizant and the team's community partners get a desk that turns the same checked facts into content they can publish.

Figures in this document are referred to by their id in `data/facts.json`. Where a value is quoted, it is the value stored against that id.

## The problem

The team already publishes a lot. The 2025 Make A Mark report runs to 92 pages, with a restated baseline (`g25-restatement`), an assured inventory (`g25-assurance`) and science-based targets (`g25-sbti`). It is written for auditors and analysts, and very little of it reaches a fan in a form they would read.

The appetite is there. ESG posts already draw three times the impressions of a typical race weekend (`c24-esg-posts-multiplier`), and partners sharing those stories, Cognizant among them, added a further 97m impressions (`c24-esg-impressions-partners`). That amplification is done by hand today: each partner rereads the report, picks figures, drafts copy and hopes nobody gets a number wrong.

Getting a number wrong is easy. Reading the reports fact by fact, we found places where they disagree with themselves: two cohort sizes for the same programme, a restated baseline, a Silverstone-lap equivalence that differs by about fourteen times between years. These are recorded as quality flags in the fact base and listed on `/sources`. Any tool that retells ESG data has to handle this honestly or it becomes a greenwashing risk.

So there are two gaps: fans do not see the story, and partners have no safe, fast way to retell it.

## Two audiences, one fact base

| Audience                         | Why them                                                                                                                               | What they get                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fans, from new to long-time      | They are the audience the ESG content already outperforms with, and the people who turn up at the Singapore Grand Prix on 9-11 October | The story behind the car, told like a visual feature; a tap on any figure to see the report page; real programmes to take part in at their race; a card worth posting |
| Cognizant and community partners | They amplify the team's stories today, manually, and each needs to show what the partnership does                                      | A weekly desk: what is relevant this race week, drafts with citations, a check for their own copy, an approval trail, exports for their own tools                     |

Both read from the same checked facts. A figure a fan sees on the story is the same record a partner exports to a spreadsheet, with the same page reference and status.

### Why a fan uses it

These four reasons sit on screen near the top of the story, one line each:

1. The story behind the car, told like a visual feature, not an ESG report.
2. Know what is real: tap any figure to see the report page.
3. Take part at the Singapore Grand Prix: real programmes (STEM Racing, Unearth Your Greatness) and a practical tip for getting to Marina Bay.
4. Something worth posting: a race-week card with a quiz badge and one sourced team fact.

There is no questionnaire and no sign-in. A small depth toggle ("New to F1" or "Watched for years") changes how much detail is open by default. It never hides a pillar.

### Why a partner uses it

The desk is built around the jobs a partner comms lead does every week:

- **This race week.** What the team has published that is relevant to Singapore, the joint Cognizant facts (tagged `partner:cognizant`), suggested posts, and the data gaps to avoid.
- **Check my draft.** Paste your own copy. Every number is matched against the fact base and a citation is suggested; a number that matches nothing is held back.
- **Approvals and audit trail.** Drafts move from draft to approved with a named reviewer and a timestamp.
- **What changed.** When the team publishes new figures or restates old ones, the desk shows it, so a partner does not reuse a superseded number.

Around those sit narratives (LinkedIn post, quarterly brief, leadership update), a scenario view for joint programmes, a story kit for charities (a social post and a funder report paragraph), the data-quality flags, a measures panel and CSV or JSON export.

## How AI transforms the data

The AI does four things, always in this order and always on the facts it is handed.

| Step    | What happens                                                                                                                                                                                                                                      | Where you see it                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Select  | For a chapter, a race or a partner request, the app picks the facts that are relevant and allowed (for example, no disputed figures on fan pages, no pay-gap figures in personalisation). Only those ids are sent.                                | "Facts this draft may use" on the desk; the facts behind each chapter's paragraph |
| Explain | The model writes a plain-words paragraph for each chapter, at the reader's chosen depth, citing each claim as `[F:fact-id]`.                                                                                                                      | "In plain words" and "The detail" on the story                                    |
| Draft   | The same method produces partner formats: a LinkedIn post, a race-week brief, a leadership update, a funder report paragraph.                                                                                                                     | Narratives and story kit on the desk                                              |
| Check   | A guardrail extracts every number from the text and rejects it unless it matches a fact the text cites. A rejected draft is retried once with the reasons, then replaced by a grounded template. The same check runs on copy a partner pastes in. | The "Figures checked" label on every generated block; Check my draft              |

The model does not measure anything and never sees the whole dataset. In the offline demo the text comes from the grounded templates (the cache in `data/ai-cache/` stays empty until `npm run warm-cache` runs with a key); with a model key configured it comes from Gemini. Either way it passes the same check. On the desk the label says which one drafted it; fan pages show one plain line, "Every number checked against the report".

## The story follows the team's own map

The 2025 report maps its footprint across the team's operations on pp17-18: behind the speed, the AMR Technology Campus, the supply chain, moving people, moving parts, life at the circuit and inside the garage. The story at `/` follows that map, so a reader who later opens the report finds the same structure.

| Chapter                                                        | From the report's map                        | Beats (fact ids)                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title page                                                     | 01 Behind the speed                          | Byline: from the team's 2025 Make A Mark report, every figure sourced                                                                                                                                                                                                                             |
| 1. Campus: where the car comes to life                         | 02 AMR Technology Campus                     | `e24-solar-panels`, `e25-circularity`, `e25-carbon-fibre-recycled`, `e25-cups-removed` with `e25-cups-laps`, `e25-biodiversity-net-gain`, `e25-wild-meadow`                                                                                                                                       |
| 2. Supply chain: most of the footprint is things the team buys | 03 Supply chain                              | `e25-supply-chain-share`; a footprint bar from `e25-ghg-total-sbti` split into `e25-supply-chain`, `e25-freight-logistics`, `e25-commuting`, `e25-business-travel`, `e25-hq-energy`, `e25-other-emissions`                                                                                        |
| 3. Moving the team: planes, ships and a cleaner fuel           | 04 Moving our people, 05 Moving our parts    | `e25-freight-logistics`, `e25-saf-avoided` with `e25-saf-laps`, `e25-saf-airfreight-cut`, `e24-sea-freight-shift`, `e25-travel-logistics-cut`                                                                                                                                                     |
| 4. At the circuit: what runs the garage                        | 06 Life at the circuit, 07 Inside the garage | `e25-event-energy-cut` (European races only), trackside energy by source for the European races (`e25-trackside-*`), and a data gap for the Singapore night race                                                                                                                                  |
| 5. Beyond the track: Belong and Community                      | Belong and Community pillars                 | `c25-stem-racing-students`, `c25-stem-racing-countries`, `c25-stem-racing-singapore`, `c25-maaden-target`, `b25-accelerate-*`, `b25-aleto-network`, `c25-charity-2025`, `e25-ethiopia-children` with `e25-removals`; pay gap and women share in the detail layer only, with the p55 explanation   |
| 6. The finish line: how far there is to go                     | Targets and Governance                       | The p15 target chart (`e23-ghg-baseline`, `e25-ghg-total-sbti`, `e25-target-2030-tco2e`, `e25-target-2050-tco2e`), `e25-progress-scope12`, `e25-progress-scope3`, `e25-target-scope12`, `e25-target-scope3`, `e25-target-netzero-year`, `g25-sbti`, `g25-assurance`, `g25-cdp`, `g25-restatement` |
| 7. Your race weekend: Singapore                                | The fan's own part                           | Real programmes tied to Singapore and STEM, getting to Marina Bay (a share of a taxi's or a solo drive's emissions, from `data/travel-modes.json`), a three-question check, and the card at `/share`                                                                                              |

Each chapter shows one plain beat. A "The detail" disclosure holds the numbers, caveats and formula notes, and is open by default for "Watched for years".

## Guardrails from the team and partners

These follow the team's own reporting and are rules, not preferences.

- **The team's pillar names.** Environment, Belong, Community, plus Governance for reporting.
- **Pride and invitation, never guilt.** No "save the planet", no green superlatives, no scoring fans, and never "help the team hit net zero". Fan travel is not in the team's inventory: the report counts Scope 3 categories 1 to 7 (p85), and we say so.
- **Removals are not neutrality.** `e25-removals` and `e25-removals-vs-scope12` are framed as dealing with emissions the team cannot yet eliminate (p26). The product never says "carbon negative", "carbon neutral" or "offset".
- **The supply chain is most of it.** `e25-supply-chain-share` is said plainly, so the campus is not the whole story.
- **No 2024 versus 2025 comparisons.** Earlier totals were restated (`g25-restatement`). Progress uses the report's own figures: `e25-progress-scope12` and `e25-progress-scope3`, and the p15 target chart.
- **Pay gap with its explanation.** `b25-pay-gap-median`, `b25-pay-gap-mean` and `b25-women-share` only appear with the p55 explanation that a pay gap is not unequal pay and reflects representation, and they lead with what the team is doing (Accelerate Women, Aleto, AFBE-UK). They are never on the share card and never in AI personalisation.
- **Renewable wording.** Fans see "renewable energy-backed supply", not the derived share `est-rego-share`.
- **Scope of the paddock figure.** `e25-event-energy-cut` applies to European races. Singapore trackside energy is not published, so the product shows a data gap rather than a number.
- **Even splits stay in the detail.** `est-freight-per-round`, `est-travel-per-round` and `est-saf-per-round` are the season total divided evenly across 24 rounds. They are never a hero number and never labelled as Singapore's.
- **Disputed figures stay off fan pages.** Facts with a `source-conflict` flag, and the flags themselves, live on `/sources` and the partner desk. The one exception is the story's footprint total, the report's own target-chart value, shown under a plain label without the flag note.
- **Laps of Silverstone only where the report prints them.** `e25-saf-laps` and `e25-cups-laps`, worded as laps in a petrol road car, the team's own comparison. A fan's trip is never converted to laps.
- **Honest timing.** Nothing is called live. Figures are labelled "Updated when the team publishes", with the report date.

## What is real now and what is the pilot

| Now, in the prototype                                                                                              | In the 2027 pilot, once an approved feed and owner exist                 |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Every figure from the 2025 and 2024 reports, the Manifesto and the Make A Mark page, each checked against its page | The same, plus figures the team approves for publication between reports |
| Fan choices (depth, travel plan, quiz badge, card) stay on the device                                              | Quick checks and card creation counted as they happen, with consent      |
| Trackside energy by source for the European races the report covers; a data gap for Singapore                      | Trackside energy by source, refreshed one to two weeks after each race   |
| Freight emissions as the annual total                                                                              | Freight by mode, refreshed monthly                                       |
| Charity totals as published annually                                                                               | Charity totals per event, once the charity partner confirms them         |
| The annual carbon inventory, with limited external assurance                                                       | Unchanged: the inventory and its assurance stay annual                   |
| Drafts from the cache or templates offline, or Gemini with a key, all through the same check                       | The same check, with approvals stored centrally and an audit log         |

Pilot cadences are written into the product as "Updated when the team publishes" plus the expected rhythm. None of them are shown as working UI today.

A personalised driver film, synthetic likeness or voice is out of scope. It would need approved footage, rights, consent and review.

## Why the web

A link opens on a phone without an app, an account or a download, and it can be shared by the team, by partners and by fans. It works offline in the demo and at 390 px wide. Fan choices stay on the device; the story asks for no personal data.

## Positioning

[AWorld](https://www.aworld.org/platform/) runs a broad engagement platform with learning, challenges and action tracking, including its [ActNow](https://actnow.aworld.org/) work and a [MotoGP case study](https://www.aworld.org/case-studies/motogp/). It has personalisation, reporting and motorsport content, and we should not suggest otherwise.

Off Camera's contribution is narrower. It starts from one team's own report evidence, organises it around the car's operations using the team's own footprint map, shows the status and source of every figure, and reuses the same checked facts for partner content with a numeric check and an approval trail. The two could sit side by side: a platform for behaviour and action, and a governed fact base for what the team itself can say.

The main interaction reference is the [Straits Times playground feature](https://www.straitstimes.com/multimedia/graphics/2024/10/sg-playground-culture/index.html): one idea per screen, captions over a sticky visual, evidence close to each claim. It supplies no data or assets. The car images are the team's own, stored locally with their source record in [`public/brand/README.md`](../public/brand/README.md).
