import { createHmac } from 'node:crypto';
import type { InternalJwtPayload } from './internal-auth';

function base64UrlEncode(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Default service JWT lifetime (24h) — portal login must pass explicit TTL. */
export const DEFAULT_SERVICE_JWT_TTL_SEC = 24 * 60 * 60;

export function signServiceJwt(
  claims: Record<string, unknown>,
  ttlSec: number = DEFAULT_SERVICE_JWT_TTL_SEC,
): string {
  const secret =
    process.env.SERVICE_JWT_SECRET ??
    (process.env.NODE_ENV !== 'production' ? 'xevn-dev-jwt-secret' : undefined);
  if (!secret) {
    throw new Error('SERVICE_JWT_SECRET is required to sign JWT');
  }
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload: InternalJwtPayload = {
    ...claims,
    iss: process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal',
    aud: process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api',
    iat: now,
    exp: now + ttlSec,
  };
  const payloadPart = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signingInput = `${header}.${payloadPart}`;
  const signature = base64UrlEncode(createHmac('sha256', secret).update(signingInput).digest());
  return `${signingInput}.${signature}`;
}
