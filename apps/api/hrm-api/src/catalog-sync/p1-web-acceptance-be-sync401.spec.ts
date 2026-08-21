import { createHmac } from 'node:crypto';
import { CatalogSyncService } from './catalog-sync.service';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';

/** UF-HRM-10 / P1-WEB-ACCEPTANCE-BE-SYNC-401 — hrm-be → xbos-be upstream auth */
describe('P1-WEB-ACCEPTANCE-BE-SYNC-401 buildXbosUpstreamHeaders', () => {
  const envSnapshot = { ...process.env };
  let service: CatalogSyncService;

  beforeEach(() => {
    process.env = { ...envSnapshot };
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.SERVICE_JWT_ISSUER = 'xevn-internal';
    process.env.SERVICE_JWT_AUDIENCE = 'xevn-api';
    service = new CatalogSyncService({ query: jest.fn() } as never);
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  function createJwt(
    payload: Record<string, unknown>,
    secret = 'xevn-dev-jwt-secret',
  ): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${sig}`;
  }

  it('mints service JWT for config-sync even when portal caller JWT is present', () => {
    const portalSession = createJwt(
      {
        iss: 'xevn-auth',
        aud: 'xevn-portal',
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      'portal-login-secret',
    );
    const headers = service.buildXbosUpstreamHeaders(
      `Bearer ${portalSession}`,
      {
        tenantId: 'xevn',
        companyId: 'holding',
      },
    );
    expect(headers.Authorization).toMatch(/^Bearer /);
    expect(headers.Authorization).not.toBe(`Bearer ${portalSession}`);
    const payload = getVerifiedInternalJwtPayload(headers.Authorization);
    expect(payload).toMatchObject({
      sub: 'hrm-be',
      svc: 'catalog-sync',
      tenantId: 'xevn',
      companyId: 'holding',
    });
  });

  it('mints service JWT when NODE_ENV=production and no caller token', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INTERNAL_API_KEY;
    const headers = service.buildXbosUpstreamHeaders(undefined, {
      tenantId: 'xevn',
      companyId: 'holding',
    });
    expect(headers.Authorization).toMatch(/^Bearer /);
    const payload = getVerifiedInternalJwtPayload(headers.Authorization);
    expect(payload).toMatchObject({
      sub: 'hrm-be',
      svc: 'catalog-sync',
      tenantId: 'xevn',
      companyId: 'holding',
    });
  });

  it('listRemoteCatalogsFromXbos sends service Authorization on outbound fetch', async () => {
    const portalSession = createJwt(
      {
        iss: 'xevn-auth',
        aud: 'xevn-portal',
        sub: 'ceo@xe.vn',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      'portal-login-secret',
    );
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          total: 1,
          target: 'hrm',
          tenantId: 'xevn',
          companyId: 'holding',
          data: [{ key: 'job_titles' }],
        },
      }),
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as typeof fetch;
    try {
      await service.listRemoteCatalogsFromXbos(
        'xevn',
        'holding',
        `Bearer ${portalSession}`,
      );
    } finally {
      global.fetch = originalFetch;
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const authHeader = (init.headers as Record<string, string>).Authorization;
    expect(authHeader).toMatch(/^Bearer /);
    expect(authHeader).not.toBe(`Bearer ${portalSession}`);
    expect(getVerifiedInternalJwtPayload(authHeader)).toMatchObject({
      sub: 'hrm-be',
      svc: 'catalog-sync',
    });
  });
});
