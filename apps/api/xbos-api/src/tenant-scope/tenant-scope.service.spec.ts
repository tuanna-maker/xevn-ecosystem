import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';
import { TenantScopeService } from './tenant-scope.service';

describe('TenantScopeService (ADR group vs member)', () => {
  const dbMock = { query: jest.fn() };
  const orgMock = {
    listOrgTree: jest.fn(),
    listGroupMemberUnits: jest.fn(),
    listGroupOrgTreesForUser: jest.fn(),
    listMemberLegalEntitiesForTenants: jest.fn(),
  };
  let service: TenantScopeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TenantScopeService(dbMock as unknown as XbosDbService, orgMock as unknown as OrgFoundationService);
  });

  it('groupOrgOverview rejects user without master membership (403 not 409)', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          tenant_id: 'xe-du-lich',
          role_code: 'ceo',
          name: 'Du lịch',
          short_name: 'DL',
          tenant_kind: 'member',
          default_company_id: 'main',
        },
      ],
    });
    await expect(service.groupOrgOverview('du-lich.ceo@xe.vn')).rejects.toMatchObject<ApiException>({
      code: 'XBOS-TENANT-403',
    });
    expect(orgMock.listOrgTree).not.toHaveBeenCalled();
  });

  it('groupOrgOverview loads holding + member trees when master membership exists', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          tenant_id: 'xevn',
          role_code: 'group_ceo',
          name: 'XeVN',
          short_name: 'XeVN',
          tenant_kind: 'master',
          default_company_id: 'main',
        },
      ],
    });
    orgMock.listGroupOrgTreesForUser.mockResolvedValue([
      { tenantId: 'xbos-group-holding-root', name: 'Tập đoàn XeVN', tree: [{ id: 'ou-holding' }] },
      {
        tenantId: '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
        name: 'Du lịch',
        memberTenantId: 'xe-du-lich',
        tree: [{ id: 'ou-dl' }],
      },
    ]);
    const result = await service.groupOrgOverview('ceo@xe.vn');
    expect(result.masterTenantId).toBe('xevn');
    expect(result.trees).toHaveLength(2);
    expect(result.trees[0]?.tenantId).toBe('xbos-group-holding-root');
    expect(result.trees[1]?.tenantId).toBe('11d2bb7b-6190-4cb4-b0fe-03d43b5596b8');
    expect(orgMock.listGroupOrgTreesForUser).toHaveBeenCalledWith('ceo@xe.vn');
    expect(orgMock.listOrgTree).not.toHaveBeenCalled();
  });

  it('UC-ECO-MASTER-02: listAccessible query is membership-scoped (no cross-tenant fan-out)', async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });
    await service.listAccessible('ceo@xe.vn');
    const sql = String(dbMock.query.mock.calls[0][0]);
    expect(sql).toContain('xbos_user_tenant_membership');
    expect(sql).toContain('m.user_id = $1');
    expect(sql).toContain('xbos_tenant_registry');
  });

  it('assertMembership throws XBOS-TENANT-403 when row missing', async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });
    try {
      await service.assertMembership('user@xe.vn', 'other-tenant');
      fail('expected forbidden');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('XBOS-TENANT-403');
      expect((error as ApiException).getStatus()).toBe(HttpStatus.FORBIDDEN);
    }
  });

  it('groupMemberUnits allows group CEO JWT when master membership row missing (P1-UIUX-FE-FOUNDATION-01-BE-403)', async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ '1': 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            tenant_id: 'xevn',
            role_code: 'group_ceo',
            name: 'XeVN',
            short_name: 'XeVN',
            tenant_kind: 'master',
            default_company_id: 'main',
          },
        ],
      });
    orgMock.listGroupMemberUnits.mockResolvedValue({ holding: {}, members: [] });

    const result = await service.groupMemberUnits('ceo@xe.vn', {
      tenantId: 'xevn',
      roleCode: 'group_ceo',
    });

    expect(result).toEqual({ holding: {}, members: [] });
    expect(orgMock.listGroupMemberUnits).toHaveBeenCalled();
  });

  it('groupMemberUnits rejects member CEO without master membership or group JWT', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          tenant_id: 'xe-du-lich',
          role_code: 'subsidiary_ceo',
          name: 'Du lịch',
          short_name: 'DL',
          tenant_kind: 'member',
          default_company_id: 'main',
        },
      ],
    });

    await expect(
      service.groupMemberUnits('du-lich.ceo@xe.vn', {
        tenantId: 'xe-du-lich',
        roleCode: 'subsidiary_ceo',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'XBOS-TENANT-403' });
    expect(orgMock.listGroupMemberUnits).not.toHaveBeenCalled();
  });

  it('groupMemberUnits loads units when master membership exists', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          tenant_id: 'xevn',
          role_code: 'group_ceo',
          name: 'XeVN',
          short_name: 'XeVN',
          tenant_kind: 'master',
          default_company_id: 'main',
        },
      ],
    });
    orgMock.listGroupMemberUnits.mockResolvedValue({ members: [{ tenantId: 'xe-du-lich' }] });

    const result = await service.groupMemberUnits('ceo@xe.vn');
    expect(result).toEqual({ members: [{ tenantId: 'xe-du-lich' }] });
  });

  it('companyUnits returns member legal entities for subsidiary CEO (no master membership)', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          tenant_id: 'visun',
          role_code: 'subsidiary_ceo',
          name: 'Visun',
          short_name: 'VS',
          tenant_kind: 'member',
          default_company_id: 'main',
          modules: ['hrm'],
        },
      ],
    });
    orgMock.listMemberLegalEntitiesForTenants = jest.fn().mockResolvedValue([
      {
        tenant_id: 'visun',
        tenant_name: 'Công ty TNHH Du lịch Visun',
        tenant_short_name: 'VS',
        id: 'le-visun-1',
        code: 'VS',
        name: 'Công ty TNHH Du lịch Visun',
        entity_type: 'subsidiary',
        payload: null,
        tax_code: '0123456789',
        established_at: '2020-01-01',
        address: 'Hà Nội',
        business_lines: 'Du lịch',
      },
    ]);

    const result = await service.companyUnits('ceo2@xe.vn', {
      tenantId: 'visun',
      roleCode: 'subsidiary_ceo',
    });

    expect(result.holding).toBeNull();
    expect(result.members).toHaveLength(1);
    expect(result.members[0]?.tenant_id).toBe('visun');
    expect(orgMock.listMemberLegalEntitiesForTenants).toHaveBeenCalledWith(['visun']);
    expect(orgMock.listGroupMemberUnits).not.toHaveBeenCalled();
  });
});
