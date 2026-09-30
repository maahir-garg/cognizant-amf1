"use client";

import { Check, Copy, Download } from "lucide-react";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  APPROVAL_LABEL,
  APPROVAL_STATES,
  canCopy,
  formatStamp,
  newRecord,
  parseStored,
  readStored,
  saveRecord,
  subscribeRecords,
  transition,
  type ApprovalAction,
  type ApprovalRecord,
} from "@/lib/partner/approvals";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The stored record for a draft, kept in sync across tabs; null until one exists. */
function useApprovalRecord(key: string): ApprovalRecord | null {
  const raw = useSyncExternalStore(
    subscribeRecords,
    () => readStored(key),
    () => null,
  );
  return useMemo(() => parseStored(raw), [raw]);
}

/**
 * Draft -> in review -> approved, with the reviewer's name and time, and the
 * audit record of the facts the copy uses. Copying is the only thing
 * approval unlocks: nothing is published from here.
 */
export function ApprovalPanel({
  draftKey,
  title,
  text,
  factIds,
  copyText,
  blockedReason,
  className,
}: {
  /** Storage key for this exact piece of copy (see draftKey()). */
  draftKey: string;
  title: string;
  text: string;
  factIds: string[];
  /** The plain text with numbered footnotes that the copy button puts on the clipboard. */
  copyText: () => string;
  /** Set when the copy can't go for review yet, e.g. numbers held back. */
  blockedReason?: string;
  className?: string;
}) {
  const stored = useApprovalRecord(draftKey);
  const record = stored ?? newRecord({ key: draftKey, title, text, factIds });
  const [reviewer, setReviewer] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputId = useId();

  const act = (action: ApprovalAction) => {
    try {
      const next = transition(record, action, new Date().toISOString());
      if (!saveRecord(next)) setNotice("This browser is blocking storage, so the approval will not be kept after you leave the page.");
      else setNotice(null);
      if (action.type === "approve") setReviewer("");
    } catch (e) {
      setNotice((e as Error).message);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice("The clipboard is not available here. Select the text and copy it instead.");
    }
  };

  const downloadAudit = () => {
    const blob = new Blob([JSON.stringify({ ...record, text }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${record.key.replace(/[^a-z0-9-]/gi, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const current = APPROVAL_STATES.indexOf(record.state);
  const approvedEvent = record.state === "approved" ? record.history.at(-1) : undefined;
  const submitted = [...record.history].reverse().find((e) => e.state === "in-review");

  return (
    <section aria-label="Approval" className={cn("flex flex-col gap-4 rounded-[4px] border border-line-strong bg-surface p-5", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875em]" aria-label="Approval steps">
        {APPROVAL_STATES.map((s, i) => (
          <li key={s} className="flex items-center gap-2" aria-current={i === current ? "step" : undefined}>
            <span
              aria-hidden
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-[0.6875rem] font-semibold",
                i < current && "border-ink bg-ink text-bg",
                i === current && "border-2 border-ink bg-lime-tint text-ink",
                i > current && "border-line-strong text-ink-3",
              )}
            >
              {i < current ? "✓" : i + 1}
            </span>
            <span className={cn("whitespace-nowrap", i === current ? "font-semibold text-ink" : "text-ink-3")}>{APPROVAL_LABEL[s]}</span>
            {i < APPROVAL_STATES.length - 1 && <span aria-hidden className="h-px w-3 bg-line-strong xl:w-5" />}
          </li>
        ))}
      </ol>

      {record.state === "draft" && (
        <div className="flex flex-col gap-3">
          <p className="text-ink-2">
            {blockedReason ?? "Read it against the facts beside it, then send it to a reviewer. Copying unlocks once it is approved."}
          </p>
          <Button className="self-start" disabled={Boolean(blockedReason)} onClick={() => act({ type: "submit" })}>
            Send for review
          </Button>
        </div>
      )}

      {record.state === "in-review" && (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            act({ type: "approve", reviewer });
          }}
        >
          <p className="text-ink-2">
            In review{submitted ? ` since ${formatStamp(submitted.at)}` : ""}. The reviewer checks each figure&apos;s source, then approves
            under their own name.
          </p>
          <label htmlFor={inputId} className="kicker">
            Reviewer
          </label>
          <input
            id={inputId}
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            autoComplete="name"
            placeholder="Full name"
            className="h-12 rounded-[4px] border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-3"
          />
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={!reviewer.trim()}>
              Approve
            </Button>
            <Button type="button" variant="link" onClick={() => act({ type: "reopen" })}>
              Back to draft
            </Button>
          </div>
        </form>
      )}

      {record.state === "approved" && (
        <div className="flex flex-col gap-3">
          <p className="text-ink">
            <span className="font-semibold">Approved by {record.reviewer}</span>
            {approvedEvent && <span className="text-ink-2"> · {formatStamp(approvedEvent.at)}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={copy}>
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy with footnotes"}
            </Button>
            <Button variant="outline" onClick={downloadAudit}>
              <Download /> Audit record
            </Button>
            <Button variant="link" onClick={() => act({ type: "reopen" })}>
              Reopen
            </Button>
          </div>
        </div>
      )}

      {!canCopy(record) && (
        <Button variant="outline" disabled className="self-start" aria-describedby={`${inputId}-copy-note`}>
          <Copy /> Copy with footnotes
        </Button>
      )}

      <p id={`${inputId}-copy-note`} className="border-l-2 border-ink pl-3 text-[0.875em] text-ink-2">
        Nothing is published automatically. Approval only unlocks copying; you post it yourself, in your own channels.
      </p>
      {notice && (
        <p role="status" className="text-[0.875em] text-conflict">
          {notice}
        </p>
      )}

      <details className="group border-t border-line pt-3">
        <summary className="kicker cursor-pointer list-none text-ink-2 marker:hidden">
          <span className="inline-block transition-transform group-open:rotate-90">›</span> Audit record · {record.facts.length} fact
          {record.facts.length === 1 ? "" : "s"}
        </summary>
        <table className="mt-3 w-full text-left text-[0.8125rem]">
          <thead>
            <tr className="text-ink-3">
              <th className="kicker py-1 pr-3 font-semibold">Fact id</th>
              <th className="kicker py-1 pr-3 font-semibold">Status</th>
              <th className="kicker py-1 font-semibold">Extracted</th>
            </tr>
          </thead>
          <tbody>
            {record.facts.map((f) => (
              <tr key={f.id} className="border-t border-line align-top">
                <td className="py-1.5 pr-3 font-mono text-[0.75rem] break-all text-ink">
                  {f.id}
                  <span className="block font-sans text-ink-3">{f.source}</span>
                </td>
                <td className="py-1.5 pr-3">
                  <StatusBadge status={f.status === "estimated" ? "estimated" : "verified"} />
                </td>
                <td className="num py-1.5 whitespace-nowrap text-ink-2">{formatDate(f.extractedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {record.history.length > 0 && (
          <ol className="mt-3 flex flex-col gap-1 text-[0.8125rem] text-ink-3">
            {record.history.map((e, i) => (
              <li key={i}>
                {APPROVAL_LABEL[e.state]}
                {e.by ? ` by ${e.by}` : ""} · {formatStamp(e.at)}
              </li>
            ))}
          </ol>
        )}
      </details>
    </section>
  );
}
