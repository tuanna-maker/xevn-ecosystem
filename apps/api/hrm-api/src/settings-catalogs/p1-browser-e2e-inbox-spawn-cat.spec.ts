import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

/** P1-BROWSER-E2E-INBOX-08-09 — UF-XBOS-09/15 catalog extension → governance inbox (U64). */
describe('P1-BROWSER-E2E-INBOX-09 UF-XBOS-09 catalog workflow bridge', () => {
  let catalogSync: CatalogSyncService;
  let bridge: XbosCatalogWorkflowBridge;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.XBOS_API_URL = 'http://127.0.0.1:28002';
    catalogSync = new CatalogSyncService({ query: jest.fn() } as never);
    bridge = new XbosCatalogWorkflowBridge(catalogSync);
  });

  it('shouldStartCatalogWorkflow accepts group CEO xevn/main path from Command Center', () => {
    expect(bridge.shouldStartCatalogWorkflow('xevn', 'main')).toBe(true);
    expect(bridge.shouldStartCatalogWorkflow('xevn', 'holding')).toBe(true);
    expect(bridge.shouldStartCatalogWorkflow('xe-du-lich', 'main')).toBe(true);
  });

  it('shouldStartCatalogWorkflow rejects unrelated tenant partitions', () => {
    expect(bridge.shouldStartCatalogWorkflow('xe-tmdv', 'main')).toBe(false);
    expect(bridge.shouldStartCatalogWorkflow('xevn', 'logistics')).toBe(false);
  });

  it('startCatalogWorkflowIfConfigured posts to catalog-governance for xevn/holding batch', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { workflowInstanceId: 'inst-cat-1' } }),
    } as Response);

    const out = await bridge.startCatalogWorkflowIfConfigured(
      'batch-uf15',
      'xevn',
      'holding',
      'ceo@xe.vn',
    );

    expect(out).toEqual({ workflowInstanceId: 'inst-cat-1' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/xbos/catalog-governance/workflows/start'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
        body: expect.stringContaining('"batchId":"batch-uf15"'),
      }),
    );
    const body = JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit)?.body));
    expect(body).toMatchObject({
      batchId: 'batch-uf15',
      memberTenantId: 'xevn',
      memberCompanyId: 'holding',
      requesterUserId: 'ceo@xe.vn',
    });
  });
});
