/** The set of measurements tracked per session (essentials). */
export type MetricKey = 'weight' | 'bodyFat' | 'chest' | 'waist' | 'arms' | 'thighs';

/** Ordered list of tracked metrics, used to drive forms, dashboards and charts. */
export const METRIC_KEYS: MetricKey[] = ['weight', 'bodyFat', 'chest', 'waist', 'arms', 'thighs'];

/** What kind of quantity a metric represents — determines unit conversion. */
export type MetricKind = 'mass' | 'length' | 'percent';

export interface MetricMeta {
  key: MetricKey;
  label: string;
  kind: MetricKind;
}

/** Metadata for each metric. Values are stored internally in metric units (kg, cm). */
export const METRICS: Record<MetricKey, MetricMeta> = {
  weight: { key: 'weight', label: 'Weight', kind: 'mass' },
  bodyFat: { key: 'bodyFat', label: 'Body fat', kind: 'percent' },
  chest: { key: 'chest', label: 'Chest', kind: 'length' },
  waist: { key: 'waist', label: 'Waist', kind: 'length' },
  arms: { key: 'arms', label: 'Arms', kind: 'length' },
  thighs: { key: 'thighs', label: 'Thighs', kind: 'length' },
};

/** A single measurement session logged on a given date. */
export interface Session {
  id: string;
  /** ISO calendar date, 'YYYY-MM-DD'. */
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type UnitSystem = 'metric' | 'imperial';

export interface Settings {
  id: 'settings';
  units: UnitSystem;
  reminderEnabled: boolean;
  reminderIntervalDays: number;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  units: 'metric',
  reminderEnabled: true,
  reminderIntervalDays: 7,
};
