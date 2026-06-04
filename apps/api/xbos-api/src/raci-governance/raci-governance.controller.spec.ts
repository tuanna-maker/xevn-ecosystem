import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';
import { RaciGovernanceController } from './raci-governance.controller';
import { RaciGovernanceService } from './raci-governance.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('RaciGovernanceController (P1-FIX-RACI-SCOPE-01)', () => {
  let controller: RaciGovernanceController;

  const memberUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

  const serviceMock = {
    listCatalog: jest.fn().mockResolvedValue({ domains: [], activities: [], total: 0 }),
    getCompanyMatrix: jest.fn().mockResolvedValue({ company_id: memberUuid, rows: [] }),
    listCapabilities: jest.fn().mockResolvedValue({ items: [] }),
    getCoverage: jest.fn().mockResolvedValue({ company_id: memberUuid, activities_total: 0 }),
    upsertMatrixCell: jest.fn().mockResolvedValue({ id: 'cell-1', raci_letters: 'R' }),
  };

  const orgMock = {
    resolveLegalEntityPartition: jest.fn().mockResolvedValue({ tenantId: 'xe-du-lich', companyId: 'main' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaciGovernanceController],
      providers: [
        { provide: RaciGovernanceService, useValue: serviceMock },
        { provide: OrgFoundationService, useValue: orgMock },
      ],
    }).compile();
    controller = module.get<RaciGovernanceController>(RaciGovernanceController);
  });

  it('UC-RACI-01 UC-RACI-05: list RACI catalog version returns XBOS-RACI-200', async () => {
    const result = await controller.catalog('human_resources', 'xevn', undefined, 'test-key');
    expect(result.code).toBe('XBOS-RACI-200');
    expect(serviceMock.listCatalog).toHaveBeenCalledWith('xevn', 'human_resources');
  });

  it('UC-RACI-02: loads matrix for companies/main under group CEO JWT', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.matrix('main', undefined, 'xevn', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-RACI-200');
    expect(serviceMock.getCompanyMatrix).toHaveBeenCalledWith('xevn', 'main', undefined);
    expect(orgMock.resolveLegalEntityPartition).not.toHaveBeenCalled();
  });

  it('UC-RACI-02: loads matrix for member legal-entity UUID under group CEO JWT (C-QC02-04)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.matrix(
      memberUuid,
      undefined,
      'xevn',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-RACI-200');
    expect(orgMock.resolveLegalEntityPartition).toHaveBeenCalledWith(memberUuid);
    expect(serviceMock.getCompanyMatrix).toHaveBeenCalledWith('xe-du-lich', memberUuid, undefined);
  });

  it('rejects member UUID matrix when partition tenant mismatches member CEO JWT', async () => {
    orgMock.resolveLegalEntityPartition.mockResolvedValueOnce({ tenantId: 'xe-vtc', companyId: 'main' });
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    await expect(
      controller.matrix(memberUuid, undefined, 'xe-du-lich', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.getCompanyMatrix).not.toHaveBeenCalled();
  });

  it('UC-RACI-03: list capabilities returns XBOS-RACI-200', async () => {
    const result = await controller.capabilities('HRM-ONBOARD', 'xevn', undefined, 'test-key');
    expect(result.code).toBe('XBOS-RACI-200');
    expect(serviceMock.listCapabilities).toHaveBeenCalledWith('xevn', 'HRM-ONBOARD');
  });

  it('UC-RACI-04: upsert matrix cell uses resolved member partition + UUID company key', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.upsertCell(
      memberUuid,
      { activity_id: 'act-uuid-1', org_column_id: 'col_hcns', raci_letters: 'R' },
      'xevn',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-RACI-201');
    expect(serviceMock.upsertMatrixCell).toHaveBeenCalledWith('xe-du-lich', memberUuid, {
      activity_id: 'act-uuid-1',
      org_column_id: 'col_hcns',
      raci_letters: 'R',
      actor_id: undefined,
    });
  });

  it('UC-RACI-06: coverage report returns XBOS-RACI-200', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.coverage('main', 'xevn', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-RACI-200');
    expect(serviceMock.getCoverage).toHaveBeenCalledWith('xevn', 'main');
  });

  it('returns 404 when legal-entity UUID is unknown', async () => {
    orgMock.resolveLegalEntityPartition.mockResolvedValueOnce(null);
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await expect(
      controller.matrix(memberUuid, undefined, 'xevn', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'XBOS-RACI-404' });
  });
});
