import type { MetricKind, UnitSystem } from '../types';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

/** Unit label to show for a metric kind in a given unit system. */
export function unitLabel(kind: MetricKind, system: UnitSystem): string {
  if (kind === 'percent') return '%';
  if (kind === 'mass') return system === 'metric' ? 'kg' : 'lb';
  return system === 'metric' ? 'cm' : 'in';
}

/** Convert a stored (metric) value to the value shown for the given unit system. */
export function toDisplay(value: number, kind: MetricKind, system: UnitSystem): number {
  if (system === 'metric' || kind === 'percent') return value;
  return kind === 'mass' ? value / KG_PER_LB : value / CM_PER_IN;
}

/** Convert a value entered in the given unit system back to the stored (metric) value. */
export function fromDisplay(value: number, kind: MetricKind, system: UnitSystem): number {
  if (system === 'metric' || kind === 'percent') return value;
  return kind === 'mass' ? value * KG_PER_LB : value * CM_PER_IN;
}

/** Round for display without trailing float noise. */
export function roundDisplay(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Format a stored metric value for display, including unit conversion and rounding. */
export function formatValue(
  value: number,
  kind: MetricKind,
  system: UnitSystem,
  decimals = 1,
): string {
  return roundDisplay(toDisplay(value, kind, system), decimals).toString();
}
