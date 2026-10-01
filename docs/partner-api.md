# Partner metrics API

`GET /api/partner/metrics` is a read-only, unauthenticated export of Off Camera's fact base, meant for a partner's own
BI tools (Power BI, Tableau, a spreadsheet, a script). It requires no network beyond the running app: there is no
external call, no API key and no rate limit in this prototype. CORS is open (`Access-Control-Allow-Origin: *`).

Every field traces back to `data/facts.json` through `lib/partner/metrics.ts`; nothing here is invented or generated
by the AI layer.

## Endpoint

```
GET /api/partner/metrics
GET /api/partner/metrics?format=csv
```

## Query parameters

| Param    | Type                                               | Effect                                                                                                |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pillar` | `environment \| belong \| community \| governance` | Only facts in that pillar.                                                                            |
| `status` | `verified \| estimated`                            | Only facts with that trust status.                                                                    |
| `tag`    | string                                             | Only facts carrying that tag, e.g. `partner:cognizant`.                                               |
| `ids`    | comma-separated ids                                | Only the named facts, e.g. `e25-saf-avoided,e25-removals`.                                            |
| `format` | `json` (default) \| `csv`                          | `csv` returns `text/csv` with a `Content-Disposition: attachment` header; anything else returns JSON. |

Filters combine with AND. Omit all of them to get the full fact base.

## JSON response

Real output of `GET /api/partner/metrics?ids=e25-saf-avoided` (only `generatedAt` changes between calls):

```json
{
  "generatedAt": "2026-09-30T18:38:25.485Z",
  "partner": "cognizant",
  "count": 1,
  "metrics": [
    {
      "id": "e25-saf-avoided",
      "pillar": "environment",
      "topic": "freight",
      "metric": "Air-freight emissions avoided through the team's first Sustainable Aviation Fuel investment",
      "value": 1188,
      "valueText": null,
      "unit": "tCO2e",
      "period": "2025",
      "qualifier": "exact",
      "status": "verified",
      "source": {
        "id": "esg-2025",
        "title": "Make A Mark ESG Report 2025",
        "publisher": "Aston Martin Aramco Formula One Team",
        "page": 24,
        "url": "https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2025.pdf"
      },
      "quote": "avoiding 1,188 tCO₂e of air freight emissions",
      "derivation": null,
      "flags": []
    }
  ]
}
```

### Field reference

| Field                 | Meaning                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| `id`                  | Stable fact id (also the id shown in the provenance drawer).                           |
| `pillar`              | `environment \| belong \| community \| governance`.                                    |
| `topic`               | Short grouping key within the pillar, e.g. `freight`, `mentoring`.                     |
| `metric`              | Plain-language label.                                                                  |
| `value` / `valueText` | Numeric value, or the qualitative value (e.g. a CDP grade) when `value` is `null`.     |
| `unit`                | Canonical unit (`tCO2e`, `%`, `students`, `GBP`, …).                                   |
| `period`              | Reporting period as printed by the source, e.g. `"2025"`.                              |
| `qualifier`           | `exact \| at-least \| approximately \| target`.                                        |
| `status`              | `verified \| estimated`, see the app's status legend.                                  |
| `source`              | `null` for facts without a source (rare); otherwise id, title, publisher, page, url.   |
| `quote`               | Verbatim excerpt from the source page, when the fact is verified.                      |
| `derivation`          | `null`, or `{ formula, expression, assumptions }` for estimated facts.                 |
| `flags`               | Data-quality flag kinds on this fact (`source-conflict`, `restated`, …), `[]` if none. |

## CSV response

Same rows, flattened: `id,pillar,topic,metric,value,valueText,unit,period,qualifier,status,sourceId,sourceTitle,publisher,page,url,quote,derivationFormula,flags`.
Fields containing a comma, quote or newline are quoted per RFC 4180. The same request as CSV:

```
id,pillar,topic,metric,value,valueText,unit,period,qualifier,status,sourceId,sourceTitle,publisher,page,url,quote,derivationFormula,flags
e25-saf-avoided,environment,freight,Air-freight emissions avoided through the team's first Sustainable Aviation Fuel investment,1188,,tCO2e,2025,exact,verified,esg-2025,Make A Mark ESG Report 2025,Aston Martin Aramco Formula One Team,24,https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2025.pdf,"avoiding 1,188 tCO₂e of air freight emissions",,
```

## curl examples

```bash
# Everything
curl -s http://localhost:3000/api/partner/metrics | jq

# Only verified environment facts
curl -s "http://localhost:3000/api/partner/metrics?pillar=environment&status=verified" | jq

# Facts that describe joint Cognizant activity
curl -s "http://localhost:3000/api/partner/metrics?tag=partner:cognizant" | jq '.metrics[].metric'

# A named set of facts, as CSV, saved to a file
curl -s "http://localhost:3000/api/partner/metrics?ids=e25-saf-avoided,e25-removals&format=csv" -o metrics.csv
```

## Notes for BI tools

- The response has no pagination; the fact base is small enough (about 180 rows) to return in one call.
- `generatedAt` is the export time, not a data timestamp. Every fact carries its own `period` (and an `extractedAt`
  date in `data/facts.json`, not included here), so joins should key on `id`.
- The product ships no simulated data, so every row is `verified` or `estimated`. Filter with `?status=verified` if your
  tool should ingest only figures printed in a team report.
- Rows with a `source-conflict` flag are figures the reports print inconsistently. Check the desk's Data quality page
  before quoting them.
