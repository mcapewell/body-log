import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { MetricMeta, UnitSystem } from '../types';
import { formatDate } from '../lib/dates';
import { toDisplay, unitLabel } from '../lib/units';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

interface Props {
  meta: MetricMeta;
  system: UnitSystem;
  series: { date: string; value: number }[];
}

const ACCENT = '#38bdf8';

export default function ChartCard({ meta, system, series }: Props) {
  const data = useMemo(
    () => ({
      labels: series.map((p) => formatDate(p.date)),
      datasets: [
        {
          label: meta.label,
          data: series.map((p) => toDisplay(p.value, meta.kind, system)),
          borderColor: ACCENT,
          backgroundColor: ACCENT,
          tension: 0.25,
          pointRadius: 3,
          fill: false,
        },
      ],
    }),
    [series, meta, system],
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.formattedValue} ${unitLabel(meta.kind, system)}`,
          },
        },
      },
      scales: {
        x: { ticks: { maxTicksLimit: 6, color: '#94a3b8' }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.15)' } },
      },
    }),
    [meta, system],
  );

  if (series.length === 0) {
    return <p className="chart-empty">No data yet for {meta.label.toLowerCase()}.</p>;
  }

  return (
    <div className="chart-card">
      <div className="chart-card__canvas">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
