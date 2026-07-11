import type { Session, Settings } from '../types';
import { daysSince } from './dates';
import { getSessionsSortedByDate } from '../db/sessions';

export interface ReminderState {
  due: boolean;
  daysSinceLast: number | null;
}

/** Whether a measurement reminder should be shown, given settings and history. */
export function reminderState(sessions: Session[], settings: Settings): ReminderState {
  if (!settings.reminderEnabled) return { due: false, daysSinceLast: null };
  if (sessions.length === 0) return { due: true, daysSinceLast: null };

  const latestDate = sessions.reduce((max, s) => (s.date > max ? s.date : max), sessions[0].date);
  const gap = daysSince(latestDate);
  return { due: gap >= settings.reminderIntervalDays, daysSinceLast: gap };
}

const SYNC_TAG = 'body-log-reminder';

/**
 * Best-effort OS reminders. Truly scheduled background notifications aren't
 * reliably available to a local-only PWA, so this registers Periodic Background
 * Sync where supported (installed PWA on Chromium) and is a no-op elsewhere.
 * The in-app nudge banner is the guaranteed path.
 */
export async function requestReminderPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function registerPeriodicReminder(intervalDays: number): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return false;
    const reg = (await navigator.serviceWorker.ready) as ServiceWorkerRegistration & {
      periodicSync?: {
        register: (tag: string, options: { minInterval: number }) => Promise<void>;
      };
    };
    if (!reg.periodicSync) return false;

    const status = await navigator.permissions.query({
      // periodic-background-sync is not in the standard PermissionName union yet.
      name: 'periodic-background-sync' as PermissionName,
    });
    if (status.state !== 'granted') return false;

    await reg.periodicSync.register(SYNC_TAG, {
      minInterval: intervalDays * 86_400_000,
    });
    return true;
  } catch {
    return false;
  }
}

/** Convenience wrapper used by the Settings screen. */
export async function loadReminderState(settings: Settings): Promise<ReminderState> {
  const sessions = await getSessionsSortedByDate();
  return reminderState(sessions, settings);
}
