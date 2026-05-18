import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../common/tenant.constants';
import { XbosDbService } from '../db/xbos-db.service';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';

export type AccessibleTenant = {
  tenantId: string;
  name: string;
  shortName: string;
  tenantKind: 'master' | 'member';
  roleCode: string;
  companyId: string;
  isMaster: boolean;
};

@Injectable()
export class TenantScopeService {
  constructor(
    private readonly db: XbosDbService,
    private readonly org: OrgFoundationService,
  ) {}

  async assertMembership(userId: string, tenantId: string) {
    const { rows } = await this.db.query(
      `SELECT 1 FROM public.xbos_user_tenant_membership
       WHERE user_id = $1 AND tenant_id = $2 AND status = 'active' LIMIT 1`,
      [userId, tenantId],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-TENANT-403', 'User has no access to this tenant', HttpStatus.FORBIDDEN, {
        userId,
        tenantId,
      });
    }
  }

  async listAccessible(userId: string): Promise<AccessibleTenant[]> {
    const { rows } = await this.db.query(
      `SELECT m.tenant_id, m.role_code, t.name, t.short_name, t.tenant_kind, t.default_company_id
       FROM public.xbos_user_tenant_membership m
       JOIN public.xbos_tenant_registry t ON t.tenant_id = m.tenant_id
       WHERE m.user_id = $1 AND m.status = 'active' AND t.status = 'active'
       ORDER BY CASE WHEN t.tenant_kind = 'master' THEN 0 ELSE 1 END, t.name`,
      [userId],
    );
    return rows.map((r) => {
      const tenantId = String((r as { tenant_id: string }).tenant_id);
      return {
        tenantId,
        name: String((r as { name: string }).name),
        shortName: String((r as { short_name: string }).short_name),
        tenantKind: (r as { tenant_kind: string }).tenant_kind as 'master' | 'member',
        roleCode: String((r as { role_code: string }).role_code),
        companyId: String((r as { default_company_id: string }).default_company_id || MEMBER_DEFAULT_COMPANY_ID),
        isMaster: isMasterTenant(tenantId),
      };
    });
  }

  /** Tenant master: tổng hợp org các tenant thành viên user được phép. */
  async groupOrgOverview(userId: string) {
    const accessible = await this.listAccessible(userId);
    const master = accessible.find((t) => t.isMaster);
    if (!master) {
      throw new ApiException('XBOS-TENANT-403', 'Group overview requires master tenant membership', HttpStatus.FORBIDDEN);
    }
    const members = accessible.filter((t) => !t.isMaster);
    const trees: Array<{ tenantId: string; name: string; roleCode: string; tree: unknown[] }> = [];
    for (const m of members) {
      trees.push({
        tenantId: m.tenantId,
        name: m.name,
        roleCode: m.roleCode,
        tree: await this.org.listOrgTree(m.tenantId, m.companyId),
      });
    }
    return { masterTenantId: MASTER_TENANT_ID, memberships: accessible, trees };
  }

  /**
   * Pháp nhân tập đoàn + từng tenant thành viên (seed từ JSON/Excel MTCV).
   * Chỉ user có membership tenant master mới xem được (cùng quy tắc group-org-overview).
   */
  async groupMemberUnits(userId: string) {
    const accessible = await this.listAccessible(userId);
    const masterMembership = accessible.find((t) => t.isMaster);
    if (!masterMembership) {
      throw new ApiException(
        'XBOS-TENANT-403',
        'Group member units require master tenant membership',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.org.listGroupMemberUnits();
  }

  resolveCompanyIdForTenant(tenantId: string, companyHint?: string): string {
    if (isMasterTenant(tenantId)) {
      return companyHint?.trim() || MASTER_TENANT_ID;
    }
    return MEMBER_DEFAULT_COMPANY_ID;
  }
}
