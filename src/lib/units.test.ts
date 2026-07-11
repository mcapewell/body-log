import { describe, it, expect } from 'vitest';
import { toDisplay, fromDisplay, unitLabel, formatValue, roundDisplay } from './units';

describe('units', () => {
  it('leaves metric values unchanged', () => {
    expect(toDisplay(80, 'mass', 'metric')).toBe(80);
    expect(toDisplay(100, 'length', 'metric')).toBe(100);
  });

  it('converts mass to pounds for imperial display', () => {
    expect(roundDisplay(toDisplay(100, 'mass', 'imperial'))).toBeCloseTo(220.5, 1);
  });

  it('converts length to inches for imperial display', () => {
    expect(roundDisplay(toDisplay(101.6, 'length', 'imperial'))).toBeCloseTo(40, 1);
  });

  it('never converts percentages', () => {
    expect(toDisplay(15, 'percent', 'imperial')).toBe(15);
    expect(fromDisplay(15, 'percent', 'imperial')).toBe(15);
  });

  it('round-trips display <-> stored', () => {
    const stored = 92.5;
    const shown = toDisplay(stored, 'mass', 'imperial');
    expect(fromDisplay(shown, 'mass', 'imperial')).toBeCloseTo(stored, 6);
  });

  it('picks correct unit labels', () => {
    expect(unitLabel('mass', 'metric')).toBe('kg');
    expect(unitLabel('mass', 'imperial')).toBe('lb');
    expect(unitLabel('length', 'metric')).toBe('cm');
    expect(unitLabel('length', 'imperial')).toBe('in');
    expect(unitLabel('percent', 'metric')).toBe('%');
  });

  it('formats with conversion and rounding', () => {
    expect(formatValue(100, 'mass', 'imperial')).toBe('220.5');
    expect(formatValue(80, 'mass', 'metric')).toBe('80');
  });
});
