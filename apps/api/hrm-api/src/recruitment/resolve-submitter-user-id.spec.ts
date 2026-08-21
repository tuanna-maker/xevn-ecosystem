import { signServiceJwt } from '../common/jwt-sign';
import { resolveSubmitterUserIdFromAuth } from './resolve-submitter-user-id';

describe('resolveSubmitterUserIdFromAuth (D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01)', () => {
  const prevSecret = process.env.SERVICE_JWT_SECRET;
  const prevNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    if (prevSecret === undefined) delete process.env.SERVICE_JWT_SECRET;
    else process.env.SERVICE_JWT_SECRET = prevSecret;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
  });

  it('prefers x-user-id header over JWT', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      email: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
    });
    expect(
      resolveSubmitterUserIdFromAuth(`Bearer ${token}`, 'override@xe.vn'),
    ).toBe('override@xe.vn');
  });

  it('falls back to JWT email/sub when header missing (embed gap → SPAWN-MISSING)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      email: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    expect(resolveSubmitterUserIdFromAuth(`Bearer ${token}`, undefined)).toBe(
      'ceo@xe.vn',
    );
    expect(resolveSubmitterUserIdFromAuth(`Bearer ${token}`, '  ')).toBe(
      'ceo@xe.vn',
    );
  });

  it('returns undefined when neither header nor JWT identity present', () => {
    expect(
      resolveSubmitterUserIdFromAuth(undefined, undefined),
    ).toBeUndefined();
  });
});
