import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  CatalogSyncService,
  mapXbosUpstreamException,
  resolveXbosCatalogPublishSourceCompanyId,
} from './catalog-sync.service';

describe('PO-UC-TC-W4-BE-AT12-L1-CREATE-CATALOG-PULL publish source', () => {
  it('maps master member OU store → XBOS holding SoT', () => {
    expect(resolveXbosCatalogPublishSourceCompanyId('xevn', 'trsport')).toBe('holding');
    expect(resolveXbosCatalogPublishSourceCompanyId('xevn', 'logistics')).toBe('holding');
    expect(resolveXbosCatalogPublishSourceCompanyId('xevn', 'finance')).toBe('holding');
    expect(resolveXbosCatalogPublishSourceCompanyId('xevn', 'services')).toBe('holding');
  });

  it('keeps holding and non-master partitions unchanged', () => {
    expect(resolveXbosCatalogPublishSourceCompanyId('xevn', 'holding')).toBe('holding');
    expect(resolveXbosCatalogPublishSourceCompanyId('xe-du-lich', 'main')).toBe('main');
    expect(resolveXbosCatalogPublishSourceCompanyId('xevn', 'main')).toBe('main');
  });
});

describe('PO-UC-TC-W4-BE-SYNC-XBOSS-500 catalog-sync upstream', () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    process.env = { ...envSnapshot };
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.SERVICE_JWT_ISSUER = 'xevn-internal';
    process.env.SERVICE_JWT_AUDIENCE = 'xevn-api';
    process.env.INTERNAL_API_KEY = 'xevn-dev-internal-key';
    process.env.MASTER_TENANT_ID = 'xevn';
    process.env.DEFAULT_COMPANY_ID = 'holding';
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
    jest.restoreAllMocks();
  });

  describe('mapXbosUpstreamException', () => {
    it('preserves ApiException codes', () => {
      const src = new ApiException('HRM-SYNC-002', 'miss', HttpStatus.NOT_FOUND);
      expect(mapXbosUpstreamException(src)).toBe(src);
    });

    it('maps fetch failed / ECONNREFUSED to HRM-SYNC-001 502', () => {
      for (const msg of ['fetch failed', 'connect ECONNREFUSED 127.0.0.1:28002', 'socket hang up']) {
        const mapped = mapXbosUpstreamException(new TypeError(msg));
        expect(mapped).toMatchObject({
          code: 'HRM-SYNC-001',
        });
        expect(mapped.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      }
    });
  });

  it('listRemoteCatalogsFromXbos maps network failure to HRM-SYNC-001 (not bare 500)', async () => {
    const service = new CatalogSyncService({ query: jest.fn() } as never);
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed')) as typeof fetch;
    try {
      await expect(service.listRemoteCatalogsFromXbos('xevn', 'holding')).rejects.toMatchObject({
        code: 'HRM-SYNC-001',
        status: HttpStatus.BAD_GATEWAY,
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('pullCatalogFromXbos fail-fasts on HRM-SYNC-001 without burning alias try-list', async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    const service = new CatalogSyncService(db as never);
    const originalFetch = global.fetch;
    const fetchMock = jest.fn().mockRejectedValue(new TypeError('fetch failed'));
    global.fetch = fetchMock as typeof fetch;
    try {
      await expect(
        service.pullCatalogFromXbos('decision_types', 'xevn', 'holding'),
      ).rejects.toMatchObject({
        code: 'HRM-SYNC-001',
        status: HttpStatus.BAD_GATEWAY,
      });
      // decision_types aliases include hr_decision_types — must NOT retry every alias on hard upstream.
      expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(3);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('AT12-L1-CREATE-CATALOG-PULL: listRemote for trsport queries XBOS companyId=holding', async () => {
    const service = new CatalogSyncService({ query: jest.fn() } as never);
    const originalFetch = global.fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          total: 1,
          target: 'hrm',
          tenantId: 'xevn',
          companyId: 'holding',
          data: [{ key: 'leave_types' }],
        },
      }),
    });
    global.fetch = fetchMock as typeof fetch;
    try {
      const out = await service.listRemoteCatalogsFromXbos('xevn', 'trsport');
      expect(out.data).toEqual([{ key: 'leave_types' }]);
    } finally {
      global.fetch = originalFetch;
    }
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('companyId=holding');
    expect(url).not.toContain('companyId=trsport');
  });

  it('AT12-L1-CREATE-CATALOG-PULL: pull leave_types for trsport reads holding, stores trsport', async () => {
    const inserts: Array<{ tenant: string; company: string; key: string }> = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const text = String(sql);
        if (text.includes('CREATE TABLE') || text.includes('ALTER TABLE') || text.includes('CREATE UNIQUE')) {
          return { rows: [] };
        }
        if (text.includes('INSERT INTO public.synced_catalogs')) {
          inserts.push({
            tenant: String(params?.[0] ?? ''),
            company: String(params?.[1] ?? ''),
            key: String(params?.[2] ?? ''),
          });
          return { rows: [] };
        }
        if (text.includes('INSERT INTO public.sync_audit_logs')) {
          return { rows: [] };
        }
        if (text.includes('SELECT catalog_key')) {
          return {
            rows: [
              {
                catalog_key: 'leave_types',
                source_system: 'xbos',
                version: 1,
                checksum: 'x',
                synced_at: new Date().toISOString(),
                payload: {
                  key: 'leave_types',
                  name: 'Loại nghỉ',
                  items: [{ code: 'LVT_01', label: 'Phép năm', status: 'active' }],
                },
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const service = new CatalogSyncService(db as never);
    const originalFetch = global.fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          data: {
            key: 'leave_types',
            name: 'Loại nghỉ',
            version: 1,
            items: [{ code: 'LVT_01', label: 'Phép năm', status: 'active' }],
          },
        },
      }),
    });
    global.fetch = fetchMock as typeof fetch;
    try {
      const row = await service.pullCatalogFromXbos('leave_types', 'xevn', 'trsport');
      expect(row.companyId).toBe('trsport');
      expect(row.key).toBe('leave_types');
    } finally {
      global.fetch = originalFetch;
    }
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('companyId=holding');
    expect(url).toContain('/catalog/leave_types');
    expect(inserts).toEqual([{ tenant: 'xevn', company: 'trsport', key: 'leave_types' }]);
  });
});
