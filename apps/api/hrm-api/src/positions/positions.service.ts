import { HttpStatus, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  MASTER_TENANT_ID,
  pushDepartmentTableScopeFilters,
  pushHrmTableScopeFilters,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmPersistTenantId,
  resolveHrmSettingsCatalogCompanyId,
  type HrmListScope,
  type HrmListScopeContext,
} from '../common/hrm-list-scope';
import {
  narrowHrmScopeToRequestTenant,
  resolveCatalogTenantIdsForRollup,
  shouldHrmGroupCeoTenantRollup,
} from '../common/hrm-tenant-rollup';
import { ensureHrmTenantIdColumns } from '../common/hrm-tenant-scope-schema';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  HRM_EMP_POSITION_DEPT_MISMATCH,
  HRM_EMP_POSITION_DEPT_REQUIRED,
  HRM_EMP_POSITION_KEY,
  HRM_POS_404,
  HRM_POS_409,
  HRM_POS_GRADE_INVALID,
  HRM_POS_GRADE_REQUIRED,
  type PayPositionScope,
} from './positions.constants';
import type {
  CreatePayPositionDto,
  UpdatePayPositionDto,
  UpsertDepartmentPositionDto,
} from './dto/positions.dto';

export type PayPositionRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  code: string;
  name: string;
  grade_code: string;
  position_scope: PayPositionScope;
  historical_note: string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DepartmentPositionRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  department_id: string;
  position_code: string;
  local_name: string | null;
  grade_code_override: string | null;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PayPositionDisplay = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  grade_code: string;
  position_scope: PayPositionScope;
  historical_note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DepartmentPositionDisplay = {
  id: string;
  department_id: string;
  position_code: string;
  local_name: string | null;
  grade_code_override: string | null;
  effective_name: string;
  effective_grade_code: string;
  position_scope: PayPositionScope;
  sort_order: number;
  status: string;
};

export type EffectivePositionOption = {
  code: string;
  label: string;
  grade_code: string;
  position_scope: PayPositionScope;
};

@Injectable()
export class PositionsService implements OnModuleInit {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_position (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        grade_code TEXT NOT NULL DEFAULT 'D1',
        position_scope TEXT NOT NULL DEFAULT 'department',
        historical_note TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, code)
      );
    `);
    await this.db.query(`
      ALTER TABLE public.pay_position
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS grade_code TEXT,
        ADD COLUMN IF NOT EXISTS position_scope TEXT NOT NULL DEFAULT 'department',
        ADD COLUMN IF NOT EXISTS historical_note TEXT,
        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'pay_position'
            AND column_name = 'department_id'
            AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE public.pay_position ALTER COLUMN department_id DROP NOT NULL;
        END IF;
      END $$;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'pay_position'
            AND column_name = 'title_name'
        ) THEN
          UPDATE public.pay_position
          SET name = COALESCE(NULLIF(TRIM(name), ''), NULLIF(TRIM(title_name), ''), code)
          WHERE name IS NULL OR TRIM(name) = '';
          ALTER TABLE public.pay_position DROP COLUMN title_name;
        END IF;
      END $$;
    `);
    await this.db.query(`
      UPDATE public.pay_position
      SET grade_code = COALESCE(NULLIF(TRIM(grade_code), ''), 'D1'),
          position_scope = COALESCE(NULLIF(TRIM(position_scope), ''), 'department'),
          status = COALESCE(NULLIF(TRIM(status), ''), 'active'),
          name = COALESCE(NULLIF(TRIM(name), ''), code)
      WHERE grade_code IS NULL
         OR TRIM(grade_code) = ''
         OR position_scope IS NULL
         OR TRIM(position_scope) = ''
         OR name IS NULL
         OR TRIM(name) = '';
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_position_tenant_company_code
      ON public.pay_position (tenant_id, company_id, code);
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_department_position_scope
      ON public.department_position (tenant_id, company_id, department_id, position_code);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_pay_position_scope
      ON public.pay_position (tenant_id, company_id, position_scope, status);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        parent_id UUID REFERENCES public.departments (id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        manager_name TEXT,
        manager_email TEXT,
        employee_count INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.department_position (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
        position_code TEXT NOT NULL,
        local_name TEXT NULL,
        grade_code_override TEXT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, department_id, position_code)
      );
    `);
    await ensureHrmTenantIdColumns((sql) => this.db.query(sql));
  }

  private mapPosition(row: PayPositionRow): PayPositionDisplay {
    return {
      id: row.id,
      company_id: row.company_id,
      code: row.code,
      name: row.name,
      grade_code: row.grade_code,
      position_scope: row.position_scope,
      historical_note: row.historical_note,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private positionSelect = `
    id, tenant_id, company_id, code, name, grade_code, position_scope,
    historical_note, status, archived_at, created_at, updated_at
  `;

  private pushPositionScopeFilters(
    filters: string[],
    values: unknown[],
    scope: HrmListScope,
  ) {
    pushHrmTableScopeFilters(filters, values, scope);
    filters.push(`archived_at IS NULL`);
  }

  private resolvePositionsListScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    rollupTenants: boolean | undefined,
    scopeContext?: HrmListScopeContext,
  ): { scope: HrmListScope; rollupByTenant: boolean } {
    const listScope = resolveHrmListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const rollupByTenant = shouldHrmGroupCeoTenantRollup(
      authorization,
      listScope,
      rollupTenants !== false,
    );
    const scope = rollupByTenant
      ? listScope
      : narrowHrmScopeToRequestTenant(
          listScope,
          authorization,
          requestedCompanyId,
          scopeContext,
        );
    return { scope, rollupByTenant };
  }

  private async getActiveJobTitleItems(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
    scope?: HrmListScope,
    rollupByTenant = false,
  ) {
    if (!this.settingsCatalogs) return [];
    const tenantIds = scope
      ? resolveCatalogTenantIdsForRollup(
          authorization,
          requestedCompanyId,
          scope,
          rollupByTenant,
          scopeContext,
        )
      : [
          scopeContext?.tenantId?.trim() ||
            resolveHrmPersistTenantId(
              authorization,
              requestedCompanyId,
              scopeContext,
            ) ||
            MASTER_TENANT_ID,
        ];
    const byCode = new Map<string, { code: string; label: string }>();
    for (const tenantId of tenantIds) {
      const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
        authorization,
        tenantId,
        requestedCompanyId.trim(),
      );
      const items = await this.settingsCatalogs.getEffectiveItemsForKey(
        tenantId,
        catalogCompanyId,
        'job_titles',
      );
      for (const item of items.filter((row) => row.status === 'active')) {
        byCode.set(item.code.toLowerCase(), item);
      }
    }
    return [...byCode.values()];
  }

  private jobTitleLabelByCode(
    items: Array<{ code: string; label: string }>,
    code: string,
  ): string {
    const hit = items.find(
      (item) => item.code.toLowerCase() === code.trim().toLowerCase(),
    );
    return hit?.label?.trim() || code.trim();
  }

  private mapJobTitlesToMasterDisplays(
    items: Array<{ code: string; label: string }>,
    companyId: string,
  ): PayPositionDisplay[] {
    return items.map((item) => ({
      id: `job_titles:${item.code}`,
      company_id: companyId,
      code: item.code,
      name: item.label,
      grade_code: 'D1',
      position_scope: 'department' as PayPositionScope,
      historical_note: null,
      status: 'active',
      created_at: '',
      updated_at: '',
    }));
  }

  /** Master catalog = job_titles ∪ pay_position (pay_position wins on code clash). */
  private async buildMergedMasterCatalog(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext: HrmListScopeContext | undefined,
    scope: HrmListScope,
    options?: {
      status?: string;
      position_scope?: PayPositionScope;
      q?: string;
      rollupByTenant?: boolean;
    },
  ): Promise<PayPositionDisplay[]> {
    const filters: string[] = [];
    const values: unknown[] = [];
    this.pushPositionScopeFilters(filters, values, scope);
    if (options?.status) {
      values.push(options.status);
      filters.push(`status = $${values.length}`);
    } else {
      filters.push(`status = 'active'`);
    }
    if (options?.position_scope) {
      values.push(options.position_scope);
      filters.push(`position_scope = $${values.length}`);
    }
    if (options?.q?.trim()) {
      values.push(`%${options.q.trim().toLowerCase()}%`);
      const p = values.length;
      filters.push(`(LOWER(code) LIKE $${p} OR LOWER(name) LIKE $${p})`);
    }

    const res = await this.db.query<PayPositionRow>(
      `SELECT ${this.positionSelect}
       FROM public.pay_position
       WHERE ${filters.join(' AND ')}
       ORDER BY code ASC`,
      values,
    );

    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const jobItems = await this.getActiveJobTitleItems(
      authorization,
      requestedCompanyId,
      scopeContext,
      scope,
      options?.rollupByTenant ?? false,
    );

    const byCode = new Map<string, PayPositionDisplay>();
    for (const item of jobItems) {
      byCode.set(
        item.code.toLowerCase(),
        this.mapJobTitlesToMasterDisplays([item], persistCompanyId)[0],
      );
    }
    for (const row of res.rows) {
      byCode.set(row.code.toLowerCase(), this.mapPosition(row));
    }

    let merged = Array.from(byCode.values());
    if (options?.position_scope) {
      merged = merged.filter(
        (item) => item.position_scope === options.position_scope,
      );
    }
    if (options?.q?.trim()) {
      const q = options.q.trim().toLowerCase();
      merged = merged.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q),
      );
    }
    merged.sort((a, b) => a.code.localeCompare(b.code));
    return merged;
  }

  private async provisionPayPositionFromJobTitle(
    positionCode: string,
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<PayPositionRow | null> {
    const items = await this.getActiveJobTitleItems(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const item = items.find(
      (row) => row.code.toLowerCase() === positionCode.trim().toLowerCase(),
    );
    if (!item) return null;

    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const tenantId =
      resolveHrmPersistTenantId(
        authorization,
        requestedCompanyId,
        scopeContext,
      ) ?? MASTER_TENANT_ID;
    const scope = resolveHrmListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const existing = await this.getPositionByCode(item.code, scope);
    if (existing) return existing;

    try {
      const res = await this.db.query<PayPositionRow>(
        `INSERT INTO public.pay_position (
          id, tenant_id, company_id, code, name, grade_code, position_scope
        ) VALUES ($1, $2, $3, $4, $5, 'D1', 'department')
        RETURNING ${this.positionSelect}`,
        [
          randomUUID(),
          tenantId,
          companyId,
          item.code.trim(),
          item.label.trim(),
        ],
      );
      return res.rows[0] ?? null;
    } catch (error: unknown) {
      const pgCode =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      if (pgCode === '23505') {
        return (await this.getPositionByCode(item.code, scope)) ?? null;
      }
      throw error;
    }
  }

  private async assertGradeCode(
    gradeCode: string | null | undefined,
    authorization: string | undefined,
    persistCompanyId: string,
    tenantId: string,
  ) {
    const code = gradeCode?.trim();
    if (!code) {
      throw new ApiException(
        HRM_POS_GRADE_REQUIRED,
        'grade_code là trường bắt buộc',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return code;
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenantId,
      persistCompanyId,
    );
    await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId,
      companyId: catalogCompanyId,
      catalogKey: 'job_grades',
      code,
      errorCode: HRM_POS_GRADE_INVALID,
      errorMessage: `Ngạch bậc '${code}' không tồn tại hoặc đã ngừng hoạt động`,
    });
    return code;
  }

  async countActivePositions(
    authorization: string | undefined,
    companyId: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<number> {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = [`status = 'active'`];
    const values: unknown[] = [];
    this.pushPositionScopeFilters(filters, values, scope);
    const res = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM public.pay_position WHERE ${filters.join(' AND ')}`,
      values,
    );
    return Number(res.rows[0]?.count ?? 0);
  }

  async listPositions(
    query: {
      company_id: string;
      status?: string;
      q?: string;
      position_scope?: PayPositionScope;
      rollup_tenants?: boolean;
    },
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, rollupByTenant } = this.resolvePositionsListScope(
      authorization,
      query.company_id,
      query.rollup_tenants,
      scopeContext,
    );
    const data = await this.buildMergedMasterCatalog(
      authorization,
      query.company_id,
      scopeContext,
      scope,
      {
        status: query.status,
        position_scope: query.position_scope,
        q: query.q,
        rollupByTenant,
      },
    );
    return { total: data.length, data };
  }

  async createPosition(
    payload: CreatePayPositionDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
      scopeContext,
    );
    const tenantId =
      resolveHrmPersistTenantId(
        authorization,
        payload.company_id,
        scopeContext,
      ) ?? MASTER_TENANT_ID;
    const code = payload.code.trim();
    const gradeCode = await this.assertGradeCode(
      payload.grade_code,
      authorization,
      companyId,
      tenantId,
    );
    const positionScope: PayPositionScope =
      payload.position_scope === 'company' ? 'company' : 'department';
    const id = randomUUID();
    try {
      const res = await this.db.query<PayPositionRow>(
        `INSERT INTO public.pay_position (
          id, tenant_id, company_id, code, name, grade_code, position_scope, historical_note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING ${this.positionSelect}`,
        [
          id,
          tenantId,
          companyId,
          code,
          payload.name.trim(),
          gradeCode,
          positionScope,
          payload.historical_note?.trim() ?? null,
        ],
      );
      return this.mapPosition(res.rows[0]);
    } catch (error: unknown) {
      const pgCode =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      if (pgCode === '23505') {
        throw new ApiException(
          HRM_POS_409,
          `Position code '${code}' already exists`,
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  async updatePosition(
    positionId: string,
    payload: UpdatePayPositionDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const existing = await this.getPositionById(
      positionId,
      payload.company_id,
      authorization,
      scopeContext,
    );
    const tenantId =
      resolveHrmPersistTenantId(
        authorization,
        payload.company_id,
        scopeContext,
      ) ?? MASTER_TENANT_ID;
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (col: string, val: unknown) => {
      values.push(val);
      fields.push(`${col} = $${values.length}`);
    };
    if (payload.name != null) set('name', payload.name.trim());
    if (payload.grade_code != null) {
      const gradeCode = await this.assertGradeCode(
        payload.grade_code,
        authorization,
        existing.company_id,
        tenantId,
      );
      set('grade_code', gradeCode);
    }
    if (payload.position_scope != null) {
      set(
        'position_scope',
        payload.position_scope === 'company' ? 'company' : 'department',
      );
    }
    if (payload.historical_note !== undefined) {
      set('historical_note', payload.historical_note?.trim() ?? null);
    }
    if (payload.status != null) set('status', payload.status.trim());
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(positionId);
    const res = await this.db.query<PayPositionRow>(
      `UPDATE public.pay_position SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.positionSelect}`,
      values,
    );
    return this.mapPosition(res.rows[0]);
  }

  async getPositionById(
    positionId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [positionId];
    pushHrmTableScopeFilters(filters, values, scope);
    const res = await this.db.query<PayPositionRow>(
      `SELECT ${this.positionSelect} FROM public.pay_position
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_POS_404,
        'Position not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapPosition(row);
  }

  private async getPositionByCode(
    code: string,
    scope: HrmListScope,
  ): Promise<PayPositionRow | null> {
    const filters: string[] = [
      'LOWER(code) = LOWER($1)',
      `status = 'active'`,
      'archived_at IS NULL',
    ];
    const values: unknown[] = [code.trim()];
    pushHrmTableScopeFilters(filters, values, scope);
    const res = await this.db.query<PayPositionRow>(
      `SELECT ${this.positionSelect} FROM public.pay_position
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    return res.rows[0] ?? null;
  }

  async resolveDepartmentId(
    companyId: string,
    departmentId?: string | null,
    departmentCode?: string | null,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    scope?: HrmListScope,
  ): Promise<string | null> {
    if (departmentId?.trim()) return departmentId.trim();
    const code = departmentCode?.trim();
    if (!code) return null;
    const effectiveScope =
      scope ?? resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = [`status = 'active'`];
    const values: unknown[] = [];
    pushDepartmentTableScopeFilters(filters, values, effectiveScope);
    values.push(code);
    const codeParam = values.length;
    filters.push(
      `(LOWER(code) = LOWER($${codeParam}) OR id::text = $${codeParam})`,
    );
    const res = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.departments
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    return res.rows[0]?.id ?? null;
  }

  async listDepartmentPositions(
    departmentId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['dp.department_id = $1::uuid'];
    const values: unknown[] = [departmentId];
    pushHrmTableScopeFilters(filters, values, scope, { tableAlias: 'dp' });
    const res = await this.db.query<
      DepartmentPositionRow & {
        master_name: string | null;
        master_grade: string | null;
        position_scope: PayPositionScope | null;
      }
    >(
      `SELECT
         dp.id, dp.tenant_id, dp.company_id, dp.department_id, dp.position_code,
         dp.local_name, dp.grade_code_override, dp.sort_order, dp.status,
         dp.created_at, dp.updated_at,
         pp.name AS master_name,
         pp.grade_code AS master_grade,
         pp.position_scope
       FROM public.department_position dp
       LEFT JOIN public.pay_position pp
         ON pp.tenant_id = dp.tenant_id
        AND LOWER(pp.code) = LOWER(dp.position_code)
        AND pp.archived_at IS NULL
       WHERE ${filters.join(' AND ')}
       ORDER BY dp.sort_order ASC, dp.position_code ASC`,
      values,
    );
    const catalogItems = await this.getActiveJobTitleItems(
      authorization,
      companyId,
      scopeContext,
    );
    const data: DepartmentPositionDisplay[] = res.rows.map((row) => {
      const masterName =
        row.master_name?.trim() ||
        this.jobTitleLabelByCode(catalogItems, row.position_code);
      const masterGrade = row.master_grade?.trim() || 'D1';
      return {
        id: row.id,
        department_id: row.department_id,
        position_code: row.position_code,
        local_name: row.local_name,
        grade_code_override: row.grade_code_override,
        effective_name: row.local_name?.trim() || masterName,
        effective_grade_code:
          row.grade_code_override?.trim() || masterGrade,
        position_scope: row.position_scope ?? 'department',
        sort_order: Number(row.sort_order ?? 0),
        status: row.status,
      };
    });
    return { total: data.length, data };
  }

  async upsertDepartmentPosition(
    departmentId: string,
    payload: UpsertDepartmentPositionDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
      scopeContext,
    );
    const tenantId =
      resolveHrmPersistTenantId(
        authorization,
        payload.company_id,
        scopeContext,
      ) ?? MASTER_TENANT_ID;
    const scope = resolveHrmListScope(authorization, payload.company_id, scopeContext);
    const positionCode = payload.position_code.trim();
    let master = await this.getPositionByCode(positionCode, scope);
    if (!master) {
      master = await this.provisionPayPositionFromJobTitle(
        positionCode,
        authorization,
        payload.company_id,
        scopeContext,
      );
    }
    if (!master) {
      throw new ApiException(
        HRM_POS_404,
        `Position '${positionCode}' not found in master catalog`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.grade_code_override?.trim()) {
      await this.assertGradeCode(
        payload.grade_code_override,
        authorization,
        companyId,
        tenantId,
      );
    }
    const deptExists = await this.resolveDepartmentId(
      payload.company_id,
      departmentId,
      null,
      authorization,
      scopeContext,
    );
    if (!deptExists) {
      throw new ApiException(
        HRM_POS_404,
        'Department not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const res = await this.db.query<DepartmentPositionRow>(
      `INSERT INTO public.department_position (
        id, tenant_id, company_id, department_id, position_code,
        local_name, grade_code_override, sort_order, status
      ) VALUES (
        $1, $2, $3, $4::uuid, $5, $6, $7, $8, $9
      )
      ON CONFLICT (tenant_id, company_id, department_id, position_code)
      DO UPDATE SET
        local_name = EXCLUDED.local_name,
        grade_code_override = EXCLUDED.grade_code_override,
        sort_order = EXCLUDED.sort_order,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING id, tenant_id, company_id, department_id, position_code,
        local_name, grade_code_override, sort_order, status, created_at, updated_at`,
      [
        randomUUID(),
        tenantId,
        companyId,
        departmentId,
        positionCode,
        payload.local_name?.trim() ?? null,
        payload.grade_code_override?.trim() ?? null,
        payload.sort_order ?? 0,
        payload.status?.trim() ?? 'active',
      ],
    );
    const listed = await this.listDepartmentPositions(
      departmentId,
      payload.company_id,
      authorization,
      scopeContext,
    );
    return listed.data.find((d) => d.position_code === positionCode) ?? res.rows[0];
  }

  async removeDepartmentPosition(
    departmentId: string,
    positionCode: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = [
      'department_id = $1::uuid',
      'LOWER(position_code) = LOWER($2)',
    ];
    const values: unknown[] = [departmentId, positionCode.trim()];
    pushHrmTableScopeFilters(filters, values, scope);
    await this.db.query(
      `DELETE FROM public.department_position WHERE ${filters.join(' AND ')}`,
      values,
    );
    return { department_id: departmentId, position_code: positionCode };
  }

  /**
   * Approach A — company-scoped positions need no department;
   * department-scoped require active department_position row.
   */
  async listEffectivePositions(
    query: {
      company_id: string;
      department_id?: string;
      department_code?: string;
      rollup_tenants?: boolean;
    },
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<{ data: EffectivePositionOption[] }> {
    await this.ensureSchema();
    const { scope, rollupByTenant } = this.resolvePositionsListScope(
      authorization,
      query.company_id,
      query.rollup_tenants,
      scopeContext,
    );

    const departmentId = await this.resolveDepartmentId(
      query.company_id,
      query.department_id,
      query.department_code,
      authorization,
      scopeContext,
      scope,
    );

    if (!departmentId) {
      const merged = await this.buildMergedMasterCatalog(
        authorization,
        query.company_id,
        scopeContext,
        scope,
        { rollupByTenant },
      );
      return {
        data: merged.map((row) => ({
          code: row.code,
          label: row.name,
          grade_code: row.grade_code,
          position_scope: row.position_scope,
        })),
      };
    }

    const dpFilters: string[] = [
      `dp.department_id = $1::uuid`,
      `dp.status = 'active'`,
    ];
    const dpValues: unknown[] = [departmentId];
    pushHrmTableScopeFilters(dpFilters, dpValues, scope, { tableAlias: 'dp' });
    const res = await this.db.query<{
      position_code: string;
      local_name: string | null;
      grade_code_override: string | null;
      master_name: string | null;
      master_grade: string | null;
      position_scope: PayPositionScope | null;
    }>(
      `SELECT
         dp.position_code,
         dp.local_name,
         dp.grade_code_override,
         pp.name AS master_name,
         pp.grade_code AS master_grade,
         pp.position_scope
       FROM public.department_position dp
       LEFT JOIN public.pay_position pp
         ON pp.tenant_id = dp.tenant_id
        AND LOWER(pp.code) = LOWER(dp.position_code)
        AND pp.status = 'active'
        AND pp.archived_at IS NULL
       WHERE ${dpFilters.join(' AND ')}
       ORDER BY dp.sort_order ASC, dp.position_code ASC`,
      dpValues,
    );
    const catalogItems = await this.getActiveJobTitleItems(
      authorization,
      query.company_id,
      scopeContext,
      scope,
      rollupByTenant,
    );
    return {
      data: res.rows.map((row) => ({
        code: row.position_code,
        label:
          row.local_name?.trim() ||
          row.master_name?.trim() ||
          this.jobTitleLabelByCode(catalogItems, row.position_code),
        grade_code:
          row.grade_code_override?.trim() || row.master_grade?.trim() || 'D1',
        position_scope: row.position_scope ?? 'department',
      })),
    };
  }

  async assertEmployeePositionAssignment(params: {
    persistCompanyId: string;
    requestedCompanyId?: string;
    jobTitleKey: string | null | undefined;
    departmentKey: string | null | undefined;
    authorization?: string;
    scopeContext?: HrmListScopeContext;
  }) {
    const code = params.jobTitleKey?.trim();
    if (!code) return;

    const requestedCompanyId =
      params.requestedCompanyId?.trim() || params.persistCompanyId;
    const activeCount = await this.countActivePositions(
      params.authorization,
      requestedCompanyId,
      params.scopeContext,
    );
    if (activeCount === 0) return;

    const scope = resolveHrmListScope(
      params.authorization,
      requestedCompanyId,
      params.scopeContext,
    );
    const position = await this.getPositionByCode(code, scope);
    if (!position) {
      throw new ApiException(
        HRM_EMP_POSITION_KEY,
        `job_title_key '${code}' is not in pay_position catalog`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (position.position_scope === 'company') {
      return;
    }

    const departmentKey = params.departmentKey?.trim();
    if (!departmentKey) {
      throw new ApiException(
        HRM_EMP_POSITION_DEPT_REQUIRED,
        `Chức danh '${code}' yêu cầu phòng ban`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const departmentId = await this.resolveDepartmentId(
      requestedCompanyId,
      null,
      departmentKey,
      params.authorization,
      params.scopeContext,
    );
    if (!departmentId) {
      throw new ApiException(
        HRM_EMP_POSITION_DEPT_MISMATCH,
        `Phòng ban '${departmentKey}' không hợp lệ cho chức danh '${code}'`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const filters: string[] = [
      'department_id = $1::uuid',
      'LOWER(position_code) = LOWER($2)',
      `status = 'active'`,
    ];
    const values: unknown[] = [departmentId, code];
    pushHrmTableScopeFilters(filters, values, scope);
    const hit = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.department_position
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!hit.rows[0]) {
      throw new ApiException(
        HRM_EMP_POSITION_DEPT_MISMATCH,
        `Chức danh '${code}' chưa được cấu hình cho phòng ban '${departmentKey}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
