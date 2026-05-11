import { createHmac, timingSafeEqual } from 'node:crypto';

type JwtPayload = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
};
export type InternalJwtPayload = JwtPayload & Record<string, unknown>;

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function base64UrlEncode(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function verifyHs256Signature(token: string, secret: string): boolean {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return false;
  const signingInput = `${header}.${payload}`;
  const digest = createHmac('sha256', secret).update(signingInput).digest();
  const expectedSignature = base64UrlEncode(digest);
  const expectedBuf = Buffer.from(expectedSignature);
  const receivedBuf = Buffer.from(signature);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

function parseJwtPayload(token: string): InternalJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payloadRaw = base64UrlDecode(parts[1]);
  try {
    return JSON.parse(payloadRaw) as InternalJwtPayload;
  } catch {
    return null;
  }
}

export function getVerifiedInternalJwtPayload(authorizationHeader?: string): InternalJwtPayload | null {
  const bearerToken = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length).trim()
    : undefined;
  const secret =
    process.env.SERVICE_JWT_SECRET ??
    (process.env.NODE_ENV !== 'production' ? 'xevn-dev-jwt-secret' : undefined);
  const issuer = process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal';
  const audience = process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api';

  if (!bearerToken || !secret || !verifyHs256Signature(bearerToken, secret)) {
    return null;
  }

  const payload = parseJwtPayload(bearerToken);
  if (!payload) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  const payloadAud = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
  const audienceOk = payloadAud.length === 0 || payloadAud.includes(audience);
  const issuerOk = !payload.iss || payload.iss === issuer;
  const expOk = !payload.exp || payload.exp > nowSec;
  const nbfOk = !payload.nbf || payload.nbf <= nowSec;
  if (!audienceOk || !issuerOk || !expOk || !nbfOk) return null;
  return payload;
}

export function isAuthorizedInternalRequest(
  authorizationHeader?: string,
  internalApiKey?: string,
): boolean {
  if (getVerifiedInternalJwtPayload(authorizationHeader)) return true;

  // Dev-only fallback for local simulation.
  const configuredKey = process.env.INTERNAL_API_KEY;
  const fallbackKey = 'xevn-dev-internal-key';
  const canUseStaticKey = process.env.NODE_ENV !== 'production';
  return Boolean(
    canUseStaticKey && internalApiKey && (internalApiKey === configuredKey || internalApiKey === fallbackKey),
  );
}
