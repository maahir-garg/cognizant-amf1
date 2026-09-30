# `/how-it-works` page copy

Final copy for the explainer page, written for judges and partners. Paper ground, reading width (680 px), serif body, Archivo for labels and figures. Every figure on the page is rendered from the fact base with `<FactValue>` or `<InlineFact>` and shows its status; the ids to use are listed under each section as **Figures**. Do not type any figure into JSX. Where the copy below shows `{fact-id}`, render that fact inline.

Headings are sentence case. One primary button at most (at the end).

---

## Page header

**Kicker:** For judges and partners

**H1:** How Off Camera works

**Dek:** One checked fact base, built from the team's own reports, feeds a story for fans and a desk for partners. The AI selects, explains, drafts and checks. It never adds a number of its own.

---

## The problem

The team publishes a detailed ESG report every year, with limited external assurance of its carbon inventory, written for auditors and analysts. Very little of it reaches fans in a form they would read.

The appetite is already there. ESG posts draw {c24-esg-posts-multiplier} the impressions of a typical race weekend, and partners sharing those stories, Cognizant among them, added {c24-esg-impressions-partners}. That retelling is done by hand, from a report that restates earlier years and in places disagrees with itself.

So fans miss the story, and partners have no safe, fast way to retell it.

**Figures:** `c24-esg-posts-multiplier`, `c24-esg-impressions-partners`. Link "restates earlier years" to the provenance drawer for `g25-restatement`. Link "disagrees with itself" to `/sources?flagged=1` (or the flagged view, confirm against build).

---

## Two audiences, one fact base

**Fans.** The story of the AMR26 off camera: where it is built, how it moves round the world, what powers the garage, who the team reaches and how far it has to go. Every figure opens to the page it came from. At the Singapore Grand Prix, fans find real programmes to take part in and a card worth posting.

**Cognizant and community partners.** A desk for the weekly jobs: what is relevant this race week, drafts with citations, a check for their own copy, an approval trail and exports for their own tools.

A figure a fan sees in the story is the same record a partner exports, with the same page and status.

**Figures:** none. Links: "The story" to `/`, "the desk" to `/partners`.

---

## What the AI does

Four steps, always in this order, always on the facts it is handed.

1. **Select.** For each chapter, race or partner request, the app picks the facts that are relevant and allowed. Disputed figures stay off fan pages. Pay-gap figures are never used for personalisation. Only the chosen fact ids are sent to the model.
2. **Explain.** The model writes a short paragraph in plain words, at the depth the reader chose, and cites each claim with the fact it came from.
3. **Draft.** The same method writes partner formats: a LinkedIn post, a race-week brief, a leadership update, a funder report paragraph for charities.
4. **Check.** A guardrail reads every number in the text and holds it back unless it matches a fact the text cites. A draft that fails is retried once with the reasons, then replaced by a template built only from the facts. The same check runs on copy a partner pastes into Check my draft.

Every generated paragraph carries a small label: "Figures checked", and who drafted it. In the offline demo that is the cache or a template. With a model key, it is Gemini. The check is the same either way.

**Figures:** none in the steps. Optional illustration: the four steps as a horizontal sequence at 1024 px and wider, a vertical list below. Plain boxes and arrows, no icons.

---

## See the check work

A partner writes: "Make A Mark Day brought 275 students to the factory for AI, coding and careers sessions with Cognizant."

The desk holds it back. 275 is not in the fact base.

Corrected to {c25-mam-day-students}, it passes, with a suggested citation: {citation for c25-mam-day-students}.

**Figures:** `c25-mam-day-students`, with its citation from `factCitation()` (it reads "2025 report, p. 59"). The 275 is the deliberate error and is shown struck through or in a "Held back" state, never as a fact. If the build allows, render this as a live, read-only example using the Check my draft component with the two lines preloaded (confirm against build); otherwise static text.

---

## What every status means

- **Verified.** Printed in one of the team's reports, with its page and an exact quote. An automated check re-finds the quote on that page on every build.
- **Estimated.** Calculated from verified figures. The formula, inputs and assumptions open in the drawer.
- **Data gap.** The team has not published this. We show the gap, not a guess.

Status is always shown as a mark and a word, never by colour alone.

**Figures:** one example of each, rendered with the real components: Verified `e25-saf-avoided`; Estimated `est-airfreight-before-saf` (implied air-freight emissions before the SAF cut; its drawer shows the formula over `e25-saf-avoided` and `e25-saf-airfreight-cut`). Do not use the per-round even splits here; Data gap: Singapore trackside energy.

---

## How we handle what the report says

The rules this prototype sets itself, following the team's own reporting.

- The team's own pillar names: Environment, Belong, Community, and Governance for reporting.
- Most of the footprint is the supply chain: {e25-supply-chain-share}. We say so plainly.
- Carbon removals deal with emissions the team cannot eliminate yet. We never call the team carbon negative, neutral or offset.
- Earlier years were restated, so we never compare 2024 and 2025 totals. Progress uses the report's own figures: Scope 1 and 2 {e25-progress-scope12}, Scope 3 {e25-progress-scope3}.
- The paddock energy cut applies to European races. Singapore trackside energy is not published.
- Fan travel is not in the team's inventory. The travel tip compares modes using government factors, labelled Estimated.
- The pay gap only appears with the report's explanation that a pay gap is not unequal pay and reflects representation.
- Where the report disagrees with itself, the figure is flagged on `/sources` and on the partner desk, and kept off fan pages.

**Figures:** `e25-supply-chain-share`, `e25-progress-scope12`, `e25-progress-scope3`. Do not show the pay-gap figures here.

---

## What is real now, and what is the pilot

Nothing in Off Camera is live today, and nothing claims to be. Every figure says "Updated when the team publishes", with the report date.

| Data                       | Now                                                    | In the pilot, with an approved feed and a named owner |
| -------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Fan quick checks and cards | Kept on the fan's device                               | Counted as they happen, with consent                  |
| Trackside energy by source | European races in the 2025 report; a gap for Singapore | One to two weeks after each race                      |
| Freight by mode            | Annual total                                           | Monthly                                               |
| Charity totals             | Annual, as published                                   | Per event, once the charity confirms                  |
| Assured footprint          | Annual                                                 | Annual                                                |

**Figures:** none; this is a plan. Label the right-hand column "Pilot plan" in the table header.

---

## How we would measure the return

Return here is broader than sales. None of these are measured yet; each has a published baseline or starts in the first pilot race.

| Return                        | Measure                                                    | Baseline                                                           |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Partner amplification         | Impressions from partner posts using Off Camera content    | {c24-esg-impressions-partners}                                     |
| Comms efficiency              | Time from brief to approved post                           | A baseline week of manual timings                                  |
| Accuracy and trust            | First-pass check rate; corrections after publication       | From the first pilot race                                          |
| Fan engagement                | Story completion, chapters opened, return at the next race | From the first pilot races                                         |
| Reach via sharing             | Cards created and shared                                   | {c24-esg-posts-multiplier} as the team's benchmark for ESG content |
| Awareness of Cognizant's role | Consented recall                                           | From the first pilot race                                          |
| Brand perception              | Sentiment on posts using Off Camera content                | {b25-accelerate-sentiment}, a comparable figure the team reports   |

**Figures:** `c24-esg-impressions-partners`, `c24-esg-posts-multiplier`, `b25-accelerate-sentiment`, each with its status badge.

---

## The 2027 pilot and business model

**Year one.** Cognizant funds a pilot as value-in-kind within its partnership as the team's {g-cognizant-role}. Cognizant gains a client-referenceable, governed Gen-AI case; the team gains the comms tool and the fan story.

**Year two.** The team offers an impact reporting pack to other partners as a sponsorship benefit.

**Year three.** Cognizant packages the pattern (fact base, then guardrail, then cited output) for its clients' ESG, investor and regulatory communications.

**The pilot.** One fan story and the Impact desk, for three groups: the team's communications and sustainability staff, Cognizant's communications staff, and two or three Make A Mark charity partners. About six races, including a fly-away.

**Phases.**

1. Q4 2026: data-sharing agreement, approval workflow, a baseline week of manual timings.
2. Pre-season to race 6: launch with published facts.
3. Mid-season: add one approved per-race feed, trackside energy or freight, with a named owner.
4. Season end: evaluate against the baseline and decide on the sponsor tier.

**Team.** A product lead, two engineers, an ESG data analyst, a part-time designer, and named approvers at the team and Cognizant.

Small print under the section: "Pilot scope, team and phases are assumptions for discussion. No revenue figures are claimed."

**Figures:** `g-cognizant-role` (text fact, rendered inline).

---

## Sources and method

Every figure comes from the team's 2025 and 2024 Make A Mark reports, the Make A Mark Manifesto and the Make A Mark web page, with DEFRA and EPA factors for travel comparisons. The full list, the extraction method and every flag are on the sources page.

**Primary button:** Explore the sources (links to `/sources`)

**Secondary link:** Read the story (links to `/`)
