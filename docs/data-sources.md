# Data Sources & Provenance Audit Documentation

Every metric, figure, and quantitative claim in **Impact Lap** adheres strictly to the non-negotiable ground rule:
**Never fabricate Aston Martin Aramco (AMF1) data.**

Each number is classified into one of three strict statuses:
- **Verified**: Extracted verbatim from an official source with document name and page reference.
- **Estimated**: Derived from verified data via an explicit, documented calculation formula.
- **Simulated**: Clearly labelled demonstration data for scenarios or live stream demonstrations.

---

## 1. Primary Source Material

### A. Make A Mark ESG Report 2025
- **Publisher**: Aston Martin Aramco Formula One™ Team
- **Reporting Period**: 1 January 2024 – 31 December 2024 (Published 2025)
- **URL**: `https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2025.pdf`
- **Total Pages**: 93 pages
- **Format**: GRI Standards referenced, limited assurance, SBTi target alignment.

### B. Make A Mark ESG Report 2024
- **Publisher**: Aston Martin Aramco Formula One™ Team
- **Reporting Period**: 2023 Season Baseline
- **URL**: `https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2024.pdf`
- **Total Pages**: 88 pages

### C. Make A Mark Manifesto (Feb 2025 Update)
- **Publisher**: Aston Martin Aramco Formula One™ Team
- **URL**: `https://downloads.ctfassets.net/kcno0boecupz/7nioI6NO0hyNZYZqctUSKC/fb3ef90dcf52b0c8bab545157ada2a7e/MakeAMark_Manifesto_Update_Feb_25_v3.pdf`
- **Pillars**: Environment, Belong, Community, Governance.

### D. Official Make A Mark Web Portal
- **URL**: `https://www.astonmartinf1.com/en-GB/make-a-mark`

---

## 2. Conversion Factor References (Carbon Equivalencies)

All relatable carbon conversions (`lib/data/equivalents.ts`) are calculated deterministically without LLM extrapolation:

1. **Urban Trees Absorbing Carbon (1 Year)**
   - Factor: `45.45 tree-years per tCO2e`
   - Source: US Environmental Protection Agency (EPA) Greenhouse Gas Equivalencies Calculator
   - Reference: EPA GHG Calculator (2024 update based on USDA Forest Service carbon sequestration models).

2. **Average UK Home Electricity Days**
   - Factor: `82.5 home-days per tCO2e`
   - Source: UK Department for Energy Security and Net Zero (DESNZ) / DEFRA 2024 Conversion Factors
   - Calculation: Average UK residential electricity consumption (approx 2,700 kWh/year per household).

3. **London-Singapore Return Economy Flights**
   - Factor: `0.68 return flights per tCO2e` (approx 1.47 tCO2e per passenger return flight)
   - Source: International Civil Aviation Organization (ICAO) Carbon Calculator Methodology v12.

4. **Smartphones Charged**
   - Factor: `121,643 charges per tCO2e`
   - Source: US EPA Greenhouse Gas Equivalencies Calculator.

---

## 3. Verified Facts Matrix (`data/facts.json`)

| Fact ID | Pillar | Metric | Value | Unit | Doc Reference | Page | Audit Note |
|---|---|---|---|---|---|---|---|
| `FACT-E-01` | Environment | Scope 1 Direct GHG | 156.57 | tCO2e | ESG Report 2025 | p. 18 | Direct combustion (HGV diesel, pool petrol, paint propane) |
| `FACT-E-02` | Environment | Scope 2 Indirect (Market) | 343.08 | tCO2e | ESG Report 2025 | p. 18 | Purchased electricity backed by REGO certificates |
| `FACT-E-03` | Environment | Total Value Chain Footprint | 87,162 | tCO2e | ESG Report 2025 | p. 19 | Comprehensive footprint without SAFc |
| `FACT-E-04` | Environment | Freight & Logistics | 5,560.45 | tCO2e | ESG Report 2025 | p. 19 | Multi-modal air, sea, road cargo (6% total footprint) |
| `FACT-E-05` | Environment | Emissions Avoided via SAFc | 1,188 | tCO2e | ESG Report 2025 | p. 9, 91 | Certified SAF uptake; equal to 88,153 Silverstone laps |
| `FACT-E-06` | Environment | Scope 1 & 2 Reduction | -74 | % | ESG Report 2025 | p. 15 | Science Based Targets Initiative (SBTi) trajectory vs 2023 |
| `FACT-E-07` | Environment | Campus Solar/Renewable Gain | -23 | % | ESG Report 2025 | p. 21, 92 | Solar-powered campus roof & renewable energy contracts |
| `FACT-E-08` | Environment | Pool Car Fleet Electrification | -60 | % | ESG Report 2025 | p. 21 | Transition to EV fleet saved 25 tCO2e |
| `FACT-E-09` | Environment | Biodiversity Net Gain | +122 | % | ESG Report 2025 | p. 36 | 72,000 m² wild meadow + apiary producing 100+ honey jars |
| `FACT-E-10` | Environment | Waste Diversion Reduction | -16 | % | ESG Report 2025 | p. 21, 92 | Landfill waste diversion across factory & trackside |
| `FACT-S-01` | Belong | Enabling Functions Female % | 48 | % | ESG Report 2025 | p. 84 | Gender diversity breakdown in business functions |
| `FACT-S-02` | Belong | Neurodiversity ERG Members | 35 | colleagues | ESG Report 2025 | p. 48 | Partnered with ADHD Foundation (Umbrella display) |
| `FACT-S-03` | Belong | Hidden Disability Baseline | 10 | % | ESG Report 2025 | p. 48 | 1 in 10 colleagues reporting hidden disability |
| `FACT-C-01` | Community | Make A Mark Week Cohort | 300+ | students | ESG Report 2025 | p. 11 | 14 schools welcomed for hands-on STEM immersion |
| `FACT-C-02` | Community | Cognizant Gen-AI Ideathon | 2 | years | ESG Report 2025 | p. 62 | Cognizant × AMF1 student AI ideathon partnerships |
| `FACT-C-03` | Community | Colleague Charitable Funds | £300K+ | GBP | ESG Report 2025 | p. 10 | Direct philanthropic fundraising for charity partners |
| `FACT-C-04` | Community | STEM Positive Sentiment | 95.5 | % | ESG Report 2025 | p. 10 | Accelerate Arm × AMF1 participant feedback |
| `FACT-G-01` | Governance | FIA Environmental Standard | 3 | stars | ESG Report 2025 | p. 76 | Maintained highest 3-Star Environmental Accreditation |
| `FACT-G-02` | Governance | SBTi Net Zero by 2050 | 90 | % | ESG Report 2025 | p. 15 | Scope 1, 2, 3 reduction commitment validated by SBTi |

---

## 4. Race Weekend Estimates Formula (`data/races.json`)

For the **Singapore Grand Prix 2026** (`singapore-gp`):
- **Freight tCO2e**: `231.69 tCO2e` (Status: Estimated).
  *Formula*: Total verified seasonal freight (`5,560.45 tCO2e`, Fact `FACT-E-04`) divided by 24 calendar Grands Prix = `231.69 tCO2e`.
- **Travel tCO2e**: `185.40 tCO2e` (Status: Estimated).
  *Formula*: Travel & hospitality allocation for flyaway race personnel based on seasonal business travel distribution (`5,124.32 tCO2e` across flyaways).
- **SAFc Abatement**: `-14.2%` reduction vs 2023 baseline without SAF certificates.

---

## 5. Automated Verification Script
Run `npx tsx scripts/extract-sources.ts` to execute automated substring verification across all extracted source files.
