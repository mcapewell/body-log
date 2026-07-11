/**
 * Generate a unique id for a session. Prefers `crypto.randomUUID()`, but that
 * isn't available on every platform (e.g. iOS Safari < 15.4, or non-secure
 * contexts), where calling it throws. Fall back to a UUIDv4 built from
 * `crypto.getRandomValues`, and finally to a time-and-random id.
 */
export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;

  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }

  if (c && typeof c.getRandomValues === 'function') {
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}
