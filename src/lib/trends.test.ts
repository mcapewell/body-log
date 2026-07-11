import { describe, it, expect } from 'vitest';
import { deltaOver, latestValue, metricSeries } from './trends';
import { reminderState } from './reminders';
import type { Session, Settings } from '../types';

function session(date: string, values: Partial<Session>): Session {
  return { id: date, date, createdAt: 0, updatedAt: 0, ...values };
}

describe('latestValue', () => {
  it('returns the most recent reading for a metric', () => {
    const sessions = [
      session('2026-01-01', { weight: 80 }),
      session('2026-02-01', { weight: 82 }),
      session('2026-01-15', { weight: 81 }),
    ];
    expect(latestValue(sessions, 'weight')).toEqual({ value: 82, date: '2026-02-01' });
  });

  it('returns null when no reading exists', () => {
    expect(latestValue([session('2026-01-01', { weight: 80 })], 'chest')).toBeNull();
  });
});

describe('deltaOver', () => {
  it('returns null with fewer than two readings', () => {
    expect(deltaOver([session('2026-01-01', { weight: 80 })], 'weight', 7)).toBeNull();
  });

  it('computes a downward change over ~7 days', () => {
    const sessions = [
      session('2026-01-01', { waist: 90 }),
      session('2026-01-08', { waist: 88.8 }),
    ];
    const d = deltaOver(sessions, 'waist', 7);
    expect(d).not.toBeNull();
    expect(d!.absolute).toBeCloseTo(-1.2, 5);
    expect(d!.direction).toBe('down');
    expect(d!.spanDays).toBe(7);
  });

  it('picks the baseline nearest the requested window', () => {
    const sessions = [
      session('2026-01-01', { weight: 80 }), // 30d before latest
      session('2026-01-24', { weight: 83 }), // 7d before latest
      session('2026-01-31', { weight: 84 }), // latest
    ];
    const d7 = deltaOver(sessions, 'weight', 7);
    expect(d7!.absolute).toBeCloseTo(1, 5); // 84 - 83
    const d30 = deltaOver(sessions, 'weight', 30);
    expect(d30!.absolute).toBeCloseTo(4, 5); // 84 - 80
  });
});

describe('metricSeries', () => {
  it('returns only sessions with the metric, sorted ascending', () => {
    const sessions = [
      session('2026-02-01', { weight: 82 }),
      session('2026-01-01', { weight: 80 }),
      session('2026-01-15', { chest: 100 }),
    ];
    expect(metricSeries(sessions, 'weight')).toEqual([
      { date: '2026-01-01', value: 80 },
      { date: '2026-02-01', value: 82 },
    ]);
  });
});

describe('reminderState', () => {
  const base: Settings = {
    id: 'settings',
    units: 'metric',
    reminderEnabled: true,
    reminderIntervalDays: 7,
  };

  it('is not due when reminders are disabled', () => {
    expect(reminderState([], { ...base, reminderEnabled: false }).due).toBe(false);
  });

  it('is due with no history', () => {
    expect(reminderState([], base)).toEqual({ due: true, daysSinceLast: null });
  });

  it('is due when the last log is older than the interval', () => {
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10);
    const state = reminderState([session(old, { weight: 80 })], base);
    expect(state.due).toBe(true);
    expect(state.daysSinceLast).toBeGreaterThanOrEqual(7);
  });

  it('is not due right after logging', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(reminderState([session(today, { weight: 80 })], base).due).toBe(false);
  });
});
