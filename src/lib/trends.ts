import type { MetricKey, Session } from '../types';
import { daysBetween } from './dates';

export type TrendDirection = 'up' | 'down' | 'same';

export interface Delta {
  /** Signed change in the stored (metric) value: latest − baseline. */
  absolute: number;
  direction: TrendDirection;
  /** Days between the baseline and latest readings actually used. */
  spanDays: number;
}

/** The most recent value logged for a metric, or null if never logged. */
export function latestValue(
  sessions: Session[],
  metric: MetricKey,
): { value: number; date: string } | null {
  let best: { value: number; date: string } | null = null;
  for (const s of sessions) {
    const v = s[metric];
    if (typeof v === 'number' && (!best || s.date > best.date)) {
      best = { value: v, date: s.date };
    }
  }
  return best;
}

/**
 * Change in a metric over roughly `days` — compares the latest reading to the
 * reading nearest to `days` before it. Returns null when there is no prior
 * reading to compare against.
 */
export function deltaOver(sessions: Session[], metric: MetricKey, days: number): Delta | null {
  const withValue = sessions.filter((s) => typeof s[metric] === 'number');
  if (withValue.length < 2) return null;

  withValue.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const latest = withValue[withValue.length - 1];

  // Among readings strictly before the latest, pick the one whose age is
  // closest to the requested window.
  const priors = withValue.slice(0, -1);
  let baseline = priors[0];
  let bestDistance = Infinity;
  for (const s of priors) {
    const age = daysBetween(s.date, latest.date);
    const distance = Math.abs(age - days);
    if (distance < bestDistance) {
      bestDistance = distance;
      baseline = s;
    }
  }

  const absolute = (latest[metric] as number) - (baseline[metric] as number);
  const direction: TrendDirection = absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'same';
  return { absolute, direction, spanDays: daysBetween(baseline.date, latest.date) };
}

/** Build a chronological (date, value) series for charting a single metric. */
export function metricSeries(
  sessions: Session[],
  metric: MetricKey,
): { date: string; value: number }[] {
  return sessions
    .filter((s) => typeof s[metric] === 'number')
    .map((s) => ({ date: s.date, value: s[metric] as number }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
