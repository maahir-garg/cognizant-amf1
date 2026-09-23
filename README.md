# Impact Lap: AMF1 × Cognizant Sustainability Impact Platform

> Transforming Aston Martin Aramco's sustainability, inclusion, and community data into a trusted, real-time view of impact for Formula One fans and enterprise partners.

**Concept prototype:** Team Growthbeans, AMF1 × Cognizant Ideathon 2026 (Singapore Grand Prix Weekend)

---

## Highlights

- **The AI Trust Layer**: Grounded generative AI engine with a post-generation regex numeric guardrail. Every figure is audited against official disclosures before rendering—guaranteeing zero hallucinations.
- **Audience A: The Interactive Fan Lap**: 30-second personalized onboarding (New, Casual, Die-hard), step-by-step lap journey through Environment, Belong, and Community pillars with interactive quiz beats, Singapore GP carbon equivalents, and downloadable 9:16 portrait story passes.
- **Audience B: Partner Impact Intelligence Cockpit**: Designed for Cognizant and sponsor comms, sustainability, and investor relations teams. Features provenance audit drawers (document + page references), one-click grounded narrative generator (LinkedIn, brief, investor slides), deterministic what-if scenario modeller, real-time milestone alert feed, and read-only JSON BI API.
- **100% Offline Resilience (`DEMO_MODE=true`)**: Runs completely offline without external API keys or cloud dependencies using deterministic response fixtures in `data/ai-cache/`.

---

## Verified Data Grounding

Every quantitative metric in this platform is explicitly categorized:
1. **Verified**: Extracted verbatim from official Aston Martin Aramco publications with document and page citations:
   - *Make A Mark ESG Report 2025* (93 pages)
   - *Make A Mark ESG Report 2024* (88 pages)
   - *Make A Mark Manifesto Update* (Feb 2025)
2. **Estimated**: Derived from verified data via explicit, documented mathematical formulas (e.g. Singapore GP logistics allocations).
3. **Simulated**: Clearly labeled demonstration data for scenario simulations and interactive gamified mechanics.

See [`docs/data-sources.md`](docs/data-sources.md) for the complete provenance audit matrix.

---

## Quick Start (No API Key Required)

```bash
# 1. Clone the repository and navigate to root
cd cognizant-amf1

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application runs immediately in offline demo mode.

---

## Verification & Testing Commands

```bash
# Audit all 15 extracted facts verbatim against source texts
npm run extract-sources

# Run unit tests for the post-generation numeric guardrail
npm run test:guardrail

# Pre-generate / refresh the offline AI cache fixtures
npm run warm-cache

# Run production build and linting verification
npm run lint && npm run build

# Run Playwright E2E smoke tests (Desktop 1080p & Mobile 390px)
npm run test:e2e
```

---

## Key Exploration Routes

### Audience A: Fan Experience
- **Home Portal**: [`/`](http://localhost:3000)
- **A1. Personalised Onboarding**: [`/onboarding`](http://localhost:3000/onboarding) — 30-second setup tailoring depth for New, Casual, or Die-hard fans.
- **A2. Interactive Story Lap**: [`/journey`](http://localhost:3000/journey) — 3-sector guided lap with pop-up quiz moments, reveal badges, and AI storytelling.
- **A3. Live Carbon & Logistics Tracker**: [`/tracker`](http://localhost:3000/tracker) — Singapore GP 2026 logistics emissions translated into human-scale equivalents (homes powered, flights avoided, trees planted).
- **A4. Community Relevance Match**: Located inside [`/tracker`](http://localhost:3000/tracker) — Pairs fan profile to local Singapore STEM Lab activations.
- **A5. 9:16 Social Story Pass**: [`/share`](http://localhost:3000/share) — High-res portrait card generator with direct PNG download.
- **A6. Action Hub & Impact Credits**: [`/actions`](http://localhost:3000/actions) — Low-carbon transit selector and race volunteering signup.

### Audience B: Cognizant & Partner Intelligence
- **B1. Partner Dashboard**: [`/partners`](http://localhost:3000/partners) — Auditable KPI tiles, Provenance Drawers, and one-click grounded narrative generator.
- **B1. What-If Scenario Modeller**: [`/partners/scenarios`](http://localhost:3000/partners/scenarios) — Interactive sliders for SAF and STEM expansion with deterministic math and AI copilot explanation.
- **B1. Milestone Alert Feed**: [`/partners/feed`](http://localhost:3000/partners/feed) — Real-time event triggers with suggested sponsor campaign posts.
- **B1. Read-Only JSON BI API**: [`/api/partner/metrics`](http://localhost:3000/api/partner/metrics) — Enterprise REST endpoint with CORS headers.
- **B2. Community Partner Story Kit**: [`/partners/story-kit`](http://localhost:3000/partners/story-kit) — Lightweight toolkit for charities and NGOs to generate verified impact stories.

---

## Documentation Index

- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md): 6-minute live pitch demo script with speaker cues and talking points.
- [`docs/architecture.md`](docs/architecture.md): Full Mermaid architecture diagram, component overview, and 3-phase production integration plan.
- [`docs/ROI.md`](docs/ROI.md): Business value framework mapped to the 5 ideathon scorecard criteria and non-sales ROI measures.
- [`docs/data-sources.md`](docs/data-sources.md): Comprehensive ESG metric extraction records and DEFRA/EPA conversion factor citations.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): Architectural decisions and design rationale log.

---

## License & Attribution

Concept prototype created for the **AMF1 × Cognizant Gen-AI Ideathon 2026**, Singapore.  
All quantitative sustainability metrics extracted from official publications of the **Aston Martin Aramco Formula One™ Team**.
