import { useRef, useState } from 'react';
import type { UnitSystem } from '../types';
import { useSettings } from '../state/SettingsContext';
import {
  registerPeriodicReminder,
  requestReminderPermission,
} from '../lib/reminders';
import { exportBackup, importBackup, downloadTextFile } from '../lib/backup';
import { todayISO } from '../lib/dates';

export default function Settings() {
  const { settings, update, loaded } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  if (!loaded) return <div className="screen screen--center">Loading…</div>;

  async function setUnits(units: UnitSystem) {
    await update({ units });
  }

  async function toggleReminder(enabled: boolean) {
    await update({ reminderEnabled: enabled });
    if (enabled) {
      const perm = await requestReminderPermission();
      if (perm === 'granted') {
        const ok = await registerPeriodicReminder(settings.reminderIntervalDays);
        setStatus(
          ok
            ? 'OS reminders enabled where supported.'
            : 'In-app reminders on. OS notifications unsupported on this device.',
        );
      } else {
        setStatus('In-app reminders on. (Notifications not permitted.)');
      }
    }
  }

  async function setInterval(days: number) {
    await update({ reminderIntervalDays: days });
  }

  async function handleExport() {
    const json = await exportBackup();
    downloadTextFile(`body-log-${todayISO()}.json`, json);
    setStatus('Backup exported.');
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const count = await importBackup(text);
      setStatus(`Imported ${count} session${count === 1 ? '' : 's'}. Reloading…`);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Settings</h1>
      </header>

      <section className="settings-group">
        <h2 className="settings-group__title">Units</h2>
        <div className="segmented">
          {(['metric', 'imperial'] as UnitSystem[]).map((u) => (
            <button
              key={u}
              className={`segmented__btn${settings.units === u ? ' segmented__btn--active' : ''}`}
              onClick={() => setUnits(u)}
            >
              {u === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">Reminders</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.reminderEnabled}
            onChange={(e) => toggleReminder(e.target.checked)}
          />
          <span>Remind me to measure</span>
        </label>
        {settings.reminderEnabled && (
          <label className="field">
            <span className="field__label">Every</span>
            <select
              className="field__input"
              value={settings.reminderIntervalDays}
              onChange={(e) => setInterval(Number(e.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </label>
        )}
        <p className="settings-note">
          A nudge appears in the app when you’re due. OS notifications are best-effort and depend on
          browser support.
        </p>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">Backup</h2>
        <div className="form-actions">
          <button className="btn" onClick={handleExport}>
            Export JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = '';
            }}
          />
        </div>
        <p className="settings-note">
          Your data lives only on this device. Export regularly to back up or move devices. Import
          replaces all current sessions.
        </p>
      </section>

      {status && <p className="settings-status">{status}</p>}

      <p className="settings-note settings-note--muted">Body-Log · all data stored locally</p>
    </div>
  );
}
