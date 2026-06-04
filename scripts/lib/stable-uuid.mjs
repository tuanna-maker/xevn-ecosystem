import { createHash } from 'node:crypto';

/** RFC 4122 UUID v4 (variant 10xx) — passes class-validator @IsUUID(). */
export function stableUuid(seed) {
  const h = createHash('sha256').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
