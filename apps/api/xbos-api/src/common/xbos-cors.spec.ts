import {
  parseCorsAllowedOrigins,
  resolveXbosCorsOptions,
  shouldUseXbosCorsWhitelist,
} from './xbos-cors';

describe('resolveXbosCorsOptions', () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    delete process.env.NODE_ENV;
    delete process.env.CORS_ALLOWED_ORIGINS;
    delete process.env.SERVICE_JWT_SECRET;
  });

  afterAll(() => {
    process.env = env;
  });

  it('blocks reflect-any in local dev without whitelist (origin false)', () => {
    process.env.SERVICE_JWT_SECRET = 'replace_with_strong_secret';
    expect(resolveXbosCorsOptions()).toEqual({ origin: false, credentials: true });
  });

  it('whitelists when CORS_ALLOWED_ORIGINS is set (non-production)', () => {
    process.env.CORS_ALLOWED_ORIGINS =
      'https://14-225-217-232.nip.io,http://127.0.0.1:8088';
    expect(shouldUseXbosCorsWhitelist()).toBe(true);
    expect(resolveXbosCorsOptions()).toEqual({
      origin: ['https://14-225-217-232.nip.io', 'http://127.0.0.1:8088'],
      credentials: true,
    });
  });

  it('whitelists in production from CORS_ALLOWED_ORIGINS', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ALLOWED_ORIGINS = 'https://pilot.example';
    process.env.SERVICE_JWT_SECRET = 'a'.repeat(64);
    expect(resolveXbosCorsOptions()).toEqual({
      origin: ['https://pilot.example'],
      credentials: true,
    });
  });

  it('production without CORS_ALLOWED_ORIGINS is fail-closed (no evil reflect)', () => {
    process.env.NODE_ENV = 'production';
    process.env.SERVICE_JWT_SECRET = 'a'.repeat(64);
    expect(resolveXbosCorsOptions()).toEqual({ origin: false, credentials: true });
  });

  it('deployed JWT without NODE_ENV still uses whitelist when origins set', () => {
    process.env.SERVICE_JWT_SECRET = 'rotated-production-secret-hex';
    process.env.CORS_ALLOWED_ORIGINS = 'https://14-225-217-232.nip.io';
    expect(resolveXbosCorsOptions().origin).toEqual(['https://14-225-217-232.nip.io']);
  });

  it('parseCorsAllowedOrigins trims and drops empty entries', () => {
    process.env.CORS_ALLOWED_ORIGINS = ' https://a.test , ,https://b.test ';
    expect(parseCorsAllowedOrigins()).toEqual(['https://a.test', 'https://b.test']);
  });
});
