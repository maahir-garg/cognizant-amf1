# Business Value & Non-Sales ROI Framework: Impact Lap

**Challenge Context:** Transforming Aston Martin Aramco's sustainability, inclusion, and community data into a trusted, real-time view of impact for F1 audiences and enterprise partners.

---

## 1. Ideathon Judging Scorecard Mapping (1–5 Criteria)

| Scorecard Criterion (Slide 10 & Brief Rubric) | How Impact Lap Excels | Core Feature Proof Points |
|---|---|---|
| **1. Innovation & Technological Sophistication (5/5)** | Moves far beyond passive ESG charts by introducing an active **AI Trust Layer** with automated numeric guardrails, real-time relatable carbon conversions, and interactive telemetry story journeys. | • Zero-hallucination regex validator (`lib/ai/guardrail.ts`)<br>• Relatable carbon equivalents engine (`lib/data/equivalents.ts`)<br>• What-If predictive scenario modeller (`/partners/scenarios`) |
| **2. Desirability & Fan Experience (5/5)** | Solves real pain points for both target audiences: fans receive bite-sized gamified content with 9:16 social share cards; sponsor comms teams get 1-click grounded narratives and provenance audit drawers. | • 30-second personalized onboarding (`/onboarding`)<br>• Pop-up telemetry quiz beats with instant reveals (`/journey`)<br>• 9:16 story pass with PNG download (`/share`)<br>• Co-branded LinkedIn/Brief generator (`/partners`) |
| **3. Business Opportunity & Business Alignment (5/5)** | Sports sponsorships face intense scrutiny to prove ESG alignment to institutional investors. This creates a high-margin enterprise product that Cognizant can white-label across Formula One, sports leagues, and global clients. | • Read-only REST BI API (`/api/partner/metrics`)<br>• Instant CSV provenance export<br>• Expansion potential across all 10 F1 teams and global motorsport |
| **4. Viability & ESG Impact (5/5)** | Built on proven web standards (Next.js, TypeScript strict, Tailwind) and official audited data (Make A Mark 2025 report). Designed to operate 100% offline via `DEMO_MODE=true` for rock-solid presentation reliability. | • Deterministic cache fixtures in `data/ai-cache/`<br>• Verified page numbers from official ESG report<br>• Zero external database dependency |
| **5. Ease of Implementation & Feasibility (5/5)** | Low technical complexity and minimal operational overhead. Can be deployed to production in phases using existing partner data pipelines and low-cost serverless edge computing. | • Modular App Router structure<br>• 3-phase production blueprint in `docs/architecture.md`<br>• Zero cloud lock-in |

---

## 2. Comprehensive Non-Sales ROI Measurement Framework

In modern sports marketing, ROI extends far beyond direct ticket or merchandise transactions. The table below outlines how **Impact Lap** delivers and quantifies non-sales value across key dimensions:

| Value Dimension | Strategic Objective | Operational Metric & Target | Measurement Methodology |
|---|---|---|---|
| **A. Fan Engagement** | Turn casual race spectators into active, educated participants in AMF1's net-zero mission. | • **Quiz Completion Rate**: >75% of onboarded fans complete all 3 sectors.<br>• **Time in Experience**: >3.5 minutes average engagement per session. | Track sector transitions, quiz interaction callbacks, and session dwell time in analytics. |
| **B. Sustainability Awareness** | Demystify complex carbon and logistics data into tangible human terms. | • **Equivalents Toggle Rate**: >60% of visitors toggle from raw tCO₂e to relatable units (trees, homes, flights).<br>• **Recall Improvement**: >40% increase in fan awareness of SAF and campus renewable targets. | Pre- and post-journey interactive quiz checkpoints and toggle event listeners. |
| **C. Viral Amplification** | Empower fans to advocate for sustainable racing across social media channels. | • **Share Card Generation Rate**: >25% of fans download or share their 9:16 portrait pass.<br>• **Social Reach**: Viral impressions across Instagram Stories, TikTok, and X. | Track `html-to-image` download events and UTM tracking tags on shared links. |
| **D. Partner Alignment (Cognizant)** | Provide Cognizant with verifiable evidence of technology leadership and joint ESG progress. | • **Content Reuse Rate**: Cognizant marketing reuses >10 auto-drafted impact narratives quarterly.<br>• **BI Dashboard Ingestion**: Monthly active API syncs via `/api/partner/metrics`. | API endpoint request telemetry and corporate comms publication tracking. |
| **E. Community Empowerment** | Amplify Make A Mark charity partners and inspire next-generation STEM talent. | • **Volunteering Click-Through**: >15% of fans explore Singapore GP volunteering.<br>• **Charity Partner Story Kit Adoption**: 100% of featured NGOs utilize auto-drafted story kits. | Action hub click telemetry and NGO stakeholder feedback surveys. |
| **F. Brand Trust & Compliance** | Protect Aston Martin Aramco and Cognizant against accusations of greenwashing. | • **Zero Hallucination Incidents**: 100% verification pass rate through numeric guardrails.<br>• **Audit Trail Inspections**: User engagement with the Provenance Drawer. | Error logs on `/api/ai/generate` and drawer inspection event counts. |

---

## 3. Executive Summary for Judges

By combining high-performance Formula One telemetry aesthetics with strict scientific grounding and generative AI personalization, **Impact Lap** solves the single greatest dilemma in sports sustainability:

> **How to make ESG reporting tangible and engaging for fans while keeping it 100% rigorous and auditable for enterprise sponsors.**
