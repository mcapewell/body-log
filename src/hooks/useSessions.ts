import { useCallback, useEffect, useState } from 'react';
import type { Session } from '../types';
import { getSessionsSortedByDate } from '../db/sessions';

/** Load all sessions (ascending by date) with a refresh handle. */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const rows = await getSessionsSortedByDate();
    setSessions(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, refresh };
}
