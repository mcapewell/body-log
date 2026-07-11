import type { MetricMeta, UnitSystem } from '../types';
import { unitLabel } from '../lib/units';

interface Props {
  meta: MetricMeta;
  system: UnitSystem;
  /** Display-unit string value (controlled). */
  value: string;
  onChange: (value: string) => void;
}

export default function MetricInput({ meta, system, value, onChange }: Props) {
  const unit = unitLabel(meta.kind, system);
  const id = `metric-${meta.key}`;
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">
        {meta.label} <span className="field__unit">({unit})</span>
      </span>
      <input
        id={id}
        className="field__input"
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        placeholder="—"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
