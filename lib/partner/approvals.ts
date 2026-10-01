/**
 * The desk's approval trail: draft -> in review -> approved, with the
 * reviewer's name, timestamps and an audit record of the facts the copy
 * uses (id, status, source and the date each was extracted from its report).
 *
 * The prototype keeps records in the browser's localStorage, one key per
 * draft. A pilot would keep the same record in a shared store with sign-in;
 * the shape is designed to move there unchanged. Nothing here publishes
 * anything: approval only unlocks copying.
 */
import { z } from "zod";
import { factCitation, findFact } from "@/lib/data/load";

export const APPROVAL_STATES = ["draft", "in-review", "approved"] as const;
type ApprovalState = (typeof APPROVAL_STATES)[number];

export const APPROVAL_LABEL: Record<ApprovalState, string> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
};

const AuditFact = z.object({
  id: z.string(),
  status: z.string(),
  source: z.string(),
  extractedAt: z.string(),
});
type AuditFact = z.infer<typeof AuditFact>;

const ApprovalEvent = z.object({
  state: z.enum(APPROVAL_STATES),
  at: z.string(),
  by: z.string().nullable(),
});
type ApprovalEvent = z.infer<typeof ApprovalEvent>;

export const ApprovalRecord = z.object({
  key: z.string(),
  /** What the copy is, e.g. "LinkedIn post" or "Your draft". */
  title: z.string(),
  state: z.enum(APPROVAL_STATES),
  reviewer: z.string().nullable(),
  approvedAt: z.string().nullable(),
  textHash: z.string(),
  facts: z.array(AuditFact),
  history: z.array(ApprovalEvent),
});
export type ApprovalRecord = z.infer<typeof ApprovalRecord>;

/** FNV-1a, enough to tell two drafts apart; not a security measure. */
function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** One storage key per piece of copy: a changed draft starts its own trail. */
export function draftKey(kind: string, text: string): string {
  return `${kind}:${hashText(text)}`;
}

export function auditFacts(factIds: string[]): AuditFact[] {
  return [...new Set(factIds)].flatMap((id) => {
    const f = findFact(id);
    return f ? [{ id, status: f.status, source: factCitation(f).label, extractedAt: f.extractedAt }] : [];
  });
}

export function newRecord(opts: { key: string; title: string; text: string; factIds: string[] }): ApprovalRecord {
  return {
    key: opts.key,
    title: opts.title,
    state: "draft",
    reviewer: null,
    approvedAt: null,
    textHash: hashText(opts.text),
    facts: auditFacts(opts.factIds),
    history: [],
  };
}

export type ApprovalAction = { type: "submit" } | { type: "approve"; reviewer: string } | { type: "reopen" };

/** Applies one step. Invalid steps (approving a draft that was never sent, a blank reviewer) throw. */
export function transition(record: ApprovalRecord, action: ApprovalAction, at: string): ApprovalRecord {
  switch (action.type) {
    case "submit":
      if (record.state !== "draft") throw new Error("Only a draft can be sent for review");
      return { ...record, state: "in-review", history: [...record.history, { state: "in-review", at, by: null }] };
    case "approve": {
      const reviewer = action.reviewer.trim();
      if (record.state !== "in-review") throw new Error("Only a draft in review can be approved");
      if (!reviewer) throw new Error("Approval needs the reviewer's name");
      return {
        ...record,
        state: "approved",
        reviewer,
        approvedAt: at,
        history: [...record.history, { state: "approved", at, by: reviewer }],
      };
    }
    case "reopen":
      return {
        ...record,
        state: "draft",
        reviewer: null,
        approvedAt: null,
        history: [...record.history, { state: "draft", at, by: null }],
      };
  }
}

export const canCopy = (record: ApprovalRecord | null): boolean => record?.state === "approved";

/* -------------------------------------------------------------- storage */

const STORAGE_PREFIX = "impact-desk:approval:";
const CHANGE_EVENT = "impact-desk:approval-change";
// Fallback for this page view when localStorage is blocked (private mode, previews).
const memory = new Map<string, string>();

/** Raw stored JSON for a key, or null. */
export function readStored(key: string): string | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (stored !== null) return stored;
  } catch {
    // Fall through to the in-memory copy.
  }
  return memory.get(key) ?? null;
}

export function parseStored(raw: string | null): ApprovalRecord | null {
  if (!raw) return null;
  try {
    const parsed = ApprovalRecord.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Saves a record. Returns false when storage is unavailable, so the UI can say the trail won't persist. */
export function saveRecord(record: ApprovalRecord): boolean {
  let ok = true;
  memory.set(record.key, JSON.stringify(record));
  try {
    window.localStorage.setItem(STORAGE_PREFIX + record.key, JSON.stringify(record));
  } catch {
    ok = false;
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: record }));
  return ok;
}

export function subscribeRecords(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
