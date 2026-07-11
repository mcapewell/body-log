import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Session, Settings } from '../types';

interface BodyLogDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: { date: string };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

const DB_NAME = 'body-log';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BodyLogDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<BodyLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BodyLogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}
