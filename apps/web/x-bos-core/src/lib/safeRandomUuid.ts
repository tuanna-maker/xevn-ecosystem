/**
 * HTTP pilot hosts (e.g. :8088) are not secure contexts — `crypto.randomUUID` is undefined.
 * Use native UUID when available; otherwise a RFC-4122 v4-compatible fallback.
 */
function generateUuidV4(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function safeRandomUuid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return generateUuidV4();
}

/** Idempotent — call once at app bootstrap on HTTP pilots. */
export function installSafeRandomUuidPolyfill(): void {
  if (typeof globalThis.crypto?.randomUUID === 'function') return;
  const cryptoObj = globalThis.crypto ?? ({} as Crypto);
  Object.defineProperty(cryptoObj, 'randomUUID', {
    value: generateUuidV4,
    configurable: true,
    writable: true,
  });
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: cryptoObj,
      configurable: true,
    });
  }
}
