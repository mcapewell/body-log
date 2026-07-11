import { Link } from 'react-router-dom';
import { METRIC_KEYS, METRICS } from '../types';
import { useSessions } from '../hooks/useSessions';
import { useSettings } from '../state/SettingsContext';
import { formatValue, unitLabel } from '../lib/units';
import { formatDate } from '../lib/dates';

export default function History() {
  const { sessions, loading } = useSessions();
  const { settings } = useSettings();

  if (loading) return <div className="screen screen--center">Loading…</div>;

  const ordered = [...sessions].reverse(); // newest first

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>History</h1>
        <Link to="/log" className="btn btn--primary">
          + Log
        </Link>
      </header>

      {ordered.length === 0 ? (
        <div className="empty">
          <p className="empty__title">Nothing logged yet</p>
        </div>
      ) : (
        <ul className="history">
          {ordered.map((s) => (
            <li key={s.id}>
              <Link to={`/log/${s.id}`} className="history__item">
                <div className="history__date">{formatDate(s.date)}</div>
                <div className="history__values">
                  {METRIC_KEYS.filter((k) => typeof s[k] === 'number').map((k) => (
                    <span key={k} className="history__chip">
                      {METRICS[k].label}: {formatValue(s[k] as number, METRICS[k].kind, settings.units)}
                      {unitLabel(METRICS[k].kind, settings.units) === '%'
                        ? '%'
                        : ` ${unitLabel(METRICS[k].kind, settings.units)}`}
                    </span>
                  ))}
                </div>
                {s.notes && <div className="history__notes">{s.notes}</div>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
