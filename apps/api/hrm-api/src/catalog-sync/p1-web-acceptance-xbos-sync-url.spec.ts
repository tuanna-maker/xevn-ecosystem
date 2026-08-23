import { resolveXbosApiBaseUrl } from './catalog-sync.service';

/** UF-HRM-10 — HRM sync-from-xbos resolves XBOS API URL for docker/local */
describe('P1-WEB-ACCEPTANCE-FIX-WAVE-02 UF-HRM-10 resolveXbosApiBaseUrl', () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it('prefers explicit XBOS_API_URL', () => {
    process.env.XBOS_API_URL = 'http://custom-xbos:2999/';
    expect(resolveXbosApiBaseUrl()).toBe('http://custom-xbos:2999');
  });

  it('honors localhost XBOS_API_URL on host (not Docker) — SPAWN must not use deploy XBOS_BE_PORT=3002', () => {
    delete process.env.DOCKER;
    delete process.env.KUBERNETES_SERVICE_HOST;
    process.env.XBOS_API_URL = 'http://127.0.0.1:28002';
    process.env.XBOS_BE_PORT = '3002';
    expect(resolveXbosApiBaseUrl()).toBe('http://127.0.0.1:28002');
  });

  it('defaults to local 28002 when no override', () => {
    delete process.env.XBOS_API_URL;
    delete process.env.XEVN_XBOS_API_URL;
    delete process.env.XBOS_BE_PORT;
    expect(resolveXbosApiBaseUrl()).toBe('http://127.0.0.1:28002');
  });

  it('ignores localhost XBOS_API_URL when DOCKER=1 and uses xbos-be hostname', () => {
    process.env.XBOS_API_URL = 'http://127.0.0.1:28002';
    process.env.DOCKER = '1';
    process.env.XBOS_BE_PORT = '28002';
    expect(resolveXbosApiBaseUrl()).toBe('http://xbos-be:28002');
  });
});
