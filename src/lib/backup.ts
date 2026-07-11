import type { Session } from '../types';
import { getAllSessions, replaceAllSessions } from '../db/sessions';

interface BackupFile {
  app: 'body-log';
  version: 1;
  exportedAt: string;
  sessions: Session[];
}

export async function exportBackup(): Promise<string> {
  const sessions = await getAllSessions();
  const payload: BackupFile = {
    app: 'body-log',
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
  };
  return JSON.stringify(payload, null, 2);
}

/** Parse and validate a backup, then replace all local sessions. Returns count imported. */
export async function importBackup(json: string): Promise<number> {
  const parsed = JSON.parse(json) as Partial<BackupFile>;
  if (parsed.app !== 'body-log' || !Array.isArray(parsed.sessions)) {
    throw new Error('Not a valid Body-Log backup file.');
  }
  const sessions = parsed.sessions.filter(
    (s): s is Session => typeof s?.id === 'string' && typeof s?.date === 'string',
  );
  await replaceAllSessions(sessions);
  return sessions.length;
}

export function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
