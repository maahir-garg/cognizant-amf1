import type { ReactNode } from "react";
import type { Status } from "@/lib/data/schemas";
import { cn } from "@/lib/utils";

type Mark = Status | "conflict";

const COPY: Record<Mark, { label: string; title: string; legend: string }> = {
  verified: {
    label: "Verified",
    title: "Printed in the team's published report or an official source, page recorded and checked automatically",
    legend: "Printed in the source. Tap to see the page.",
  },
  estimated: {
    label: "Estimated",
    title: "Calculated from verified figures with a documented formula",
    legend: "Worked out from verified figures. Tap to see the formula.",
  },
  simulated: {
    label: "Simulated",
    title: "Demo data for this prototype, not real",
    legend: "Demo data, not real.",
  },
  conflict: {
    label: "Source conflict",
    title: "The source publishes different values for this figure in different places",
    legend: "The source prints different values in different places.",
  },
};

/**
 * Trust status mark. Shape carries the meaning as well as colour:
 * verified = filled square, estimated = half-filled, simulated = dashed
 * outline, conflict = rotated square. Always pair it with the label text
 * (StatusBadge) unless the label is right beside it.
 */
export function StatusMark({ status, className }: { status: Mark; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-[1px]",
        status === "verified" && "bg-verified",
        status === "estimated" && "border border-estimated bg-[linear-gradient(135deg,var(--estimated)_50%,transparent_50%)]",
        status === "simulated" && "border border-dashed border-simulated",
        status === "conflict" && "size-2 rotate-45 bg-conflict",
        className,
      )}
    />
  );
}

/** 10px mark + 12px uppercase label in the ground's status colour. */
export function StatusBadge({
  status,
  className,
  compact = false,
}: {
  status: Mark;
  className?: string;
  /** Mark only, with the label for screen readers. */
  compact?: boolean;
}) {
  const { label, title } = COPY[status];
  return (
    <span
      title={title}
      className={cn(
        "kicker inline-flex items-center gap-1.5 whitespace-nowrap",
        status === "verified" && "text-verified",
        status === "estimated" && "text-estimated",
        status === "simulated" && "text-simulated",
        status === "conflict" && "text-conflict",
        className,
      )}
    >
      <StatusMark status={status} />
      <span className={compact ? "sr-only" : undefined}>{label}</span>
    </span>
  );
}

/**
 * Explains the trust labels. The product ships no simulated data, so the
 * default legend is Verified and Estimated; pass `statuses` to add others.
 * `variant="list"` adds a one-line explanation under each label.
 */
export function StatusLegend({
  className,
  statuses = ["verified", "estimated"],
  variant = "inline",
}: {
  className?: string;
  statuses?: readonly Mark[];
  variant?: "inline" | "list";
}) {
  if (variant === "list") {
    return (
      <dl className={cn("flex flex-col gap-3", className)}>
        {statuses.map((s) => (
          <div key={s} className="flex flex-col gap-1">
            <dt>
              <StatusBadge status={s} />
            </dt>
            <dd className="text-sm leading-snug text-ink-2">{COPY[s].legend}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
      {statuses.map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  );
}

/**
 * Where the team has not published a figure. Never contains a number: say
 * what is missing in words, e.g. "Singapore trackside energy is not published."
 */
export function DataGap({
  children,
  label = "Data gap",
  className,
}: {
  children?: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div role="note" className={cn("flex flex-col gap-1.5 rounded-sm border border-dashed border-line-strong px-4 py-3", className)}>
      <span className="kicker text-ink-3">{label}</span>
      {children && <p className="text-sm leading-snug text-ink-2">{children}</p>}
    </div>
  );
}
