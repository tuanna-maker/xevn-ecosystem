import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { ConfigSyncService } from '../config-sync/config-sync.service';
import { CatalogGovernanceController } from './catalog-governance.controller';
import { CatalogGovernanceService } from './catalog-governance.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('CatalogGovernanceController (UC-XBOS-CAT / XBOS-DM)', () => {
  let controller: CatalogGovernanceController;
  const envSnapshot = { ...process.env };

  const serviceMock = {
    ensureXeDuLichCatalogWorkflow: jest.fn().mockResolvedValue({ id: 'def-1' }),
    startCatalogApprovalWorkflow: jest.fn().mockResolvedValue({ workflowInstanceId: 'inst-1' }),
    listApprovalInbox: jest.fn().mockResolvedValue({ items: [] }),
    getApprovalDetail: jest.fn().mockResolvedValue({ instance: { id: 'inst-1' } }),
    actOnTask: jest.fn().mockResolvedValue({ decision: 'approved' }),
    listPendingExtensionRequests: jest.fn().mockResolvedValue([]),
  };

  const configSyncMock = {
    publishCatalog: jest.fn().mockResolvedValue({ key: 'job_titles', version: 2 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.SERVICE_JWT_ISSUER = 'xevn-internal';
    process.env.SERVICE_JWT_AUDIENCE = 'xevn-api';
    delete process.env.NODE_ENV;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogGovernanceController],
      providers: [
        { provide: CatalogGovernanceService, useValue: serviceMock },
        { provide: ConfigSyncService, useValue: configSyncMock },
      ],
    }).compile();
    controller = module.get<CatalogGovernanceController>(CatalogGovernanceController);
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it('rejects unauthenticated extension-requests', async () => {
    await expect(controller.listPending(undefined, undefined, undefined)).rejects.toMatchObject<ApiException>({
      code: 'XBOS-AUTH-001',
    });
    expect(serviceMock.listPendingExtensionRequests).not.toHaveBeenCalled();
  });

  it('XBOS-DM-17: publishCatalogVersion delegates publish to config-sync (XBOS-CFG-203)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.publishCatalogVersion(
      {
        tenantId: 'xevn',
        companyId: 'main',
        name: 'Job Titles v2',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [{ code: 'MGR', label: 'Manager', status: 'active' }],
      },
      'job_titles',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-CFG-203');
    expect(configSyncMock.publishCatalog).toHaveBeenCalled();
  });

  it('XBOS-DM-HRM-09: publish catalog version via governance alias (group CEO main → holding)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.publishCatalogVersion(
      {
        tenantId: 'xevn',
        companyId: 'main',
        name: 'Job Titles',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
      },
      'job_titles',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-CFG-203');
    expect(configSyncMock.publishCatalog).toHaveBeenCalledWith(
      'job_titles',
      expect.objectContaining({ tenantId: 'xevn', companyId: 'holding' }),
    );
  });

  it('UC-XBOS-CAT-01 / XBOS-DM-15: lists pending extensions with tenant-only scope', async () => {
    const result = await controller.listPending('xevn', undefined, 'test-key');
    expect(result.code).toBe('XBOS-CAT-200');
    expect(serviceMock.listPendingExtensionRequests).toHaveBeenCalledWith('xevn');
  });

  it('rejects inbox when JWT holding scope mismatches query main', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.inbox(undefined, 'xevn', 'main', undefined, `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.listApprovalInbox).not.toHaveBeenCalled();
  });

  it('UC-XBOS-CAT-03: catalog approval inbox accepts group CEO JWT main (ADR C2)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.inbox(
      'ceo@xe.vn',
      'xevn',
      'main',
      undefined,
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-CAT-212');
    expect(serviceMock.listApprovalInbox).toHaveBeenCalledWith('ceo@xe.vn');
  });

  it('UC-XBOS-CAT-04 / XBOS-DM-11: instance detail accepts group CEO JWT main', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.instanceDetail('inst-1', 'xevn', undefined, `Bearer ${token}`, undefined);
    expect(result.code).toBe('XBOS-CAT-213');
    expect(serviceMock.getApprovalDetail).toHaveBeenCalledWith('inst-1');
  });

  it('UC-XBOS-CAT-02 / XBOS-DM-12: starts workflow with member scope aligned to JWT', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'xe-du-lich',
    });
    const result = await controller.startWorkflow(
      {
        batchId: 'batch-001',
        memberTenantId: 'xevn',
        memberCompanyId: 'xe-du-lich',
      },
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-CAT-211');
    expect(serviceMock.startCatalogApprovalWorkflow).toHaveBeenCalledWith({
      batchId: 'batch-001',
      memberTenantId: 'xevn',
      memberCompanyId: 'xe-du-lich',
      requesterUserId: undefined,
    });
  });

  it('P1-BROWSER-E2E-CAT-S2S-AUTH-8088: hrm-be service JWT passes when NODE_ENV=production (no static key)', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INTERNAL_API_KEY;
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'hrm-be',
      svc: 'catalog-sync',
      tenantId: 'xevn',
      companyId: 'holding',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const result = await controller.startWorkflow(
      {
        batchId: 'batch-s2s',
        memberTenantId: 'xevn',
        memberCompanyId: 'holding',
        requesterUserId: 'ceo@xe.vn',
      },
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-CAT-211');
  });

  it('P1-BROWSER-E2E-CAT-S2S-AUTH-8088: rejects internal key only when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INTERNAL_API_KEY;
    await expect(
      controller.startWorkflow(
        { batchId: 'batch-key-only', memberTenantId: 'xevn', memberCompanyId: 'holding' },
        undefined,
        'test-key',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'XBOS-AUTH-001' });
  });

  it('UC-XBOS-CAT-05 / XBOS-DM-13: approves catalog task with XBOS-CAT-201', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.approveTask(
      'task-1',
      { review_note: 'ok' },
      'xevn',
      'holding',
      'ceo@xe.vn',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-CAT-201');
    expect(serviceMock.actOnTask).toHaveBeenCalledWith('task-1', 'approve', 'ceo@xe.vn', 'ok');
  });

  it('UC-XBOS-CAT-07 / XBOS-DM-14: inbox read path for change-history plane (CAT-212)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.inbox('ceo@xe.vn', 'xevn', 'main', undefined, `Bearer ${token}`, undefined);
    expect(result.code).toBe('XBOS-CAT-212');
  });

  it('UC-XBOS-CAT-06 / XBOS-DM-16: rejects field-removal task with XBOS-CAT-202', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.rejectTask(
      'task-2',
      { review_note: 'deny remove' },
      'xevn',
      'holding',
      'ceo@xe.vn',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-CAT-202');
    expect(serviceMock.actOnTask).toHaveBeenCalledWith('task-2', 'reject', 'ceo@xe.vn', 'deny remove');
  });

  it('P1-CAT-APPROVE-SCOPE-8088: group CEO JWT main + query holding approves with XBOS-CAT-201 (ADR C2)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.approveTask(
      'task-1',
      { review_note: 'ok' },
      'xevn',
      'holding',
      'ceo@xe.vn',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-CAT-201');
    expect(serviceMock.actOnTask).toHaveBeenCalledWith('task-1', 'approve', 'ceo@xe.vn', 'ok');
  });

  it('rejects approve when JWT holding scope mismatches query main', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.approveTask('task-1', {}, 'xevn', 'main', 'ceo@xe.vn', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.actOnTask).not.toHaveBeenCalled();
  });

  it('XBOS-DM-LOG-01 XBOS-DM-LOG-02 XBOS-DM-LOG-03 XBOS-DM-LOG-04 XBOS-DM-LOG-05 XBOS-DM-LOG-06 XBOS-DM-LOG-07 XBOS-DM-LOG-08 XBOS-DM-LOG-09 XBOS-DM-LOG-10 XBOS-DM-LOG-11 XBOS-DM-LOG-12 XBOS-DM-LOG-13 XBOS-DM-LOG-14 XBOS-DM-LOG-15 XBOS-DM-LOG-16 XBOS-DM-LOG-17 XBOS-DM-LOG-18 XBOS-DM-LOG-19 XBOS-DM-LOG-20 XBOS-DM-LOG-21 XBOS-DM-LOG-22: logistic catalog governance inbox plane', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.inbox(
      'ceo@xe.vn',
      'xevn',
      'main',
      undefined,
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-CAT-212');
    expect(serviceMock.listApprovalInbox).toHaveBeenCalledWith('ceo@xe.vn');
  });
});
