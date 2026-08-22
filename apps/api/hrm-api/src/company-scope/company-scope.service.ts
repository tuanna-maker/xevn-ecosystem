import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import {
  HrmListScopeContext,
  HRM_PILOT_OPERATING_COMPANY_ID,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmPersistTenantId,
} from '../common/hrm-list-scope';
import {
  HRM_GROUP_ROLLUP_TENANT_IDS,
  resolveHrmTenantDisplayNameVi,
} from '../common/hrm-tenant-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesService } from '../employees/employees.service';
import { EmployeeSummaryQueryDto } from '../employees/dto/employee-summary.query.dto';
import {
  generateInviteTempPassword,
} from '../hrm-admin/hrm-admin.service';
import { createHash, randomUUID } from 'node:crypto';

const COMPANY_SCOPE_ADMIN_ROLES = new Set([
  'platform_admin',
  'group_ceo',
  'subsidiary_ceo',
  'company_admin',
  'admin',
  'owner',
  'ceo',
]);

/** Resolve membership tenant from column or legacy OU company_id slug. */
export function membershipResolvedTenantSql(alias = 'm'): string {
  return `COALESCE(
    NULLIF(TRIM(${alias}.tenant_id), ''),
    CASE LOWER(TRIM(${alias}.company_id))
      WHEN 'holding' THEN 'xevn'
      WHEN 'trsport' THEN 'xe-tmdv'
      WHEN 'logistics' THEN 'visun'
      WHEN 'finance' THEN 'xe-du-lich'
      WHEN 'services' THEN 'xe-vietnam'
      ELSE NULL
    END
  )`;
}

@Injectable()
export class CompanyScopeService {
  constructor(
    private readonly db: HrmDbService,
    private readonly employeesService: EmployeesService,
  ) {}

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.user_company_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        company_id TEXT NOT NULL,
        tenant_id TEXT,
        role TEXT NOT NULL DEFAULT 'member',
        email TEXT,
        full_name TEXT,
        avatar_url TEXT,
        employee_id UUID,
        invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        invited_by TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      ALTER TABLE public.user_company_memberships
      ADD COLUMN IF NOT EXISTS tenant_id TEXT;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_user_company_memberships_tenant
      ON public.user_company_memberships (tenant_id)
      WHERE tenant_id IS NOT NULL AND TRIM(tenant_id) <> '';
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        email TEXT,
        full_name TEXT,
        password_hash TEXT,
        avatar_url TEXT,
        phone TEXT,
        job_title TEXT,
        onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.platform_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        email TEXT NOT NULL,
        granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        granted_by TEXT
      );
    `);
  }

  private async assertCompanyScopeAccess(authorization: string): Promise<string> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = getVerifiedInternalJwtPayload(authorization);
    if (!payload?.sub) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const callerKey = String(payload.sub);
    const roleCode = String(
      payload.roleCode ?? payload.role ?? '',
    ).toLowerCase();
    if (COMPANY_SCOPE_ADMIN_ROLES.has(roleCode)) {
      return callerKey;
    }
    await this.ensureSchema();
    const adminRes = await this.db.query<{ user_id: string }>(
      `
        SELECT user_id::text
        FROM public.platform_admins
        WHERE user_id::text = $1 OR LOWER(email) = LOWER($2)
        LIMIT 1;
      `,
      [callerKey, callerKey],
    );
    if (!adminRes.rows[0]) {
      throw new ApiException(
        'HRM-AUTH-002',
        'Not authorized for company scope management',
        HttpStatus.FORBIDDEN,
      );
    }
    return adminRes.rows[0].user_id;
  }

  private resolveScope(
    authorization: string | undefined,
    companyId: string,
    scopeContext?: HrmListScopeContext,
  ) {
    return resolveHrmListScope(authorization, companyId, scopeContext);
  }

  private assertTenantInScope(
    scope: ReturnType<typeof resolveHrmListScope>,
    tenantId: string,
  ) {
    const allowed = new Set(
      (scope.tenantIds ?? []).map((id) => id.trim().toLowerCase()),
    );
    const normalized = tenantId.trim().toLowerCase();
    if (!allowed.has(normalized)) {
      throw new ApiException(
        'HRM-SCOPE-409',
        'Resource tenant_id is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
  }

  async listScopedCompanies(
    authorization: string | undefined,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.assertCompanyScopeAccess(authorization ?? '');
    const companyId = HRM_PILOT_OPERATING_COMPANY_ID;
    const scope = this.resolveScope(authorization, companyId, scopeContext);
    const tenantIds =
      scope.tenantIds && scope.tenantIds.length > 0
        ? scope.tenantIds
        : scope.memberTenantId
          ? [scope.memberTenantId]
          : [];

    const summaryQuery = new EmployeeSummaryQueryDto();
    summaryQuery.company_id = companyId;
    const summary = await this.employeesService.getEmployeesSummary(
      summaryQuery,
      authorization,
      scopeContext,
    );
    const byTenant = new Map<string, number>();
    for (const row of summary.by_tenant ?? []) {
      byTenant.set(String(row.tenant_id).toLowerCase(), Number(row.total ?? 0));
    }

    const data = tenantIds.map((tenantId) => {
      const key = tenantId.trim().toLowerCase();
      const count = byTenant.get(key);
      return {
        id: key,
        tenant_id: key,
        company_id: companyId,
        name: resolveHrmTenantDisplayNameVi(key) ?? key,
        code: key,
        employee_count:
          typeof count === 'number' && Number.isFinite(count) ? count : null,
      };
    });

    return {
      total: data.length,
      data,
      rollup_total:
        scope.masterTenantPartition && Number.isFinite(summary.total)
          ? summary.total
          : null,
    };
  }

  async listScopedMemberships(
    authorization: string | undefined,
    companyId?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.assertCompanyScopeAccess(authorization ?? '');
    await this.ensureSchema();
    const resolvedCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      companyId?.trim() || HRM_PILOT_OPERATING_COMPANY_ID,
      scopeContext,
    );
    const scope = this.resolveScope(authorization, resolvedCompanyId, scopeContext);
    const tenantIds = (scope.tenantIds ?? []).map((id) => id.trim().toLowerCase());
    if (tenantIds.length === 0) {
      return { total: 0, data: [] };
    }

    const tenantExpr = membershipResolvedTenantSql('m');
    const res = await this.db.query(
      `
        SELECT m.*
        FROM public.user_company_memberships m
        WHERE ${tenantExpr} = ANY($1::text[])
        ORDER BY m.created_at DESC
        LIMIT 1000;
      `,
      [tenantIds],
    );
    return { total: res.rows.length, data: res.rows };
  }

  private async findOrCreatePortalUser(
    email: string,
    password: string | (() => string),
    fullName: string,
  ) {
    await this.ensureSchema();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.db.query<{ user_id: string }>(
      `SELECT user_id::text FROM public.profiles WHERE LOWER(email) = $1 LIMIT 1;`,
      [normalizedEmail],
    );
    if (existing.rows[0]) {
      return { userId: existing.rows[0].user_id, isExisting: true };
    }
    const plain = typeof password === 'function' ? password() : password;
    const userId = randomUUID();
    await this.db.query(
      `
        INSERT INTO public.profiles (user_id, email, full_name, password_hash)
        VALUES ($1::uuid, $2, $3, $4);
      `,
      [userId, normalizedEmail, fullName, this.hashPassword(plain)],
    );
    return { userId, isExisting: false };
  }

  async upsertScopedMembership(
    authorization: string | undefined,
    payload: {
      email: string;
      full_name: string;
      role: string;
      company_id: string;
      employee_id?: string | null;
      status?: string;
      tenant_id?: string;
    },
    scopeContext?: HrmListScopeContext,
  ) {
    await this.assertCompanyScopeAccess(authorization ?? '');
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
      scopeContext,
    );
    const scope = this.resolveScope(authorization, companyId, scopeContext);
    const tenantId =
      payload.tenant_id?.trim() ||
      resolveHrmPersistTenantId(authorization, companyId, scopeContext) ||
      scope.memberTenantId ||
      scope.tenantIds?.[0];
    if (!tenantId) {
      throw new ApiException(
        'HRM-SCOPE-409',
        'Cannot resolve tenant_id for membership',
        HttpStatus.CONFLICT,
      );
    }
    this.assertTenantInScope(scope, tenantId);

    const fullName = payload.full_name || payload.email.split('@')[0];
    const { userId } = await this.findOrCreatePortalUser(
      payload.email,
      () => generateInviteTempPassword(),
      fullName,
    );
    await this.db.query(
      `
        INSERT INTO public.user_company_memberships (
          user_id, company_id, tenant_id, role, email, full_name, employee_id, status, invited_by
        ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::uuid, COALESCE($8, 'active'), $9)
        ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
          tenant_id = EXCLUDED.tenant_id,
          role = EXCLUDED.role,
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          employee_id = EXCLUDED.employee_id,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *;
      `,
      [
        userId,
        companyId,
        tenantId.trim().toLowerCase(),
        payload.role,
        payload.email.trim().toLowerCase(),
        fullName,
        payload.employee_id ?? null,
        payload.status ?? 'active',
        'CompanyScope',
      ],
    );
    const listed = await this.db.query(
      `SELECT * FROM public.user_company_memberships WHERE user_id = $1::uuid AND company_id = $2 LIMIT 1;`,
      [userId, companyId],
    );
    return listed.rows[0];
  }

  async updateScopedMembership(
    authorization: string | undefined,
    membershipId: string,
    payload: {
      role?: string;
      employee_id?: string | null;
      status?: string;
      full_name?: string;
      email?: string;
    },
    scopeContext?: HrmListScopeContext,
  ) {
    await this.assertCompanyScopeAccess(authorization ?? '');
    await this.ensureSchema();
    const tenantExpr = membershipResolvedTenantSql('m');
    const existing = await this.db.query<Record<string, unknown>>(
      `SELECT m.*, ${tenantExpr} AS resolved_tenant_id
       FROM public.user_company_memberships m
       WHERE m.id = $1::uuid
       LIMIT 1;`,
      [membershipId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-COS-404',
        'Membership not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = this.resolveScope(
      authorization,
      String(row.company_id ?? HRM_PILOT_OPERATING_COMPANY_ID),
      scopeContext,
    );
    this.assertTenantInScope(scope, String(row.resolved_tenant_id ?? ''));

    const res = await this.db.query(
      `UPDATE public.user_company_memberships SET
        role = COALESCE($2, role),
        employee_id = CASE WHEN $3::text = '__unset__' THEN employee_id ELSE $3::uuid END,
        status = COALESCE($4, status),
        full_name = COALESCE($5, full_name),
        email = COALESCE($6, email),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        membershipId,
        payload.role ?? null,
        payload.employee_id === undefined ? '__unset__' : payload.employee_id,
        payload.status ?? null,
        payload.full_name ?? null,
        payload.email ?? null,
      ],
    );
    return res.rows[0];
  }

  async deleteScopedMembership(
    authorization: string | undefined,
    membershipId: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.assertCompanyScopeAccess(authorization ?? '');
    await this.ensureSchema();
    const tenantExpr = membershipResolvedTenantSql('m');
    const existing = await this.db.query<Record<string, unknown>>(
      `SELECT m.*, ${tenantExpr} AS resolved_tenant_id
       FROM public.user_company_memberships m
       WHERE m.id = $1::uuid
       LIMIT 1;`,
      [membershipId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-COS-404',
        'Membership not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = this.resolveScope(
      authorization,
      String(row.company_id ?? HRM_PILOT_OPERATING_COMPANY_ID),
      scopeContext,
    );
    this.assertTenantInScope(scope, String(row.resolved_tenant_id ?? ''));

    const res = await this.db.query(
      `DELETE FROM public.user_company_memberships WHERE id = $1::uuid RETURNING id;`,
      [membershipId],
    );
    return { id: res.rows[0]?.id ?? membershipId };
  }

  /** Exposed for tests — rollup tenant ids in scope. */
  rollupTenantIds(): readonly string[] {
    return HRM_GROUP_ROLLUP_TENANT_IDS;
  }
}
