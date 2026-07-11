/** Today as an ISO calendar date, 'YYYY-MM-DD', in local time. */
export function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

/** Parse an ISO date ('YYYY-MM-DD') into a local-midnight timestamp (ms). */
export function isoToTime(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

const MS_PER_DAY = 86_400_000;

/** Whole days between two ISO dates (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((isoToTime(b) - isoToTime(a)) / MS_PER_DAY);
}

/** Whole days from an ISO date until today. */
export function daysSince(iso: string): number {
  return daysBetween(iso, todayISO());
}

/** Human-friendly date, e.g. "11 Jul 2026". */
export function formatDate(iso: string): string {
  return new Date(isoToTime(iso)).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Relative phrasing for the last log, e.g. "today", "3 days ago". */
export function relativeDays(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
