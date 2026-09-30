# Off Camera: value, ROI and the 2027 pilot

The organisers asked for a return broader than sales: fan engagement, awareness, partner relationships and brand perception, and value for partners such as Cognizant and the charities in Make A Mark. This document maps the product to the judging scorecard, sets out how each kind of return would be measured, and describes the business model and the pilot that would test it.

Figures are referred to by their id in `data/facts.json`. Anything that is a plan, a range or a judgement rather than a published figure is marked **Assumption**. No revenue figures are claimed.

## Why the problem is worth solving

- **ESG content already performs.** ESG posts drew three times the impressions of a typical race weekend (`c24-esg-posts-multiplier`) and 144.8m impressions in total (`c24-esg-impressions`).
- **Partners already amplify it, by hand.** Partners sharing team-led initiatives, Cognizant among them, generated a further 97m impressions (`c24-esg-impressions-partners`). Each did its own reading, drafting and checking.
- **The source is hard to retell safely.** The report is long, restates earlier years (`g25-restatement`) and disagrees with itself in places (see `/sources` and `docs/data-sources.md`). A wrong figure in a partner post is a brand risk for both sides.
- **Cognizant's own territory is in the data.** Make A Mark Day students were unclear about AI skills at the start of the day (`c25-ai-skills-gap`), and Cognizant is the team's Global AI Services Partner (`g-cognizant-role`).

## Scorecard

Each criterion is scored 1 to 5. The table shows what in the product earns the score.

| Feature                                                             | Innovation                                                              | Desirability                                                                                   | Business opportunity                                  | Viability                                                    | Ease of implementation                                 |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| **The story at `/`** following the team's own footprint map         | A car-led visual feature built from an ESG report, not a dashboard      | Opens on a phone with no sign-in; one idea per screen; depth toggle for new and long-time fans | A reusable format each race and each season           | Uses only published facts; refreshes when the team publishes | Static pages over a JSON fact base                     |
| **Tap any figure to its page** (status badge and provenance drawer) | Every number carries Verified or Estimated and opens its quote and page | Answers "is this real?" in one tap                                                             | The trust layer is what a partner or client pays for  | The source audit (`npm run verify:data`) runs on every check | One shared component used everywhere                   |
| **Singapore race weekend** (programmes, getting there, data gaps)   | Shows what is not published as a gap rather than a guess                | Something to do at the next race: STEM Racing, Unearth Your Greatness, a travel tip            | Per-race moments for partners and charities           | Real programmes only; per-race estimates kept in the detail  | Reuses the story components                            |
| **Share card and quiz badge**                                       | A sourced card with the status mark kept on                             | Something worth posting                                                                        | Fans become a distribution channel for approved facts | Client-side export; no image service                         | One PNG export                                         |
| **Impact desk: This race week**                                     | A weekly brief assembled from the fact base                             | Serves the job a comms lead actually has on a Monday                                           | The basis of a sponsorship benefit for other partners | Same facts, filtered by race and partner tag                 | Filters over existing data                             |
| **Narratives with citation chips and approvals**                    | Grounded drafting where every figure is cited and checked               | A sourced first draft, a named approver, a timestamp                                           | Measurable time saved from brief to approved post     | Model-agnostic; templates when the model fails or is offline | Existing AI engine plus a stored approval state        |
| **Check my draft**                                                  | The guardrail turned round to check human copy                          | Catches the typo before it is published                                                        | The pattern Cognizant can package for clients         | Deterministic number matching; no model needed               | Reuses the guardrail's number matching, `lib/data/numbers.ts` |
| **Scenarios for joint programmes**                                  | What-ifs only from verified baselines, assumptions shown                | Helps partners discuss what to fund next                                                       | Supports the case for expanded joint programmes       | No invented costs or elasticities                            | Pure function                                          |
| **Story kit for charities**                                         | Co-branded copy from the same facts                                     | Charity partners get funder-ready paragraphs                                                   | Value for the charities in Make A Mark                | Same check and approval path                                 | Thin layer on the narrative engine                     |
| **Data quality and export**                                         | The report's own inconsistencies shown, not hidden                      | Partners see what not to quote                                                                 | Feeds partners' own BI tools                          | CSV and JSON from `/api/partner/metrics`                     | Read-only endpoint                                     |
| **Runs offline**                                                    | Governed AI that still works with no network                            | Reliable at a live pitch or a trackside stand                                                  | Demonstrable to partners anywhere                     | No runtime network dependency                                | Cached AI text and templates                           |

## Non-sales ROI measures

None of these are measured yet. The prototype records no analytics. The pilot would add consented, aggregate instrumentation and set targets with the team after a baseline period.

| Return                        | Measure                                                                           | Instrumentation (pilot)                                                    | Baseline or comparison                                                 |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Partner amplification         | Impressions from partner posts that used Off Camera content, across all partners  | UTM-tagged links and partner-reported impressions per post                 | `c24-esg-impressions-partners`                                         |
| Comms efficiency              | Time from brief to approved post                                                  | Timestamps on draft created, checked and approved in the desk              | A baseline week of manual timings in Q4 2026                           |
| Accuracy and trust            | First-pass guardrail rate; corrections needed after publication                   | Guardrail results logged per draft; a corrections log kept by the approver | None published; both logged from the first pilot race                  |
| Fan engagement                | Story completion; chapters opened; return at the next race                        | Scroll-chapter and "The detail" open events; anonymous next-race return    | Set in the first two pilot races                                       |
| Reach via sharing             | Cards created and shared; impressions of shared cards                             | Export and Web Share events; UTM on the card link                          | `c24-esg-posts-multiplier` as the team's own benchmark for ESG content |
| Awareness of Cognizant's role | Consented recall of Cognizant's role after the story or at a race-week activation | A short opt-in question, asked once                                        | None published; measured from the first pilot race                     |
| Brand perception              | Sentiment on posts using Off Camera content                                       | Social listening, as the team already does                                 | `b25-accelerate-sentiment` as a comparable figure the team reports     |

**Assumption:** targets for each measure are agreed with the team and Cognizant after the baseline, not before.

## Business model

No revenue figures are claimed. Any ranges in the pilot are assumptions to be tested.

| Year                | Who pays                                                                                   | What they get                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Year 1 (2027 pilot) | Cognizant, as value-in-kind within the Global AI Services partnership (`g-cognizant-role`) | Cognizant gains a client-referenceable, governed Gen-AI case. The team gains the comms tool and the fan story.                   |
| Year 2              | The team offers an impact reporting pack as a sponsorship benefit to other partners        | Each partner gets its own race-week desk, checked drafts and exports for the programmes it funds.                                |
| Year 3              | Cognizant packages the pattern for its clients                                             | The same pattern (fact base, then guardrail, then cited output) applied to clients' ESG, investor and regulatory communications. |

## The 2027 pilot

**Scope.** One fan story and the Impact desk.

**Users.** Three groups: the team's communications and sustainability staff; Cognizant's communications staff; two or three charity partners from Make A Mark.

**Races.** About six, including at least one fly-away race, so the desk is tested where trackside data is not published. **Assumption.**

**Team (assumption).**

| Role             | Commitment                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| Product lead     | Full time                                                                |
| Engineers        | Two, full time                                                           |
| ESG data analyst | Full time; owns the fact base and quality flags                          |
| Designer         | Part time                                                                |
| Approvers        | Named individuals at the team and at Cognizant, with a stated turnaround |

### Phases

| When                 | What                                                                                                           | Done when                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Q4 2026              | Data-sharing agreement; approval workflow agreed; a baseline week of manual timings for brief to approved post | Signed agreement, named approvers, baseline recorded                |
| Pre-season to race 6 | Launch with published facts only: the story, race pages, the desk with approvals                                 | Six races run; measures collected; corrections log reviewed         |
| Mid-season           | Add one approved per-race feed, trackside energy or freight, with a named data owner                           | The feed refreshes to its agreed cadence and passes the same checks |
| Season end           | Evaluate against the baseline; decide whether to offer the sponsor tier in year 2                              | A written evaluation shared with the team and Cognizant             |

### Data cadence in the pilot

"Real-time" is reserved for what really is. The product labels everything else "Updated when the team publishes".

| Data                       | Cadence (assumption, subject to the data owner) |
| -------------------------- | ----------------------------------------------- |
| Fan quick checks and cards | As they happen                                  |
| Trackside energy by source | One to two weeks after each race                |
| Freight by mode            | Monthly                                         |
| Charity totals             | Per event, once the charity confirms            |
| Assured footprint          | Annually, with the report                       |

## Risks and mitigations

| Risk                                                                                                  | Mitigation                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data access.** Per-race feeds may not exist in usable form, or may not be approved for publication. | Pilot starts on published facts only. One feed is added mid-season, with a named owner, only after the data-sharing agreement. Gaps stay shown as gaps.                                             |
| **Approvals become the bottleneck.**                                                                  | Named approvers with an agreed turnaround; the desk records the time at each step so delays are visible; Check my draft reduces what an approver has to verify by hand.                             |
| **Brand.** Copy that reads as greenwashing or guilt, or misstates removals.                           | The stakeholder guardrails in `docs/PRODUCT_RATIONALE.md` are written into templates and prompts; removals are never "carbon negative" or "neutral"; every external post has a human approver.      |
| **Rights for imagery.** The car images are the team's, kept locally for this collaboration.           | Source and intended use recorded in `public/brand/README.md`; media approval confirmed before any public deployment beyond the pilot; no third-party imagery.                                       |
| **Model cost and availability.**                                                                      | Short, grounded outputs; responses cached per request; deterministic templates when the model is unavailable, so the product still works. Actual cost is measured in the pilot, not estimated here. |
| **AI accuracy.**                                                                                      | The model sees only the supplied facts; the guardrail rejects any unmatched or uncited number; one retry, then a template; the drafter is labelled.                                                 |
| **Privacy.**                                                                                          | Belong data only as published aggregates; fan choices stay on the device unless the fan consents to measurement.                                                                                    |
