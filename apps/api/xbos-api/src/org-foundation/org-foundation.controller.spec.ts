import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { OrgFoundationController } from './org-foundation.controller';
import { OrgFoundationService } from './org-foundation.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('OrgFoundationController (UC-XBOS-ORG, ADR scope)', () => {
  let controller: OrgFoundationController;

  const serviceMock = {
    listLegalEntities: jest.fn().mockResolvedValue([]),
    resolveLegalEntityPartition: jest
      .fn()
      .mockResolvedValue({ tenantId: 'xe-du-lich', companyId: 'main' }),
    getLegalEntityById: jest.fn().mockResolvedValue({ id: 'le-member-1', code: 'VTC', name: 'VTC Corp' }),
    listOrgTree: jest.fn().mockResolvedValue([{ id: 'root', children: [] }]),
    listGroupOrgTreesForUser: jest.fn().mockResolvedValue([{ tenantId: 'xe-vtc', name: 'VTC', tree: [] }]),
    upsertLegalEntity: jest.fn().mockResolvedValue({ id: 'le-1' }),
    upsertOrgUnit: jest.fn().mockResolvedValue({ id: 'ou-1' }),
    deleteOrgUnit: jest.fn().mockResolvedValue({ id: 'ou-1' }),
    promoteSegment: jest.fn().mockResolvedValue({ segmentId: 'seg-1', legalEntity: { id: 'le-1' } }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgFoundationController],
      providers: [{ provide: OrgFoundationService, useValue: serviceMock }],
    }).compile();
    controller = module.get<OrgFoundationController>(OrgFoundationController);
  });

  it('rejects unauthenticated org tree', async () => {
    await expect(controller.orgTree(undefined, undefined, undefined, undefined)).rejects.toMatchObject<
      ApiException
    >({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.listOrgTree).not.toHaveBeenCalled();
  });

  it('rejects org tree when JWT holding scope mismatches header main (ADR §3.1)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.orgTree('xevn', 'main', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.listOrgTree).not.toHaveBeenCalled();
  });

  it('UC-CC-01 UC-XBOS-CC-08: loads org tree for department config per legal entity', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.orgTree('xevn', 'holding', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-ORG-200');
    expect(serviceMock.listOrgTree).toHaveBeenCalledWith('xevn', 'holding', undefined);
  });

  it('UC-XBOS-ORG-01: group CEO on master tenant loads aggregated member trees', async () => {
    serviceMock.listOrgTree.mockResolvedValueOnce([
      { tenantId: 'xe-vtc', name: 'VTC', tree: [{ id: 'ou-1', code: 'HCNS' }] },
    ]);
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.orgTree(undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-ORG-200');
    expect(result.data).toMatchObject({
      mode: 'group',
      tree: [{ id: 'ou-1', code: 'HCNS' }],
      groups: [{ tenantId: 'xe-vtc', name: 'VTC', tree: [{ id: 'ou-1', code: 'HCNS' }] }],
    });
    expect(serviceMock.listOrgTree).toHaveBeenCalledWith('xevn', 'holding', 'ceo@xe.vn');
  });

  it('loads org tree when group CEO JWT uses holding on member scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    const result = await controller.orgTree('xe-du-lich', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-ORG-200');
    expect(result.data).toMatchObject({ mode: 'single' });
    expect(serviceMock.listOrgTree).toHaveBeenCalledWith('xe-du-lich', 'main', undefined);
  });

  it('UC-XBOS-ORG-02: creates org unit under scoped tenant returns XBOS-ORG-201', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.createOrgUnit(
      { code: 'HCNS', name: 'Human Resources', parentId: null },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertOrgUnit).toHaveBeenCalledWith(
      'xevn',
      'holding',
      null,
      expect.objectContaining({ code: 'HCNS' }),
    );
  });

  it('P1-CC-BE-MEMBER-LEGAL-SAVE-01: group CEO PUT member legal entity with xe-du-lich scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const uiBody = {
      code: 'XE_DU_LICH',
      name: 'Công ty Du lịch',
      entityType: 'subsidiary',
      taxCode: '0123456789',
      establishedAt: '',
      charterCapital: 1_000_000_000,
      address: 'Hà Nội',
      payload: {
        companyForm: {
          shortName: 'XE_DU_LICH',
          nameVi: 'Công ty Du lịch',
          entityLevel: 'subsidiary',
          enterpriseCode: '1001',
        },
      },
    };
    const result = await controller.upsertLegalEntity(
      '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      uiBody,
      'xe-du-lich',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith(
      'xe-du-lich',
      'main',
      '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      expect.objectContaining({ code: 'XE_DU_LICH', payload: uiBody.payload }),
    );
  });

  it('P1-CC-BE-MEMBER-LEGAL-SAVE-01: group CEO PUT member legal entity with xe-tmdv scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.upsertLegalEntity(
      'le-member-tmdv',
      { code: 'XE_TMDV', name: 'X.E TM-DV Updated', taxCode: '0123456789' },
      'xe-tmdv',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith(
      'xe-tmdv',
      'main',
      'le-member-tmdv',
      expect.objectContaining({ code: 'XE_TMDV' }),
    );
  });

  it('UC-XBOS-ORG-03: upserts legal entity profile fields', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.upsertLegalEntity(
      'le-uuid-1',
      { code: 'VTC', name: 'VTC Corp', taxCode: '0123' },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith('xevn', 'holding', 'le-uuid-1', expect.any(Object));
  });

  it('UC-XBOS-10: promotes business segment via business-lines alias', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.promoteBusinessLine(
      { segmentId: 'seg-uuid', code: 'KD-01', name: 'Mảng KD 1' },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-202');
    expect(serviceMock.promoteSegment).toHaveBeenCalledWith('xevn', 'holding', 'seg-uuid', expect.any(Object));
  });

  it('UC-CC-03: loads legal entity by member UUID under group CEO JWT', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const memberId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    const result = await controller.getLegalEntity(memberId, 'xevn', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-ORG-200');
    expect(serviceMock.resolveLegalEntityPartition).toHaveBeenCalledWith(memberId);
    expect(serviceMock.getLegalEntityById).toHaveBeenCalledWith(memberId);
  });

  it('P1-CC-BE-FE-MEMBER-LEGAL-BROWSER-SAVE-01: group CEO GET member entity with xe-du-lich headers', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const memberId = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';
    const result = await controller.getLegalEntity(memberId, 'xe-du-lich', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-ORG-200');
    expect(serviceMock.resolveLegalEntityPartition).toHaveBeenCalledWith(memberId);
    expect(serviceMock.getLegalEntityById).toHaveBeenCalledWith(memberId);
  });

  it('P1-PHASE1-BE-SCOPE-P0-S5-01: member CEO GET other tenant legal-entity UUID returns 409', async () => {
    serviceMock.resolveLegalEntityPartition.mockResolvedValueOnce({
      tenantId: 'xe-vtc',
      companyId: 'main',
    });
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    const memberId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    await expect(
      controller.getLegalEntity(memberId, 'xe-du-lich', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.getLegalEntityById).not.toHaveBeenCalled();
  });

  it('P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01: browser-shaped PUT with root code/name returns 201 envelope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const browserBody = {
      code: 'XE_DU_LICH',
      name: 'QA L25 browser save retest 20260604',
      entityType: 'subsidiary',
      taxCode: '0123456789',
      charterCapital: 1_000_000_000,
      payload: {
        companyForm: {
          nameVi: 'QA L25 browser save retest 20260604',
          shortName: 'XE_DU_LICH',
          enterpriseCode: '0123456789',
          entityLevel: 'subsidiary',
        },
      },
    };
    const result = await controller.upsertLegalEntity(
      '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      browserBody,
      'xe-du-lich',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith(
      'xe-du-lich',
      'main',
      '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      expect.objectContaining({ code: 'XE_DU_LICH', name: browserBody.name }),
    );
  });

  it('P1-CC-BE-FE-MEMBER-LEGAL-BROWSER-SAVE-01: browser-shaped PUT with root code/name returns 201 envelope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const browserBody = {
      code: 'QA L25 browser save 20260604',
      name: 'QA L25 browser save 20260604',
      entityType: 'subsidiary',
      charterCapital: 1_000_000_000,
      taxCode: '1000000000',
      payload: {
        companyForm: {
          shortName: 'QA L25 browser save 20260604',
          nameVi: 'QA L25 browser save 20260604',
          enterpriseCode: '0312345678',
          entityLevel: 'subsidiary',
          parentEntityId: 'xbos-group-holding-root',
        },
      },
    };
    const result = await controller.upsertLegalEntity(
      '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      browserBody,
      'xe-du-lich',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith(
      'xe-du-lich',
      'main',
      '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      expect.objectContaining({ code: browserBody.code, name: browserBody.name }),
    );
  });

  it('UC-CC-P0-01: loads legal entities for member tenant with main scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    const result = await controller.listLegalEntities('xe-du-lich', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-ORG-200');
    expect(serviceMock.listLegalEntities).toHaveBeenCalledWith('xe-du-lich', 'main');
  });

  it('UC-CC-P0-03: does not delete org unit when scope mismatches', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.deleteOrgUnit('unit-1', 'xevn', 'main', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.deleteOrgUnit).not.toHaveBeenCalled();
  });
});
