import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';
import { TenantScopeService } from './tenant-scope.service';

describe('TenantScopeService (ADR group vs member)', () => {
  const dbMock = { query: jest.fn() };
  const orgMock = { listOrgTree: jest.fn(), listGroupMemberUnits: jest.fn() };
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

  it('groupOrgOverview loads member trees when master membership exists', async () => {
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
    orgMock.listOrgTree.mockResolvedValue([{ id: 'root' }]);
    const result = await service.groupOrgOverview('ceo@xe.vn');
    expect(result.masterTenantId).toBe('xevn');
    expect(result.trees).toHaveLength(1);
    expect(orgMock.listOrgTree).toHaveBeenCalledWith('xe-du-lich', 'main');
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
});
