/**
 * Audits every file in /data against the source documents.
 *   npm run verify:data
 * Exits non-zero on any error. See lib/data/verify.ts for the checks.
 */
import { facts } from "../lib/data/load";
import { verifyData } from "../lib/data/verify";

const issues = verifyData();
for (const i of issues) console.log(`${i.level === "error" ? "✗" : "!"} ${i.where}: ${i.message}`);

const counts = facts.reduce<Record<string, number>>((acc, f) => ((acc[f.status] = (acc[f.status] ?? 0) + 1), acc), {});
const flagged = facts.filter((f) => f.flags.length > 0).length;
const errors = issues.filter((i) => i.level === "error").length;
console.log(
  `\n${facts.length} facts (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}), ${flagged} with quality flags.` +
    `\n${errors ? `${errors} error(s).` : "All checks passed."}`,
);
process.exit(errors ? 1 : 0);
