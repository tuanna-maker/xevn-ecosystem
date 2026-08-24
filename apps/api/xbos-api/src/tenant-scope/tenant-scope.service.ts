import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ensurePilotMembershipForUser } from '../auth/pilot-membership.bootstrap';
import { ApiException } from '../common/api.exception';
import { isGroupCeoOnMasterTenant } from '../common/xbos-group-legal-scope';
import { isMasterTenant, GROUP_HOLDING_ROOT_ID, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../common/tenant.constants';
import { XbosDbService } from '../db/xbos-db.service';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';
import { PlatformAuditService } from '../platform/platform-audit.service';

export type AccessibleTenant = {
  tenantId: string;
  name: string;
  shortName: string;
  tenantKind: 'master' | 'member';
  roleCode: string;
  companyId: string;
  isMaster: boolean;
  /** Enabled modules from xbos_tenant_registry.modules */
  modules: string[];
};

@Injectable()
export class TenantScopeService {
  constructor(
    private readonly db: XbosDbService,
    private readonly org: OrgFoundationService,
    private readonly audit: PlatformAuditService,
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
      `SELECT m.tenant_id, m.role_code, t.name, t.short_name, t.tenant_kind, t.default_company_id, t.modules
       FROM public.xbos_user_tenant_membership m
       JOIN public.xbos_tenant_registry t ON t.tenant_id = m.tenant_id
       WHERE m.user_id = $1 AND m.status = 'active' AND t.status = 'active'
       ORDER BY CASE WHEN t.tenant_kind = 'master' THEN 0 ELSE 1 END, t.name`,
      [userId],
    );
    return rows.map((r) => {
      const tenantId = String((r as { tenant_id: string }).tenant_id);
      const rawModules = (r as { modules: unknown }).modules;
      const modules = Array.isArray(rawModules)
        ? rawModules.map((m) => String(m).trim()).filter(Boolean)
        : [];
      return {
        tenantId,
        name: String((r as { name: string }).name),
        shortName: String((r as { short_name: string }).short_name),
        tenantKind: (r as { tenant_kind: string }).tenant_kind as 'master' | 'member',
        roleCode: String((r as { role_code: string }).role_code),
        companyId: String((r as { default_company_id: string }).default_company_id || MEMBER_DEFAULT_COMPANY_ID),
        isMaster: isMasterTenant(tenantId),
        modules,
      };
    });
  }

  /** Tenant master: tổng hợp org holding + pháp nhân thành viên (J-XBOS-07 / group-org-overview). */
  async groupOrgOverview(userId: string) {
    const accessible = await this.listAccessible(userId);
    const master = accessible.find((t) => t.isMaster);
    if (!master) {
      throw new ApiException('XBOS-TENANT-403', 'Group overview requires master tenant membership', HttpStatus.FORBIDDEN);
    }
    const roleByTenantId = new Map(accessible.map((t) => [t.tenantId, t.roleCode]));
    const rawTrees = await this.org.listGroupOrgTreesForUser(userId);
    const trees = rawTrees.map((entry) => ({
      tenantId: entry.tenantId,
      name: entry.name,
      roleCode:
        entry.tenantId === GROUP_HOLDING_ROOT_ID
          ? master.roleCode
          : roleByTenantId.get(entry.memberTenantId ?? '') ?? 'member',
      tree: entry.tree,
    }));
    return { masterTenantId: MASTER_TENANT_ID, memberships: accessible, trees };
  }

  /**
   * Pháp nhân tập đoàn + từng tenant thành viên (seed từ JSON/Excel MTCV).
   * Group CEO: master tenant membership OR verified JWT on xevn with group_* role (ADR scope).
   */
  async groupMemberUnits(
    userId: string,
    jwtContext?: { tenantId?: string; roleCode?: string },
  ) {
    let accessible = await this.listAccessible(userId);
    let masterMembership = accessible.find((t) => t.isMaster);
    const roleCode = (jwtContext?.roleCode ?? '').trim().toLowerCase();
    const jwtGroupCeo = isGroupCeoOnMasterTenant(jwtContext?.tenantId, roleCode);

    if (!masterMembership && jwtGroupCeo) {
      await ensurePilotMembershipForUser(this.db, userId);
      accessible = await this.listAccessible(userId);
      masterMembership = accessible.find((t) => t.isMaster);
    }

    if (!masterMembership && !jwtGroupCeo) {
      throw new ApiException(
        'XBOS-TENANT-403',
        'Group member units require master tenant membership',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.org.listGroupMemberUnits();
  }

  /**
   * Unified company units for HRM embed — group CEO gets full rollup; member CEO gets
   * only accessible member legal entities (AC-TOS-04 group-member-units 403 bypass).
   */
  async companyUnits(
    userId: string,
    jwtContext?: { tenantId?: string; roleCode?: string },
  ) {
    let accessible = await this.listAccessible(userId);
    let masterMembership = accessible.find((t) => t.isMaster);
    const roleCode = (jwtContext?.roleCode ?? '').trim().toLowerCase();
    const jwtGroupCeo = isGroupCeoOnMasterTenant(jwtContext?.tenantId, roleCode);

    if (!masterMembership && jwtGroupCeo) {
      await ensurePilotMembershipForUser(this.db, userId);
      accessible = await this.listAccessible(userId);
      masterMembership = accessible.find((t) => t.isMaster);
    }

    if (masterMembership || jwtGroupCeo) {
      return this.org.listGroupMemberUnits();
    }

    const memberTenants = accessible.filter((t) => !t.isMaster);
    if (memberTenants.length === 0) {
      throw new ApiException(
        'XBOS-TENANT-403',
        'No accessible company units for this user',
        HttpStatus.FORBIDDEN,
      );
    }

    const rows = await this.org.listMemberLegalEntitiesForTenants(
      memberTenants.map((t) => t.tenantId),
    );

    return {
      holding: null,
      members: rows.map((row) => ({
        tenant_id: String((row as { tenant_id: string }).tenant_id),
        tenant_name: String((row as { tenant_name: string }).tenant_name),
        tenant_short_name: String((row as { tenant_short_name: string }).tenant_short_name),
        id: String((row as { id: string }).id),
        code: String((row as { code: string }).code ?? ''),
        name: String((row as { name: string }).name ?? ''),
        entity_type: String((row as { entity_type: string }).entity_type ?? 'subsidiary'),
        payload: ((row as { payload: unknown }).payload ?? null) as Record<string, unknown> | null,
        tax_code: (row as { tax_code?: string | null }).tax_code ?? null,
        established_at: (row as { established_at?: string | null }).established_at ?? null,
        address: (row as { address?: string | null }).address ?? null,
        business_lines: (row as { business_lines?: string | null }).business_lines ?? null,
      })),
    };
  }

  resolveCompanyIdForTenant(tenantId: string, companyHint?: string): string {
    if (isMasterTenant(tenantId)) {
      return companyHint?.trim() || MASTER_TENANT_ID;
    }
    return MEMBER_DEFAULT_COMPANY_ID;
  }

  async createMemberTenant(userId: string, payload: any) {
    const tenantId = payload.tenantId || `t-${(payload.code || Date.now()).toString().toLowerCase()}`;
    const defaultCompanyId = payload.defaultCompanyCode || MEMBER_DEFAULT_COMPANY_ID;
    
    await this.db.query('BEGIN');
    try {
      // 1. Insert tenant registry
      await this.db.query(
        `INSERT INTO public.xbos_tenant_registry (tenant_id, name, short_name, tenant_kind, default_company_id, modules, status)
         VALUES ($1, $2, $3, 'member', $4, '["core", "hrm", "fin"]', 'active')`,
        [tenantId, payload.tenantName || payload.name || 'New Tenant', payload.shortName || '', defaultCompanyId]
      );

      // 2. Insert legal entity
      await this.db.query(
        `INSERT INTO public.xbos_legal_entity (id, tenant_id, company_id, code, name, entity_type, payload, status)
         VALUES (gen_random_uuid(), $1, $2, $2, $3, 'member_root', $4, 'active')`,
        [tenantId, defaultCompanyId, payload.tenantName || payload.name || 'New Tenant', { companyForm: payload }]
      );

      // 3. Insert membership for current user
      await this.db.query(
        `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, status)
         VALUES ($1, $2, 'admin', 'active')
         ON CONFLICT (user_id, tenant_id) DO UPDATE SET role_code = 'admin', status = 'active'`,
        [userId, tenantId]
      );
      
      // 4. (Optional) insert for adminEmail if provided
      const adminEmail = payload.adminEmail ? payload.adminEmail.trim().toLowerCase() : userId;
      if (adminEmail && adminEmail !== userId) {
        // Create user in xbos_portal_user if not exists
        if (payload.adminPassword) {
          const passwordHash = createHash('sha256')
            .update(`${adminEmail}:${payload.adminPassword}:xevn-portal-dev`)
            .digest('hex');
          await this.db.query(
            `INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
             VALUES ($1, 'Admin ' || $2, $3, 'active')
             ON CONFLICT (user_id) DO NOTHING`,
            [adminEmail, payload.tenantName || 'Tenant', passwordHash]
          );
        }
        
        await this.db.query(
          `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, status)
           VALUES ($1, $2, 'admin', 'active')
           ON CONFLICT (user_id, tenant_id) DO UPDATE SET role_code = 'admin', status = 'active'`,
          [adminEmail, tenantId]
        );
      }

      await this.db.query('COMMIT');

      const activatedAt = new Date().toISOString();
      await this.audit.emit({
        actor: userId,
        tenantId,
        action: 'TENANT_PROVISIONED',
        entityType: 'tenant',
        entityId: tenantId,
        payload: {
          eventType: 'TENANT_PROVISIONED',
          tenantId,
          defaultCompanyId,
          modules: ['core', 'hrm', 'fin'],
          activatedAt,
          issuedBy: adminEmail,
          adminEmail: adminEmail,
        },
      });

      return { tenantId, defaultCompanyId };
    } catch (e) {
      await this.db.query('ROLLBACK');
      throw e;
    }
  }
}
