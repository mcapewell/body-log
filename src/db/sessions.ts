import { getDb } from './db';
import type { Session } from '../types';

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDb();
  return db.getAll('sessions');
}

/** Sessions ordered by calendar date. Ascending by default (oldest first). */
export async function getSessionsSortedByDate(descending = false): Promise<Session[]> {
  const db = await getDb();
  const sessions = await db.getAllFromIndex('sessions', 'date');
  return descending ? sessions.reverse() : sessions;
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDb();
  return db.get('sessions', id);
}

export async function putSession(session: Session): Promise<void> {
  const db = await getDb();
  await db.put('sessions', session);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('sessions', id);
}

/** Replace the entire sessions store — used when importing a backup. */
export async function replaceAllSessions(sessions: Session[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sessions', 'readwrite');
  await tx.store.clear();
  for (const s of sessions) {
    await tx.store.put(s);
  }
  await tx.done;
}
