import { Link } from 'react-router-dom';
import { METRIC_KEYS, METRICS } from '../types';
import { useSessions } from '../hooks/useSessions';
import { useSettings } from '../state/SettingsContext';
import { deltaOver, latestValue } from '../lib/trends';
import { reminderState } from '../lib/reminders';
import { formatValue, unitLabel } from '../lib/units';
import { formatDate } from '../lib/dates';
import TrendBadge from '../components/TrendBadge';
import NudgeBanner from '../components/NudgeBanner';

export default function Dashboard() {
  const { sessions, loading } = useSessions();
  const { settings } = useSettings();

  if (loading) return <div className="screen screen--center">Loading…</div>;

  const nudge = reminderState(sessions, settings);
  const hasData = sessions.length > 0;

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Body-Log</h1>
        <Link to="/log" className="btn btn--primary">
          + Log
        </Link>
      </header>

      {nudge.due && <NudgeBanner daysSinceLast={nudge.daysSinceLast} />}

      {!hasData ? (
        <div className="empty">
          <p className="empty__title">No measurements yet</p>
          <p className="empty__body">Tap “Log” to record your first session.</p>
        </div>
      ) : (
        <div className="metric-grid">
          {METRIC_KEYS.map((key) => {
            const meta = METRICS[key];
            const latest = latestValue(sessions, key);
            const d7 = deltaOver(sessions, key, 7);
            const d30 = deltaOver(sessions, key, 30);
            return (
              <div key={key} className="metric-card">
                <div className="metric-card__label">{meta.label}</div>
                <div className="metric-card__value">
                  {latest ? (
                    <>
                      {formatValue(latest.value, meta.kind, settings.units)}
                      <span className="metric-card__unit">{unitLabel(meta.kind, settings.units)}</span>
                    </>
                  ) : (
                    <span className="metric-card__unit">—</span>
                  )}
                </div>
                {latest && (
                  <div className="metric-card__date">as of {formatDate(latest.date)}</div>
                )}
                <div className="metric-card__trends">
                  <TrendBadge label="7d" delta={d7} kind={meta.kind} system={settings.units} />
                  <TrendBadge label="30d" delta={d30} kind={meta.kind} system={settings.units} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
