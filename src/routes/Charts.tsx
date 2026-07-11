import { useMemo, useState } from 'react';
import { METRIC_KEYS, METRICS, type MetricKey } from '../types';
import { useSessions } from '../hooks/useSessions';
import { useSettings } from '../state/SettingsContext';
import { metricSeries } from '../lib/trends';
import { daysSince } from '../lib/dates';
import ChartCard from '../components/ChartCard';

type Range = 30 | 90 | 0; // 0 = all

const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 0, label: 'All' },
];

export default function Charts() {
  const { sessions, loading } = useSessions();
  const { settings } = useSettings();
  const [metric, setMetric] = useState<MetricKey>('weight');
  const [range, setRange] = useState<Range>(90);

  const meta = METRICS[metric];
  const series = useMemo(() => {
    const all = metricSeries(sessions, metric);
    if (range === 0) return all;
    return all.filter((p) => daysSince(p.date) <= range);
  }, [sessions, metric, range]);

  if (loading) return <div className="screen screen--center">Loading…</div>;

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Charts</h1>
      </header>

      <div className="segmented" role="tablist" aria-label="Metric">
        {METRIC_KEYS.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={metric === key}
            className={`segmented__btn${metric === key ? ' segmented__btn--active' : ''}`}
            onClick={() => setMetric(key)}
          >
            {METRICS[key].label}
          </button>
        ))}
      </div>

      <div className="segmented segmented--small" role="tablist" aria-label="Range">
        {RANGES.map((r) => (
          <button
            key={r.value}
            role="tab"
            aria-selected={range === r.value}
            className={`segmented__btn${range === r.value ? ' segmented__btn--active' : ''}`}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ChartCard meta={meta} system={settings.units} series={series} />
    </div>
  );
}
