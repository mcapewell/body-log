import type { MetricKind, UnitSystem } from '../types';
import type { Delta } from '../lib/trends';
import { roundDisplay, toDisplay, unitLabel } from '../lib/units';

interface Props {
  label: string;
  delta: Delta | null;
  kind: MetricKind;
  system: UnitSystem;
}

/** A small change indicator, e.g. "7d ↓ 1.2 cm". Neutral for missing data. */
export default function TrendBadge({ label, delta, kind, system }: Props) {
  if (!delta) {
    return <span className="trend trend--none">{label} —</span>;
  }
  const arrow = delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '→';
  const magnitude = roundDisplay(Math.abs(toDisplay(delta.absolute, kind, system)));
  const unit = unitLabel(kind, system);
  return (
    <span className={`trend trend--${delta.direction}`}>
      {label} {arrow} {magnitude}
      {unit === '%' ? '' : ' '}
      {unit}
    </span>
  );
}
