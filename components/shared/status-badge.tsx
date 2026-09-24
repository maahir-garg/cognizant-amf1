import { cn } from "@/lib/utils";
import type { Status } from "@/lib/data/schemas";

const COPY: Record<Status | "conflict", { label: string; title: string }> = {
  verified: { label: "Verified", title: "Printed in an official AMF1 or government source, page-referenced and auto-checked" },
  estimated: { label: "Estimated", title: "Calculated from verified figures with a documented formula" },
  simulated: { label: "Simulated", title: "Demo data for this prototype, not real" },
  conflict: { label: "Source conflict", title: "The source publishes different values for this figure in different places" },
};

/**
 * Trust status mark. Shape and text carry the meaning as well as colour:
 * verified = filled square, estimated = half-filled, simulated = dashed outline.
 */
export function StatusMark({ status, className }: { status: Status | "conflict"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-[1px]",
        status === "verified" && "bg-verified",
        status === "estimated" && "border border-estimated bg-[linear-gradient(135deg,var(--estimated)_50%,transparent_50%)]",
        status === "simulated" && "border border-dashed border-simulated",
        status === "conflict" && "rotate-45 bg-conflict",
        className,
      )}
    />
  );
}

export function StatusBadge({
  status,
  className,
  compact = false,
}: {
  status: Status | "conflict";
  className?: string;
  /** Mark only, with the label for screen readers. */
  compact?: boolean;
}) {
  const { label, title } = COPY[status];
  return (
    <span
      title={title}
      className={cn(
        "label inline-flex items-center gap-1.5 whitespace-nowrap",
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

/** Legend explaining the three trust states. Put one on every page that shows numbers. */
export function StatusLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
      {(["verified", "estimated", "simulated"] as const).map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  );
}
