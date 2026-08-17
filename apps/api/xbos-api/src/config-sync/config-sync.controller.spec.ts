import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ConfigSyncController } from './config-sync.controller';
import { ConfigSyncService } from './config-sync.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('ConfigSyncController', () => {
  let controller: ConfigSyncController;

  const serviceMock = {
    bootstrapXevnGroupConfig: jest.fn().mockResolvedValue({ seeded_catalogs: 3 }),
    publishCatalog: jest.fn().mockResolvedValue({ key: 'job_titles', version: 2 }),
    applyCatalogToMembers: jest.fn().mockResolvedValue({
      catalogKey: 'job_titles',
      appliedCount: 1,
      applied: [{ tenantId: 'xe-du-lich', companyId: 'main', version: 1, checksum: 'sha256:x' }],
    }),
    cloneCatalog: jest.fn().mockResolvedValue({
      catalogKey: 'job_titles',
      onConflict: 'reject',
      source: { tenantId: 'xevn', companyId: 'holding', version: 4, checksum: 'sha256:s', itemCount: 2 },
      dest: { tenantId: 'xe-du-lich', companyId: 'main', version: 1, checksum: 'sha256:d', itemCount: 2 },
    }),
    cloneCatalogBundle: jest.fn().mockResolvedValue({
      copiedCount: 2,
      skippedCount: 0,
      domains: ['logistics'],
      source: { tenantId: 'xevn', companyId: 'holding' },
      dest: { tenantId: 'xevn', companyId: 'logistics' },
    }),
    getCatalogForTarget: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    listCatalogsForTarget: jest.fn().mockResolvedValue({ total: 1, target: 'hrm', data: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigSyncController],
      providers: [{ provide: ConfigSyncService, useValue: serviceMock }],
    }).compile();
    controller = module.get<ConfigSyncController>(ConfigSyncController);
  });

  it('rejects bootstrap without auth/internal key', async () => {
    await expect(controller.bootstrapXevn(undefined, undefined)).rejects.toThrow(
      'Unauthorized bootstrap access',
    );
    expect(serviceMock.bootstrapXevnGroupConfig).not.toHaveBeenCalled();
  });

  it('UC-XBOS-SYNC-01 / UC-ECO-MASTER-02: bootstrap with internal key returns XBOS-CFG-200', async () => {
    const result = await controller.bootstrapXevn(undefined, 'test-key');
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-200');
    expect(serviceMock.bootstrapXevnGroupConfig).toHaveBeenCalled();
  });

  it('requires auth for catalog publish', async () => {
    await expect(
      controller.publishCatalog(
        'job_titles',
        {
          tenantId: 'xevn',
          companyId: 'vtc',
          name: 'Job Titles',
          domain: 'human_resources',
          assignedTo: ['hrm'],
          items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
        },
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Unauthorized bootstrap access');
    expect(serviceMock.publishCatalog).not.toHaveBeenCalled();
  });

  it('UC-XBOS-04: list catalogs overview returns XBOS-CFG-202', async () => {
    const result = await controller.listCatalogsForSystem('hrm', 'xevn', 'vtc', undefined, 'test-key');
    expect(result.code).toBe('XBOS-CFG-202');
  });

  it('XBOS-DM-01 XBOS-DM-02 XBOS-DM-03 XBOS-DM-04 XBOS-DM-05 XBOS-DM-06 XBOS-DM-07 XBOS-DM-08 XBOS-DM-09 UC-XBOS-02 UC-XBOS-05: publish shared catalog contract returns XBOS-CFG-203', async () => {
    const result = await controller.publishCatalog(
      'job_titles',
      {
        tenantId: 'xevn',
        companyId: 'vtc',
        name: 'Job Titles',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [
          { code: 'CEO', label: 'CEO', status: 'active' },
          { code: 'MGR', label: 'Manager', status: 'inactive' },
        ],
      },
      undefined,
      'test-key',
    );
    expect(result.code).toBe('XBOS-CFG-203');
  });

  it('XBOS-DM-10: exports catalog via GET read path', async () => {
    const result = await controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', 'vtc', undefined, 'test-key');
    expect(result.code).toBe('XBOS-CFG-201');
  });

  it('XBOS-DM-17: publish catalog version returns XBOS-CFG-203', async () => {
    const result = await controller.publishCatalog(
      'job_titles',
      {
        tenantId: 'xevn',
        companyId: 'vtc',
        name: 'Job Titles',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
      },
      undefined,
      'test-key',
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-203');
    expect(serviceMock.publishCatalog).toHaveBeenCalledWith(
      'job_titles',
      expect.objectContaining({ assignedTo: ['hrm'] }),
    );
  });

  it('XBOS-DM-18: publish notifies assigned subsystems (HRM) with XBOS-CFG-203', async () => {
    const result = await controller.publishCatalog(
      'departments',
      {
        tenantId: 'xevn',
        companyId: 'vtc',
        name: 'Departments',
        domain: 'human_resources',
        assignedTo: ['hrm', 'xbos'],
        items: [{ code: 'HR', label: 'HR', status: 'active' }],
      },
      undefined,
      'test-key',
    );
    expect(result.code).toBe('XBOS-CFG-203');
    expect(serviceMock.publishCatalog).toHaveBeenCalledWith(
      'departments',
      expect.objectContaining({ assignedTo: expect.arrayContaining(['hrm']) }),
    );
  });

  it('rejects invalid target values', async () => {
    await expect(controller.getCatalogForSystem('job_titles', 'bad-target', 'xevn', 'vtc', undefined, 'test-key')).rejects.toThrow(
      'Invalid target. Use hrm, xbos, or web-portal',
    );
  });

  it('UC-XBOS-03: group CEO JWT main resolves catalog read to holding partition', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', 'main', `Bearer ${token}`, 'test-key');
    expect(serviceMock.getCatalogForTarget).toHaveBeenCalledWith('job_titles', 'hrm', 'xevn', 'holding');
  });

  it('PO-UC-TC-W3-BE-LOG09-SCOPE: group CEO JWT main GET catalog companyId=logistics (dest reload)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.getCatalogForSystem(
      'log_dm_1',
      'xbos',
      'xevn',
      'logistics',
      `Bearer ${token}`,
      'test-key',
    );
    expect(serviceMock.getCatalogForTarget).toHaveBeenCalledWith('log_dm_1', 'xbos', 'xevn', 'logistics');
  });

  it('UC-XBOS-03/04/UC-CC-P0-05: get/list catalogs return XBOS-CFG-201/202', async () => {
    const one = await controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', 'vtc', undefined, 'test-key');
    const many = await controller.listCatalogsForSystem('hrm', 'xevn', 'vtc', undefined, 'test-key');
    expect(one.code).toBe('XBOS-CFG-201');
    expect(many.code).toBe('XBOS-CFG-202');
  });

  it('rejects missing scope before service read', async () => {
    await expect(
      controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', '', undefined, 'test-key'),
    ).rejects.toThrow('companyId is required');
    expect(serviceMock.getCatalogForTarget).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch before service read', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    await expect(
      controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', 'other-company', `Bearer ${token}`, undefined),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.getCatalogForTarget).not.toHaveBeenCalled();
  });

  it('rejects publish when body companyId drifts from JWT holding scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.publishCatalog(
        'job_titles',
        {
          tenantId: 'xevn',
          companyId: 'main',
          name: 'Job Titles',
          domain: 'human_resources',
          assignedTo: ['hrm'],
          items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
        },
        `Bearer ${token}`,
        undefined,
      ),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.publishCatalog).not.toHaveBeenCalled();
  });

  it('publish passes JWT-aligned holding scope to service', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await controller.publishCatalog(
      'job_titles',
      {
        tenantId: 'xevn',
        companyId: 'holding',
        name: 'Job Titles',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
      },
      `Bearer ${token}`,
      'test-key',
    );
    expect(serviceMock.publishCatalog).toHaveBeenCalledWith(
      'job_titles',
      expect.objectContaining({ tenantId: 'xevn', companyId: 'holding' }),
    );
  });

  it('G-BM-REC-01: apply-to-members requires auth', async () => {
    await expect(
      controller.applyCatalogToMembers(
        'job_titles',
        {
          tenantId: 'xevn',
          companyId: 'holding',
          memberCompanyIds: ['vtc'],
        },
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Unauthorized bootstrap access');
    expect(serviceMock.applyCatalogToMembers).not.toHaveBeenCalled();
  });

  it('G-BM-REC-01: apply-to-members returns XBOS-CFG-204 and maps group JWT main→holding source', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.applyCatalogToMembers(
      'recruitment_channels',
      {
        tenantId: 'xevn',
        companyId: 'holding',
        targets: [{ tenantId: 'xe-du-lich', companyId: 'main' }],
        actor: 'group_ceo',
      },
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-204');
    expect(serviceMock.applyCatalogToMembers).toHaveBeenCalledWith(
      'recruitment_channels',
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'holding',
        targets: [{ tenantId: 'xe-du-lich', companyId: 'main' }],
        actor: 'group_ceo',
      }),
    );
  });

  it('XBOS-DM-LOG-09 HP: clone-bundle returns XBOS-CFG-205 and main→holding source', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.cloneCatalogBundle(
      {
        sourceTenantId: 'xevn',
        sourceCompanyId: 'main',
        destTenantId: 'xevn',
        destCompanyId: 'logistics',
        domains: ['logistics'],
        actor: 'ceo@xe.vn',
      },
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-205');
    expect(serviceMock.cloneCatalogBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceTenantId: 'xevn',
        sourceCompanyId: 'holding',
        destTenantId: 'xevn',
        destCompanyId: 'logistics',
        domains: ['logistics'],
      }),
    );
  });

  it('XBOS-DM-LOG-09 AU: member JWT forbidden on clone-bundle', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    await expect(
      controller.cloneCatalogBundle(
        {
          sourceTenantId: 'xevn',
          sourceCompanyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'logistics',
          domains: ['logistics'],
        },
        `Bearer ${token}`,
        'test-key',
      ),
    ).rejects.toThrow('Catalog bundle clone requires group catalog admin');
    expect(serviceMock.cloneCatalogBundle).not.toHaveBeenCalled();
  });

  it('XBOS-DM-LOG-09 AU: anonymous clone-bundle → XBOS-AUTH-001', async () => {
    await expect(
      controller.cloneCatalogBundle(
        {
          sourceTenantId: 'xevn',
          sourceCompanyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'logistics',
          domains: ['logistics'],
        },
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Unauthorized bootstrap access');
    expect(serviceMock.cloneCatalogBundle).not.toHaveBeenCalled();
  });

  it('XBOS-DM-09: clone requires auth', async () => {
    await expect(
      controller.cloneCatalog(
        'job_titles',
        {
          tenantId: 'xevn',
          companyId: 'holding',
          destTenantId: 'xe-du-lich',
          destCompanyId: 'main',
        },
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Unauthorized bootstrap access');
    expect(serviceMock.cloneCatalog).not.toHaveBeenCalled();
  });

  it('XBOS-DM-09 TC-DM09-CPY-HP-001: clone returns XBOS-CFG-206 and maps group JWT main→holding', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.cloneCatalog(
      'job_titles',
      {
        tenantId: 'xevn',
        companyId: 'holding',
        destTenantId: 'xe-du-lich',
        destCompanyId: 'main',
        actor: 'group_ceo',
      },
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-206');
    expect(serviceMock.cloneCatalog).toHaveBeenCalledWith(
      'job_titles',
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'holding',
        destTenantId: 'xe-du-lich',
        destCompanyId: 'main',
        actor: 'group_ceo',
      }),
    );
  });

  it('XBOS-DM-09 TC-DM09-CPY-AU-001: member JWT cannot clone (XBOS-AUTH-003)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    await expect(
      controller.cloneCatalog(
        'job_titles',
        {
          tenantId: 'xevn',
          companyId: 'holding',
          destTenantId: 'xe-tmdv',
          destCompanyId: 'main',
        },
        `Bearer ${token}`,
        'test-key',
      ),
    ).rejects.toMatchObject({ code: 'XBOS-AUTH-003' });
    expect(serviceMock.cloneCatalog).not.toHaveBeenCalled();
  });
});
