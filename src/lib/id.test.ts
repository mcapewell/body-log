import { describe, it, expect, afterEach } from 'vitest';
import { newId } from './id';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('newId', () => {
  const originalRandomUUID = globalThis.crypto?.randomUUID;

  afterEach(() => {
    if (originalRandomUUID && globalThis.crypto) {
      globalThis.crypto.randomUUID = originalRandomUUID;
    }
  });

  it('returns unique, non-empty ids', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
    for (const id of ids) expect(id.length).toBeGreaterThan(0);
  });

  it('uses crypto.randomUUID when available', () => {
    expect(newId()).toMatch(UUID_RE);
  });

  it('falls back to a valid UUIDv4 when randomUUID is unavailable', () => {
    // Simulate iOS Safari < 15.4 where crypto.randomUUID does not exist.
    (globalThis.crypto as unknown as { randomUUID?: unknown }).randomUUID = undefined;
    const id = newId();
    expect(id).toMatch(UUID_RE);
    expect(id[14]).toBe('4'); // version nibble
    expect(['8', '9', 'a', 'b']).toContain(id[19]); // variant nibble
  });
});
