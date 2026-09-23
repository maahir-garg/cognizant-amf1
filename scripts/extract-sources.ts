/**
 * Script to verify and document extraction of ESG metrics from Make A Mark reports.
 */
import fs from "fs";
import path from "path";

interface ExtractedFactCheck {
  id: string;
  sourceDoc: string;
  page: number;
  expectedTerm: string;
}

const auditList: ExtractedFactCheck[] = [
  { id: "FACT-E-01", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 18, expectedTerm: "SCOPE 1" },
  { id: "FACT-E-02", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 18, expectedTerm: "SCOPE 2" },
  { id: "FACT-E-03", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 19, expectedTerm: "87,162" },
  { id: "FACT-E-04", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 19, expectedTerm: "5,560.45" },
  { id: "FACT-E-05", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 9, expectedTerm: "1,188" },
  { id: "FACT-E-06", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 15, expectedTerm: "74%" },
  { id: "FACT-E-07", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 21, expectedTerm: "23%" },
  { id: "FACT-E-08", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 21, expectedTerm: "60%" },
  { id: "FACT-E-09", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 36, expectedTerm: "122%" },
  { id: "FACT-S-01", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 84, expectedTerm: "48%" },
  { id: "FACT-S-02", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 48, expectedTerm: "35" },
  { id: "FACT-C-01", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 11, expectedTerm: "300+" },
  { id: "FACT-C-02", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 62, expectedTerm: "Cognizant" },
  { id: "FACT-C-03", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 10, expectedTerm: "300K" },
  { id: "FACT-G-01", sourceDoc: "MakeAMark_ESG_Report_2025.txt", page: 15, expectedTerm: "SBTi" },
];

export function runSourceAudit() {
  const sourcesDir = path.join(process.cwd(), "sources");
  console.log("Starting ESG Fact Provenance Audit...\n");

  let passed = 0;
  for (const item of auditList) {
    const filePath = path.join(sourcesDir, item.sourceDoc);
    if (!fs.existsSync(filePath)) {
      console.error(`[FAIL] Source file not found: ${item.sourceDoc}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const pages = content.split("\x0c");
    const pageIndex = item.page - 1;

    if (pageIndex >= pages.length) {
      console.error(`[FAIL] Page ${item.page} exceeds total pages (${pages.length}) in ${item.sourceDoc}`);
      continue;
    }

    const pageContent = pages[pageIndex];
    if (pageContent.toLowerCase().includes(item.expectedTerm.toLowerCase())) {
      console.log(`[PASS] ${item.id} verified on Page ${item.page} of ${item.sourceDoc} (contains "${item.expectedTerm}")`);
      passed++;
    } else {
      console.warn(`[WARN] ${item.id} on Page ${item.page}: term "${item.expectedTerm}" not found verbatim.`);
    }
  }

  console.log(`\nAudit Complete: ${passed}/${auditList.length} verified.`);
}

if (process.argv[1]?.includes("extract-sources")) {
  runSourceAudit();
}
