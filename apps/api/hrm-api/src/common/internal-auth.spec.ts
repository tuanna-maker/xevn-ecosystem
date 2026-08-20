import {
  getVerifiedInternalJwtPayload,
  normalizeAuthorizationHeaderInPlace,
  resolveAuthorizationHeader,
} from './internal-auth';
import { signServiceJwt } from './jwt-sign';

describe('internal-auth browser transport normalization', () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it('normalizes x-access-token into Bearer authorization', () => {
    const headers: Record<string, unknown> = {
      'x-access-token': 'token-from-header',
    };

    normalizeAuthorizationHeaderInPlace(headers);

    expect(headers.authorization).toBe('Bearer token-from-header');
  });

  it('prefers authorization when already present', () => {
    const headers: Record<string, unknown> = {
      authorization: 'Bearer canonical-token',
      'x-access-token': 'other-token',
    };

    normalizeAuthorizationHeaderInPlace(headers);

    expect(headers.authorization).toBe('Bearer canonical-token');
  });

  it('extracts quoted cookie token fallback', () => {
    const auth = resolveAuthorizationHeader(undefined, {
      cookie: 'foo=bar; xevn.portal.accessToken="cookie.jwt.token"; baz=1',
    });

    expect(auth).toBe('Bearer cookie.jwt.token');
  });

  it('extracts underscored cookie token fallback', () => {
    const auth = resolveAuthorizationHeader(undefined, {
      cookie: 'xevn_portal_access_token=cookie-underscore-token',
    });

    expect(auth).toBe('Bearer cookie-underscore-token');
  });

  it('verifies token with JWT_SECRET fallback in production mode', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SERVICE_JWT_SECRET;
    process.env.JWT_SECRET = 'jwt-secret-fallback';

    const token = signServiceJwt({ sub: 'ceo@xe.vn' }, 60);
    const payload = getVerifiedInternalJwtPayload(`Bearer ${token}`);

    expect(payload?.sub).toBe('ceo@xe.vn');
  });
});
