# Off Camera: impact measures and the 2027 pilot

The organisers asked for value broader than sales: fan engagement, awareness, partner relationships and brand perception, and value for partners such as Cognizant and the charities in Make A Mark. This document sets out how each kind of impact would be measured and describes the pilot that would test it. Costing and the business model are presented in the pitch, not in the product or this document.

Figures are referred to by their id in `data/facts.json`. Anything that is a plan or a judgement rather than a published figure is marked **Assumption**.

## Why the problem is worth solving

- **ESG content already performs.** ESG posts drew three times the impressions of a typical race weekend (`c24-esg-posts-multiplier`) and 144.8m impressions in total (`c24-esg-impressions`).
- **Partners already amplify it, by hand.** Partners sharing team-led initiatives, Cognizant among them, generated a further 97m impressions (`c24-esg-impressions-partners`). Each did its own reading, drafting and checking.
- **The source is hard to retell safely.** The report is long, restates earlier years (`g25-restatement`) and disagrees with itself in places (see `/sources` and `docs/data-sources.md`). A wrong figure in a partner post is a brand risk for both sides.
- **Cognizant's own territory is in the data.** Make A Mark Day students were unclear about AI skills at the start of the day (`c25-ai-skills-gap`), and Cognizant is the team's Global AI Services Partner (`g-cognizant-role`).

## Impact measures

None of these are measured yet. The prototype records no analytics. The pilot would add consented, aggregate instrumentation and set targets with the team after a baseline period. The desk's Measures tab (`/partners/measures`, from `lib/partner/measures.ts`) shows the published baselines beside these measures, each marked "Not measured yet".

| Outcome                       | Measure                                                                           | Instrumentation (pilot)                                                    | Baseline or comparison                                                 |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Partner amplification         | Impressions from partner posts that used Off Camera content, across all partners  | UTM-tagged links and partner-reported impressions per post                 | `c24-esg-impressions-partners`                                         |
| Comms efficiency              | Time from brief to approved post                                                  | Timestamps on draft created, checked and approved in the desk              | A baseline week of manual timings in Q4 2026                           |
| Accuracy and trust            | First-pass guardrail rate; corrections needed after publication                   | Guardrail results logged per draft; a corrections log kept by the approver | None published; both logged from the first pilot race                  |
| Fan engagement                | Story completion; chapters opened; return at the next race                        | Scroll-chapter and "The detail" open events; anonymous next-race return    | Set in the first two pilot races                                       |
| Reach via sharing             | Cards created and shared; impressions of shared cards                             | Export and Web Share events; UTM on the card link                          | `c24-esg-posts-multiplier` as the team's own benchmark for ESG content |
| Awareness of Cognizant's role | Consented recall of Cognizant's role after the story or at a race-week activation | A short opt-in question, asked once                                        | None published; measured from the first pilot race                     |
| Brand perception              | Sentiment on posts using Off Camera content                                       | Social listening, as the team already does                                 | `b25-accelerate-sentiment` as a comparable figure the team reports     |

**Assumption:** targets for each measure are agreed with the team and Cognizant after the baseline, not before.

## The 2027 pilot

**Scope.** One fan story and the Impact desk.

**Users.** Three groups: the team's communications and sustainability staff; Cognizant's communications staff; two or three charity partners from Make A Mark.

**Races.** About six, including at least one fly-away race, so the desk is tested where trackside data is not published. **Assumption.**

**Approvals (assumption).** Named individuals at the team and at Cognizant sign off every external post, with a stated turnaround. An ESG data owner keeps the fact base and its quality flags.

### Phases

| When                 | What                                                                                                           | Done when                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Q4 2026              | Data-sharing agreement; approval workflow agreed; a baseline week of manual timings for brief to approved post | Signed agreement, named approvers, baseline recorded                |
| Pre-season to race 6 | Launch with published facts only: the story, race pages, the desk with approvals                               | Six races run; measures collected; corrections log reviewed         |
| Mid-season           | Add one approved per-race feed, trackside energy or freight, with a named data owner                           | The feed refreshes to its agreed cadence and passes the same checks |
| Season end           | Evaluate against the baseline; decide whether to continue                                                      | A written evaluation shared with the team and Cognizant             |

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

| Risk                                                                                                  | Mitigation                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data access.** Per-race feeds may not exist in usable form, or may not be approved for publication. | Pilot starts on published facts only. One feed is added mid-season, with a named owner, only after the data-sharing agreement. Gaps stay shown as gaps.                                        |
| **Approvals become the bottleneck.**                                                                  | Named approvers with an agreed turnaround; the desk records the time at each step so delays are visible; Check my draft reduces what an approver has to verify by hand.                        |
| **Brand.** Copy that reads as greenwashing or guilt, or misstates removals.                           | The stakeholder guardrails in `docs/PRODUCT_RATIONALE.md` are written into templates and prompts; removals are never "carbon negative" or "neutral"; every external post has a human approver. |
| **Rights for imagery.** The car images are the team's, kept locally for this collaboration.           | Source and intended use recorded in `public/brand/README.md`; media approval confirmed before any public deployment beyond the pilot; no third-party imagery.                                  |
| **Model availability.**                                                                               | Short, grounded outputs; responses cached per request; deterministic templates when the model is unavailable, so the product still works.                                                      |
| **AI accuracy.**                                                                                      | The model sees only the supplied facts; the guardrail rejects any unmatched or uncited number; one retry, then a template; the drafter is labelled.                                            |
| **Privacy.**                                                                                          | Belong data only as published aggregates; fan choices stay on the device unless the fan consents to measurement.                                                                               |
