import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { SettingsCatalogsController } from './settings-catalogs.controller';
import { SettingsCatalogsService } from './settings-catalogs.service';

/** UC: HRM-SC / XBOS-DM-HRM — settings catalogs */
describe('SettingsCatalogsController (HRM-SC / XBOS-DM-HRM)', () => {
  let controller: SettingsCatalogsController;

  const serviceMock = {
    getOverview: jest.fn().mockResolvedValue({ catalogs: [] }),
    appendExtensionItems: jest.fn().mockResolvedValue({ id: 'ext-1' }),
    submitExtensionItemsForApproval: jest.fn().mockResolvedValue({ message: 'submitted' }),
    requestFieldRemoval: jest.fn().mockResolvedValue({ id: 'rem-1' }),
    reviewExtensionBatch: jest.fn().mockResolvedValue({ batch_id: 'b1', status: 'approved' }),
    syncAllFromXbos: jest.fn().mockResolvedValue({ synced: 3 }),
    reviewExtensionRequest: jest.fn().mockResolvedValue({ id: 'ext-req-1', status: 'rejected' }),
    seedGroupEmployeeImportCatalogAllTenants: jest.fn().mockResolvedValue({ tenants: 1, seeded: true }),
    seedTenantPositionCatalogAllTenants: jest.fn().mockResolvedValue({ tenants: 2, seeded: true }),
    seedTourismFleetCatalog: jest.fn().mockResolvedValue({ tenant: 'xe-du-lich', seeded: true }),
    seedTenantPositionCatalog: jest.fn().mockResolvedValue({ seeded: true }),
    seedGroupEmployeeImportCatalog: jest.fn().mockResolvedValue({ seeded: true }),
    seedEmployeeProfileTemplate: jest.fn().mockResolvedValue({ seeded: true }),
    listExtensionRequests: jest.fn().mockResolvedValue([]),
    attachWorkflowToBatch: jest.fn().mockResolvedValue(undefined),
    upsertCatalogItem: jest.fn().mockResolvedValue({ upserted: 1 }),
    deleteCatalogItem: jest.fn().mockResolvedValue({ item_key: 'IT-1' }),
  };

  function createInternalJwt(payload: Record<string, unknown>) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
    const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsCatalogsController],
      providers: [{ provide: SettingsCatalogsService, useValue: serviceMock }],
    }).compile();
    controller = module.get<SettingsCatalogsController>(SettingsCatalogsController);
  });

  it('HRM-SC-01 / XBOS-DM-HRM-01: overview returns HRM-SET-200', async () => {
    const res = await controller.overview(undefined, 'test-key', 'xevn', 'main', undefined);
    expect(res.code).toBe('HRM-SET-200');
    expect(serviceMock.getOverview).toHaveBeenCalled();
  });

  it('XBOS-DM-HRM-02: employee profile six field groups via overview seed path', async () => {
    serviceMock.getOverview.mockResolvedValueOnce({
      catalogs: [{ key: 'employee_profile_groups', groups: 6 }],
    });
    const res = await controller.overview(undefined, 'test-key', 'xevn', 'holding', undefined);
    expect(res.code).toBe('HRM-SET-200');
    expect(serviceMock.getOverview).toHaveBeenCalled();
  });

  it('D16 policy freeze: internal holding read stays allow-200 on settings overview', async () => {
    const res = await controller.overview(undefined, 'test-key', 'xevn', 'holding', undefined);
    expect(res.code).toBe('HRM-SET-200');
    expect(serviceMock.getOverview).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('D16 policy boundary: JWT main with explicit holding query is rejected', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(() =>
      controller.overview(`Bearer ${token}`, 'test-key', 'xevn', undefined, 'holding'),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.getOverview).not.toHaveBeenCalledWith('xevn', 'holding');
  });

  it('XBOS-DM-HRM-10 / HRM-SC-02: sync-from-xbos returns HRM-SET-201', async () => {
    const res = await controller.syncFromXbos(undefined, 'test-key', 'xevn', 'holding');
    expect(res.code).toBe('HRM-SET-201');
    expect(serviceMock.syncAllFromXbos).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('EX-SA01-P0-01: sync-from-xbos maps group CEO main to holding partition', async () => {
    const res = await controller.syncFromXbos(undefined, 'test-key', 'xevn', 'main');
    expect(res.code).toBe('HRM-SET-201');
    expect(serviceMock.syncAllFromXbos).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('HRM-SC-03 / XBOS-DM-HRM-03: append extension items returns HRM-SET-209', async () => {
    const res = await controller.appendExtension(
      'job_titles',
      { items: [{ code: 'EXT1', label: 'Ext 1' }] },
      undefined,
      'test-key',
      'xevn',
      'holding',
    );
    expect(res.code).toBe('HRM-SET-209');
    expect(serviceMock.submitExtensionItemsForApproval).toHaveBeenCalled();
  });

  it('HRM-SC-04 / XBOS-DM-HRM-04: removal request returns HRM-SET-203', async () => {
    const res = await controller.requestFieldRemoval(
      'job_titles',
      { code: 'legacy_field', reason: 'unused' },
      undefined,
      'test-key',
      'xevn',
      'holding',
    );
    expect(res.code).toBe('HRM-SET-203');
    expect(serviceMock.requestFieldRemoval).toHaveBeenCalled();
  });

  it('HRM-SC-05 / XBOS-DM-HRM-05: batch review returns HRM-SET-222', async () => {
    const res = await controller.reviewBatch(
      'batch-1',
      { decision: 'approved', review_note: 'ok' },
      undefined,
      'test-key',
      'reviewer-1',
    );
    expect(res.code).toBe('HRM-SET-222');
    expect(serviceMock.reviewExtensionBatch).toHaveBeenCalled();
  });

  it('HRM-SC-06 reject extension returns HRM-SET-212', async () => {
    const res = await controller.rejectExtensionRequest(
      'ext-req-1',
      { review_note: 'duplicate codes' },
      undefined,
      'test-key',
      'reviewer-1',
    );
    expect(res.code).toBe('HRM-SET-212');
    expect(serviceMock.reviewExtensionRequest).toHaveBeenCalledWith(
      'ext-req-1',
      'rejected',
      'reviewer-1',
      'duplicate codes',
    );
  });

  it('HRM-SC-07 seed group employee import all returns HRM-SET-205', async () => {
    const res = await controller.seedGroupEmployeeImportAll(undefined, 'test-key');
    expect(res.code).toBe('HRM-SET-205');
    expect(serviceMock.seedGroupEmployeeImportCatalogAllTenants).toHaveBeenCalled();
  });

  it('HRM-SC-08 seed tenant position catalog all returns HRM-SET-208', async () => {
    const res = await controller.seedTenantPositionCatalogAll(undefined, 'test-key');
    expect(res.code).toBe('HRM-SET-208');
    expect(serviceMock.seedTenantPositionCatalogAllTenants).toHaveBeenCalled();
  });

  it('HRM-SC-09 seed tourism fleet returns HRM-SET-207', async () => {
    const res = await controller.seedTourismFleet(undefined, 'test-key');
    expect(res.code).toBe('HRM-SET-207');
    expect(serviceMock.seedTourismFleetCatalog).toHaveBeenCalled();
  });

  it('XBOS-DM-HRM-06: seed tenant position catalog returns HRM-SET-209', async () => {
    const res = await controller.seedTenantPositionCatalog(undefined, 'test-key', 'xevn', 'holding');
    expect(res.code).toBe('HRM-SET-209');
  });

  it('XBOS-DM-HRM-07: seed group employee import returns HRM-SET-206', async () => {
    const res = await controller.seedGroupEmployeeImport(undefined, 'test-key', 'xevn', 'holding');
    expect(res.code).toBe('HRM-SET-206');
  });

  it('XBOS-DM-HRM-08: assign HRM subsystem via sync-from-xbos', async () => {
    const res = await controller.syncFromXbos(undefined, 'test-key', 'xevn', 'holding');
    expect(res.code).toBe('HRM-SET-201');
  });

  it('XBOS-DM-HRM-11: list extension requests returns HRM-SET-210', async () => {
    const res = await controller.listExtensionRequests('pending', 'xevn', 'holding', undefined, 'test-key');
    expect(res.code).toBe('HRM-SET-210');
  });

  it('XBOS-DM-HRM-15: catalog change history via extension requests list', async () => {
    serviceMock.listExtensionRequests.mockResolvedValueOnce([
      { id: 'ext-hist-1', status: 'approved', catalog_key: 'job_titles' },
    ]);
    const res = await controller.listExtensionRequests('approved', 'xevn', 'holding', undefined, 'test-key');
    expect(res.code).toBe('HRM-SET-210');
    expect(serviceMock.listExtensionRequests).toHaveBeenCalled();
  });

  it('supports settings-catalog item C/U/D routes', async () => {
    const createRes = await controller.createCatalogItem(
      {
        company_id: 'main',
        category_key: 'job_levels',
        item_key: 'L1',
        item_name: 'Level 1',
      },
      undefined,
      'test-key',
      'xevn',
      'main',
    );
    const updateRes = await controller.updateCatalogItem(
      {
        company_id: 'main',
        category_key: 'job_levels',
        item_key: 'L1',
        item_name: 'Level 1 Updated',
      },
      undefined,
      'test-key',
      'xevn',
      'main',
    );
    const deleteRes = await controller.deleteCatalogItem(
      { company_id: 'main', category_key: 'job_levels', item_key: 'L1' },
      undefined,
      'test-key',
      'xevn',
      'main',
    );

    expect(createRes.code).toBe('HRM-SET-201');
    expect(updateRes.code).toBe('HRM-SET-202');
    expect(deleteRes.code).toBe('HRM-SET-200');
    expect(serviceMock.upsertCatalogItem).toHaveBeenCalledTimes(2);
    expect(serviceMock.deleteCatalogItem).toHaveBeenCalledTimes(1);
  });

  it('XBOS-DM-HRM-12: seed employee profile template returns HRM-SET-204', async () => {
    const res = await controller.seedEmployeeProfileTemplate(undefined, 'test-key', 'xevn', 'holding');
    expect(res.code).toBe('HRM-SET-204');
  });

  it('XBOS-DM-HRM-13: tourism fleet seed returns HRM-SET-207', async () => {
    const res = await controller.seedTourismFleet(undefined, 'test-key');
    expect(res.code).toBe('HRM-SET-207');
  });

  it('XBOS-DM-HRM-14: attach workflow to batch returns HRM-SET-221', async () => {
    const res = await controller.attachWorkflow(
      'batch-1',
      { workflowInstanceId: 'wf-1' },
      undefined,
      'test-key',
    );
    expect(res.code).toBe('HRM-SET-221');
  });

  it('blocks unauthorized settings-catalog access', () => {
    expect(() => controller.seedTourismFleet(undefined, undefined)).toThrow(
      'Unauthorized settings-catalog access',
    );
    expect(serviceMock.seedTourismFleetCatalog).not.toHaveBeenCalled();
  });
});
