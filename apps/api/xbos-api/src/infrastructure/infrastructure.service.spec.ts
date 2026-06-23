import { InfrastructureService } from './infrastructure.service';
import { XbosDbService } from '../db/xbos-db.service';
import { PlatformAuditService } from '../platform/platform-audit.service';

describe('InfrastructureService', () => {
  const db = { query: jest.fn() } as unknown as XbosDbService;
  const platformAudit = { emit: jest.fn().mockResolvedValue(undefined) } as unknown as PlatformAuditService;
  let service: InfrastructureService;

  const upsertRow = {
    tenant_id: 'xevn',
    company_id: 'holding',
    foundation_categories: [{ id: 'fcat-1', code: 'HT-01' }],
    sites: [{ id: 'inf-1', siteCode: 'KHO-01' }],
    block_title_overrides_by_entity: {},
    custom_blocks_by_entity: {},
    custom_field_defs_by_entity: {},
    foundation_categories_count: 1,
    sites_count: 1,
    custom_fields_count: 0,
    updated_at: '2026-06-06T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InfrastructureService(db, platformAudit);
    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE') || String(sql).includes('ALTER TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('CREATE INDEX')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('INSERT INTO public.xbos_infrastructure_settings')) {
        return Promise.resolve({ rows: [upsertRow] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it('upserts settings and emits platform audit with counts', async () => {
    const result = await service.upsertSettings('xevn', 'holding', {
      foundationCategories: [{ id: 'fcat-1', code: 'HT-01' }],
      sites: [{ id: 'inf-1', siteCode: 'KHO-01' }],
    });

    expect(result.stats.foundationCategories).toBe(1);
    expect(result.stats.sites).toBe(1);
    expect(platformAudit.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'holding',
        action: 'infrastructure.settings.upsert',
        entityType: 'xbos_infrastructure_settings',
        entityId: 'xevn:holding',
        payload: {
          foundationCategoriesCount: 1,
          sitesCount: 1,
          updatedAt: '2026-06-06T10:00:00.000Z',
        },
      }),
    );
  });
});
