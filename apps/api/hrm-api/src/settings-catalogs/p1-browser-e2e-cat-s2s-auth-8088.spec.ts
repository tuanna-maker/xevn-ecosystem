import { createHmac } from 'node:crypto';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

/** P1-BROWSER-E2E-CAT-S2S-AUTH-8088 — hrm-be bridge → xbos catalog-governance/workflows/start */
describe('P1-BROWSER-E2E-CAT-S2S-AUTH-8088 catalog workflow bridge auth', () => {
  const envSnapshot = { ...process.env };
  let catalogSync: CatalogSyncService;
  let bridge: XbosCatalogWorkflowBridge;

  beforeEach(() => {
    process.env = { ...envSnapshot };
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.SERVICE_JWT_ISSUER = 'xevn-internal';
    process.env.SERVICE_JWT_AUDIENCE = 'xevn-api';
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.XBOS_API_URL = 'http://127.0.0.1:28002';
    catalogSync = new CatalogSyncService({ query: jest.fn() } as never);
    bridge = new XbosCatalogWorkflowBridge(catalogSync);
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
    jest.restoreAllMocks();
  });

  function createJwt(payload: Record<string, unknown>, secret = 'xevn-dev-jwt-secret'): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
  }

  it('mints verified service JWT when NODE_ENV=production (static key alone would fail on xbos-be)', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INTERNAL_API_KEY;

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { workflowInstanceId: 'inst-prod-1' } }),
    } as Response);

    await bridge.startCatalogWorkflowIfConfigured('batch-s2s', 'xevn', 'holding', 'ceo@xe.vn');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toMatch(/^Bearer /);
    expect(getVerifiedInternalJwtPayload(headers.Authorization)).toMatchObject({
      sub: 'hrm-be',
      svc: 'catalog-sync',
      tenantId: 'xevn',
      companyId: 'holding',
    });
  });

  it('does not forward portal session JWT to catalog-governance start', async () => {
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
    const buildSpy = jest.spyOn(catalogSync, 'buildXbosUpstreamHeaders');
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { workflowInstanceId: 'inst-1' } }),
    } as Response);

    await bridge.startCatalogWorkflowIfConfigured('batch-1', 'xe-du-lich', 'main', 'du-lich.ceo@xe.vn');

    expect(buildSpy).toHaveBeenCalledWith(undefined, {
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    const outbound = buildSpy.mock.results[0]?.value as Record<string, string>;
    expect(outbound.Authorization).not.toBe(`Bearer ${portalSession}`);
  });
});
