import { signServiceJwt } from './jwt-sign';

function decodeJwtPayload(token: string): { iat: number; exp: number } {
  const part = token.split('.')[1];
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(json) as { iat: number; exp: number };
}

describe('signServiceJwt', () => {
  it('defaults to 24h TTL when ttlSec is omitted', () => {
    const token = signServiceJwt({ sub: 'ceo@xe.vn' });
    const payload = decodeJwtPayload(token);
    expect(payload.exp - payload.iat).toBe(86400);
  });

  it('sets exp to iat + ttlSec when portal TTL is 24h', () => {
    const ttlSec = 24 * 60 * 60;
    const token = signServiceJwt({ sub: 'ceo@xe.vn' }, ttlSec);
    const payload = decodeJwtPayload(token);
    expect(payload.exp - payload.iat).toBe(86400);
  });
});
