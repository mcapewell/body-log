import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { METRIC_KEYS, METRICS, type MetricKey, type Session } from '../types';
import { useSettings } from '../state/SettingsContext';
import { getSession, putSession, deleteSession } from '../db/sessions';
import { fromDisplay, roundDisplay, toDisplay } from '../lib/units';
import { todayISO } from '../lib/dates';
import { newId } from '../lib/id';
import MetricInput from '../components/MetricInput';

type FormValues = Record<MetricKey, string>;

const emptyValues = (): FormValues =>
  METRIC_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as FormValues);

export default function AddSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const editing = Boolean(id);

  const [date, setDate] = useState(todayISO());
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(!editing);
  const [existing, setExisting] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      if (s) {
        setExisting(s);
        setDate(s.date);
        setNotes(s.notes ?? '');
        setValues(
          METRIC_KEYS.reduce((acc, k) => {
            const v = s[k];
            acc[k] =
              typeof v === 'number'
                ? String(roundDisplay(toDisplay(v, METRICS[k].kind, settings.units)))
                : '';
            return acc;
          }, emptyValues()),
        );
      }
      setLoaded(true);
    });
  }, [id, settings.units]);

  function setValue(key: MetricKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const now = Date.now();
    const session: Session = {
      id: existing?.id ?? newId(),
      date,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const trimmedNotes = notes.trim();
    if (trimmedNotes) session.notes = trimmedNotes;
    for (const key of METRIC_KEYS) {
      const raw = values[key].trim();
      if (raw === '') continue;
      const num = Number(raw);
      if (!Number.isFinite(num)) continue;
      session[key] = fromDisplay(num, METRICS[key].kind, settings.units);
    }
    setSaving(true);
    setError(null);
    try {
      await putSession(session);
      navigate('/history');
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm('Delete this measurement session?')) return;
    setError(null);
    try {
      await deleteSession(existing.id);
      navigate('/history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete. Please try again.');
    }
  }

  if (!loaded) return <div className="screen screen--center">Loading…</div>;

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>{editing ? 'Edit session' : 'Log measurement'}</h1>
      </header>

      <label className="field">
        <span className="field__label">Date</span>
        <input
          className="field__input"
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <div className="field-grid">
        {METRIC_KEYS.map((key) => (
          <MetricInput
            key={key}
            meta={METRICS[key]}
            system={settings.units}
            value={values[key]}
            onChange={(v) => setValue(key, v)}
          />
        ))}
      </div>

      <label className="field">
        <span className="field__label">Notes</span>
        <textarea
          className="field__input field__input--area"
          rows={2}
          placeholder="e.g. fasted, post-workout"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Save session'}
        </button>
        {editing && (
          <button className="btn btn--danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
