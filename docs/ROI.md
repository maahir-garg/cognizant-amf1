# Impact Lap: value and ROI

Return here is broader than sales, as the organisers asked: fan engagement, awareness of sustainability initiatives, partner relationships, brand perception and depth of stakeholder engagement. This document maps each feature to the judging scorecard and to how its value would be measured in a pilot. Figures quoted here are fact IDs from `data/facts.json`; nothing else is claimed as data.

## Why this problem is worth solving (from the team's own reports)

- ESG content already outperforms: ESG posts drew **3×** the impressions of a typical race weekend in 2024 (`c24-esg-posts-multiplier`) and **144.8m** impressions in total (`c24-esg-impressions`).
- Partners amplify it: sharing team-led ESG initiatives, partners (Cognizant among them) generated **97m+** additional impressions (`c24-esg-impressions-partners`). That amplification is currently manual.
- The reports are written for auditors, not fans: 92 pages, restated baselines, and internal inconsistencies our extraction surfaced (see `docs/data-sources.md`). Trust is a real risk, and a real opportunity.
- Young audiences want the skills story: **68%** of Make A Mark Day students were unclear about AI skills at the start of the day (`c25-ai-skills-gap`), which is exactly Cognizant's territory.

## Feature → scorecard map

| Feature | Innovation | Desirability | Business opportunity | Viability | Ease of implementation |
|---|---|---|---|---|---|
| **Trust layer**: verified / estimated / simulated on every number, provenance drawer, source audit in CI | Grounded, self-auditing ESG storytelling; surfaces the source's own inconsistencies | Answers "can I trust this?" for fans, partners and judges | Foundation for a licensable Impact API | Works with annual reports today, feeds tomorrow | Built on files and a script; no new infrastructure |
| **Numeric guardrail** on all AI text | Rejects any number not tied to a cited fact | Partners can post AI drafts without fact-checking by hand | Reduces comms review time | Model-agnostic; falls back to templates | Small, unit-tested module |
| **Fan lap** (personalised by level, city, interests; quiz beats) | ESG as a race lap with sectors and scrutineering | Written for fans, not auditors; 30-second onboarding | Engagement surface for sponsors' stories | Content refreshes as facts update | Web app; embeddable in the team app |
| **Weekend carbon view** in laps of Silverstone | Uses the team's own equivalence, shows gaps honestly | Makes tonnes tangible | Per-race sponsor moments | Upgrades from estimate to measured with a logistics feed | Deterministic engine |
| **Share card** (9:16) | Personal, sourced impact card | Social-native output | Organic reach for team and partners | No marginal cost | Client-side PNG |
| **Act**: lower-carbon travel, volunteering, credits | Turns awareness into action | Something to do, not just read | Partner-sponsored rewards | Credits are a simple ledger | Local state in prototype |
| **Partner dashboard**: KPIs with audit trail, CSV/JSON | Co-branded, sourced impact intelligence | Solves "prove the value of the sponsorship" | Premium partner analytics tier | Same fact base for every sponsor | Standard web + API |
| **Narratives**: LinkedIn post, quarterly brief, investor summary with citations | Grounded, cited drafting | Minutes instead of days to produce partner content | Content packages for sponsors | Audit log of every draft | Uses existing model APIs |
| **What-if scenarios** | Projections only from verified baselines, assumptions shown | Supports joint-programme decisions | Justifies expanded joint initiatives | No invented elasticities or costs | Pure function |
| **Milestone alerts from a live feed** | Real-time trigger → drafted post | Timely content during race weekends | Always-on activation | SSE with offline fallback | Replaceable by a real event stream |
| **Story Kit for charity partners** | Extends grounded storytelling beyond the team | Small charities get pro-quality impact copy | Goodwill and network effect | Same pipeline | Thin UI on shared engine |

## Non-sales ROI and how to measure it in a pilot

| ROI area | Metric | Instrumentation | Pilot target (to agree with AMF1) |
|---|---|---|---|
| Fan engagement | Lap completion rate; quiz beats answered per user; median time in lap | Page and step events | Baseline in race 1, improve race over race |
| Awareness | Correct answers on quiz beats (before/after reveal); recall of one initiative on return visit | Quiz events; return-visit prompt | Measured, not assumed |
| Sharing / reach | Share-card downloads and shares per active user; impressions of shared cards | Download and Web Share events, UTM links | Compare with ESG post benchmark (`c24-esg-posts-multiplier`) |
| Action | Low-carbon travel pledges; volunteering interest registrations | Act tab events | Report counts per race |
| Return visits | 7-day and next-race return rate | Anonymous device ID | Track across two races |
| Partner relationships | Partner content reuse: drafts exported, posts published, time from milestone to post | Narrative and alert events, partner survey | Minutes-to-post for Cognizant comms |
| Stakeholder trust | Provenance drawer opens per session; data-quality flags resolved by data owners | Drawer events; flag workflow | Flags trend to zero before publish |
| Brand perception | Sentiment on shared content | Social listening (as the team already reports sentiment, e.g. `b25-accelerate-sentiment`) | Maintain or improve |

## Business model options (qualitative)

- **Impact API and dashboard as a partner benefit**: a premium tier in sponsorship packages, giving each sponsor sourced, co-branded impact reporting.
- **Co-branded content packages**: race-weekend story packs (cards, posts, briefs) for sponsors and charity partners.
- **Platform play for Cognizant**: the same grounded-generation pattern (fact base → guardrail → cited output) applies to any client's ESG, investor or regulatory communications.

No revenue figures are claimed; the prototype is designed to measure the engagement metrics above before any commercial case is sized.
