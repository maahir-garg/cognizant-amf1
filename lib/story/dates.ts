import { formatDate } from "@/lib/format";

/** "9–11 Oct 2026" for a weekend inside one month, otherwise "30 Sept 2026 – 2 Oct 2026". */
export function formatDateRange(start: string, end: string): string {
  const a = new Date(`${start}T00:00:00Z`);
  const b = new Date(`${end}T00:00:00Z`);
  if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) {
    return `${a.getUTCDate()}–${formatDate(end)}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}
