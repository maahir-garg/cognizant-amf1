# Data sources and extraction

All figures in Impact Lap come from the documents below. `data/sources.json` is the machine-readable registry.

| id | Document | Pages | How it's used |
|---|---|---|---|
| `esg-2025` | [Make A Mark ESG Report 2025](https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2025.pdf) | 92 | Primary source. Reporting period 1 Jan to 31 Dec 2025. |
| `esg-2024` | [Make A Mark ESG Report 2024](https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2024.pdf) | 95 | 2024 programmes, social reach, equivalences. GHG figures superseded by the 2025 restatement. |
| `manifesto-2025` | [Make A Mark Manifesto (Feb 2025 v3)](https://downloads.ctfassets.net/kcno0boecupz/7nioI6NO0hyNZYZqctUSKC/fb3ef90dcf52b0c8bab545157ada2a7e/MakeAMark_Manifesto_Update_Feb_25_v3.pdf) | 24 | 2022–2023 programmes, early STEM reach including Singapore. |
| `mam-web` | [Make A Mark web page](https://www.astonmartinf1.com/en-GB/make-a-mark) (snapshot `sources/make-a-mark.html`) | 1 | Current pillar definitions, CDP percentile, Cognizant's partner title. |
| `defra-2025` | [UK GHG conversion factors 2025](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025) (extract `sources/external/defra-2025-selected-factors.csv`) | – | Per-passenger transport factors, keyed by the dataset's row ID. |
| `epa-equivalencies` | [US EPA GHG Equivalencies: calculations and references](https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references) (notes `sources/external/epa-ghg-equivalencies-2026-08-04.txt`) | – | Car-year, tree-year, phone-charge, home-electricity equivalents. |
| `f1-calendar-2025` / `f1-calendar-2026` | [formula1.com schedules](https://www.formula1.com/en/racing/2026) (notes in `sources/external/`) | – | Round count for per-weekend estimates; Singapore 2026 dates and round. |

## Getting the PDFs

The PDFs are gitignored (38 MB). To rebuild the text layer:

```bash
curl -L -o sources/MakeAMark_ESG_Report_2025.pdf https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2025.pdf
curl -L -o sources/MakeAMark_ESG_Report_2024.pdf https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2024.pdf
curl -L -o sources/MakeAMark_Manifesto_Update_Feb_25_v3.pdf "https://downloads.ctfassets.net/kcno0boecupz/7nioI6NO0hyNZYZqctUSKC/fb3ef90dcf52b0c8bab545157ada2a7e/MakeAMark_Manifesto_Update_Feb_25_v3.pdf"
brew install poppler   # provides pdftotext
npm run extract:sources
```

## Extraction method

1. `scripts/extract-sources.ts` runs `pdftotext -enc UTF-8` (raw reading order) and stores one string per page in `sources/text/<id>.json`. For all three AMF1 PDFs the page index equals the printed page number.
2. Facts were extracted by reading each report cover to cover and recording, for every usable figure: pillar, metric, value, unit, period, page and a verbatim quote. Ambiguous layouts (tables, infographics) were checked against rendered page images.
3. `npm run verify:data` (also run in CI and the unit tests) normalises typography (ligatures, ™, curly quotes, subscripts), then checks that each quote fragment is on the cited page and that the fact's value appears inside the quote. Estimated facts are recomputed from their inputs.
4. Conversion factors are either derived from report figures (and recomputed by the verifier) or quoted from EPA/DEFRA with the row or section reference.

## Status definitions

- **Verified**: printed in a source above, page-referenced, quote auto-checked.
- **Estimated**: calculated from verified facts; formula, inputs and assumptions shown in the provenance drawer.
- **Simulated**: demo data (live-feed events, counters, illustrative Singapore activations). Always labelled.

## Known data-quality issues in the sources

Run the app and open **Sources → flagged only**, or search `"flags"` in `data/facts.json`. Summary:

- 2023 Scope 3 appears as 95,933.5587 (p20 table), 95,924 (p20 chart) and 95,323.76 (p83 appendix); 2024 Scope 3 is printed as 563.08 on p20.
- The "SBTi-aligned" label is applied to 87,162.40 tCO₂e (appendix) and to 85,974 tCO₂e (footnote 8).
- Aleto cohort: 14 (p42) vs 15 (p10 and website). Aramco interns: 9 (p11) vs 8 (p67).
- 71% is given both as "rated sessions highly valuable" (p10) and "highly likely to continue the relationship" (p45).
- Silverstone-lap equivalences differ by ~14× between the 2024 and 2025 reports.
- 2023 and 2024 GHG figures were restated in 2025; earlier reported totals are not comparable.

## Gaps (not published, so not shown as numbers)

- Per-race emissions and freight (estimated by even split instead).
- Trackside energy for fly-away rounds, including Singapore.
- Programme outcomes for most community initiatives beyond headcounts.
- SAF cost, so the scenario model shows carbon only.
