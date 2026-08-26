import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  narrowHrmScopeToRequestTenant,
  resolveCatalogTenantIdsForRollup,
  resolveHrmRequestTenantId,
  shouldHrmGroupCeoTenantRollup,
} from '../common/hrm-tenant-rollup';
import {
  assertResourceInHrmScope,
  pushDepartmentTableScopeFilters,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmPersistTenantId,
  resolveHrmSettingsCatalogCompanyId,
  type HrmListScope,
} from '../common/hrm-list-scope';
import { ensureHrmTenantIdColumns } from '../common/hrm-tenant-scope-schema';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  isDepartmentUuid,
  mergeDepartmentCatalogRows,
  type DepartmentRow,
} from './department-catalog-merge';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

export type { DepartmentRow } from './department-catalog-merge';

function suggestDepartmentCode(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return base || `phong_${Date.now()}`;
}

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private async ensureSchema() {
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
      CREATE INDEX IF NOT EXISTS idx_departments_company_status
      ON public.departments (company_id, status, sort_order);
    `);
    await ensureHrmTenantIdColumns((sql) => this.db.query(sql));
  }

  private mapRow(row: DepartmentRow) {
    return {
      ...row,
      employee_count: Number(row.employee_count ?? 0),
      level: Number(row.level ?? 1),
      sort_order: Number(row.sort_order ?? 0),
    };
  }

  private async syncDepartmentCatalogItem(
    authorization: string | undefined,
    requestedCompanyId: string,
    input: { code: string; name: string; status: 'active' | 'draft' },
    tenantId?: string,
  ) {
    if (!this.settingsCatalogs) return;
    const resolvedTenant =
      tenantId?.trim() ||
      resolveHrmRequestTenantId(authorization, requestedCompanyId);
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      resolvedTenant,
      requestedCompanyId,
    );
    await this.settingsCatalogs.upsertCatalogItem(resolvedTenant, {
      company_id: catalogCompanyId,
      category_key: 'departments',
      item_key: input.code,
      item_name: input.name,
      status: input.status,
    });
  }

  private async loadCatalogDepartmentRows(
    authorization: string | undefined,
    requestedCompanyId: string,
    scope: HrmListScope,
    rollupByTenant: boolean,
    catalogStatus: 'active' | 'draft',
  ): Promise<DepartmentRow[]> {
    if (!this.settingsCatalogs) return [];
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      requestedCompanyId,
    );
    const tenantIds = resolveCatalogTenantIdsForRollup(
      authorization,
      requestedCompanyId,
      scope,
      rollupByTenant,
    );
    const now = new Date().toISOString();
    const rows: DepartmentRow[] = [];

    for (const tenantId of tenantIds) {
      const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
        authorization,
        tenantId,
        requestedCompanyId,
      );
      const items = await this.settingsCatalogs.getEffectiveItemsForKey(
        tenantId,
        catalogCompanyId,
        'departments',
      );
      items
        .filter((item) =>
          catalogStatus === 'active'
            ? item.status === 'active'
            : item.status !== 'active',
        )
        .forEach((item, index) => {
          const code = item.code?.trim() || null;
          rows.push({
            id: code || `catalog-dept-${tenantId}-${index}`,
            name: item.label.trim(),
            code,
            company_id: persistCompanyId,
            tenant_id: tenantId,
            parent_id: null,
            level: 1,
            sort_order: index,
            status: catalogStatus === 'active' ? 'active' : 'inactive',
            description: null,
            manager_name: null,
            manager_email: null,
            employee_count: 0,
            created_at: now,
            updated_at: now,
          });
        });
    }

    return rows;
  }

  private async queryHrmDepartmentRows(
    query: ListDepartmentsQueryDto,
    authorization: string | undefined,
    scope: HrmListScope,
  ): Promise<DepartmentRow[]> {
    const filters: string[] = [];
    const values: unknown[] = [];
    pushDepartmentTableScopeFilters(filters, values, scope);
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    } else {
      filters.push(`status = 'active'`);
    }
    const res = await this.db.query<DepartmentRow>(
      `SELECT ${this.selectColumns}
       FROM public.departments
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, name ASC;`,
      values,
    );
    return res.rows.map((row) => this.mapRow(row));
  }

  private async findHrmDepartmentRowByKey(
    departmentKey: string,
    companyId: string,
    authorization?: string,
  ): Promise<DepartmentRow | null> {
    const trimmed = departmentKey.trim();
    if (!trimmed) return null;
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushDepartmentTableScopeFilters(filters, values, scope);
    if (isDepartmentUuid(trimmed)) {
      values.push(trimmed);
      filters.push(`id = $${values.length}::uuid`);
    } else {
      values.push(trimmed);
      filters.push(`LOWER(TRIM(code)) = LOWER(TRIM($${values.length}))`);
    }
    const res = await this.db.query<DepartmentRow>(
      `SELECT ${this.selectColumns}
       FROM public.departments
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  private async resolveDepartmentUuid(
    departmentKey: string,
    companyId: string,
    authorization?: string,
    catalogCode?: string | null,
  ): Promise<string | null> {
    const direct = departmentKey.trim();
    if (isDepartmentUuid(direct)) return direct;

    const lookupKeys = [
      catalogCode?.trim(),
      direct,
    ]
      .filter((key): key is string => Boolean(key))
      .map((key) => key.toLowerCase());
    const uniqueKeys = [...new Set(lookupKeys)];

    for (const key of uniqueKeys) {
      const row = await this.findHrmDepartmentRowByKey(key, companyId, authorization);
      if (row?.id && isDepartmentUuid(row.id)) return row.id;
    }
    return null;
  }

  /** Count active employees by custom_fields.department ↔ department code (not stored column). */
  private async attachLiveEmployeeCounts(
    departments: DepartmentRow[],
    scope: HrmListScope,
  ): Promise<DepartmentRow[]> {
    if (!departments.length) return departments;

    const empFilters: string[] = ['archived_at IS NULL'];
    const empValues: unknown[] = [];
    pushEmployeeListScopeFilters(empFilters, empValues, scope);

    const res = await this.db.query<{
      company_id: string;
      dept_key: string;
      headcount: number;
    }>(
      `SELECT
         company_id,
         LOWER(TRIM(custom_fields->>'department')) AS dept_key,
         COUNT(*)::int AS headcount
       FROM public.employees
       WHERE ${empFilters.join(' AND ')}
         AND NULLIF(TRIM(custom_fields->>'department'), '') IS NOT NULL
       GROUP BY company_id, dept_key`,
      empValues,
    );

    const countMap = new Map<string, number>();
    for (const row of res.rows) {
      const companyId = row.company_id?.trim().toLowerCase() ?? '';
      const deptKey = row.dept_key?.trim().toLowerCase() ?? '';
      if (!companyId || !deptKey) continue;
      countMap.set(`${companyId}::${deptKey}`, Number(row.headcount ?? 0));
    }

    return departments.map((dept) => {
      const companyId = dept.company_id?.trim().toLowerCase() ?? '';
      const lookup = (key: string | undefined) =>
        key ? countMap.get(`${companyId}::${key}`) : undefined;
      const codeKey = dept.code?.trim().toLowerCase();
      const idKey = dept.id?.trim().toLowerCase();
      const nameKey = dept.name?.trim().toLowerCase();
      const count =
        lookup(codeKey) ?? lookup(idKey) ?? lookup(nameKey) ?? 0;
      return { ...dept, employee_count: count };
    });
  }

  private selectColumns = `
    id, company_id, tenant_id, parent_id, name, code, description, manager_name, manager_email,
    employee_count, level, sort_order, status, created_at, updated_at
  `;

  async listDepartments(
    query: ListDepartmentsQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const listScope = resolveHrmListScope(authorization, query.company_id);
    const rollupByTenant = shouldHrmGroupCeoTenantRollup(
      authorization,
      listScope,
      query.rollup_tenants !== false,
    );
    const scope = rollupByTenant
      ? listScope
      : narrowHrmScopeToRequestTenant(
          listScope,
          authorization,
          query.company_id,
        );
    const hrmRows = await this.queryHrmDepartmentRows(
      query,
      authorization ?? '',
      scope,
    );
    const catalogStatus = query.status === 'inactive' ? 'draft' : 'active';
    const catalogRows = await this.loadCatalogDepartmentRows(
      authorization,
      query.company_id,
      scope,
      rollupByTenant,
      catalogStatus,
    );
    const merged = mergeDepartmentCatalogRows(
      hrmRows,
      catalogRows,
      rollupByTenant,
    );
    const data = await this.attachLiveEmployeeCounts(merged, scope);
    return { total: data.length, data };
  }

  async getDepartmentById(
    departmentId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const hrmRow = await this.findHrmDepartmentRowByKey(
      departmentId,
      companyId,
      authorization,
    );
    if (hrmRow) {
      const [enriched] = await this.attachLiveEmployeeCounts([hrmRow], scope);
      return enriched;
    }

    const { data } = await this.listDepartments(
      { company_id: companyId },
      authorization,
    );
    const key = departmentId.trim().toLowerCase();
    const hit = data.find(
      (row) =>
        row.id.trim().toLowerCase() === key ||
        row.code?.trim().toLowerCase() === key,
    );
    if (!hit) {
      throw new ApiException(
        'HRM-DEPT-404',
        'Department not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return hit;
  }

  async createDepartment(
    payload: CreateDepartmentDto,
    authorization?: string,
  ): Promise<DepartmentRow> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const name = payload.name.trim();
    const code = (payload.code?.trim() || suggestDepartmentCode(name)).toLowerCase();
    const status = payload.status === 'inactive' ? 'inactive' : 'active';

    await this.syncDepartmentCatalogItem(authorization, payload.company_id, {
      code,
      name,
      status: status === 'inactive' ? 'draft' : 'active',
    });

    const existingId = await this.resolveDepartmentUuid(
      code,
      payload.company_id,
      authorization,
      code,
    );
    if (existingId) {
      return this.updateDepartment(
        existingId,
        {
          company_id: payload.company_id,
          name,
          code,
          description: payload.description ?? undefined,
          manager_name: payload.manager_name ?? undefined,
          manager_email: payload.manager_email ?? undefined,
          parent_id: payload.parent_id ?? null,
          level: payload.level,
          sort_order: payload.sort_order,
          status,
        },
        authorization,
      );
    }

    if (status === 'inactive') {
      return {
        id: code,
        company_id: companyId,
        tenant_id: resolveHrmRequestTenantId(authorization, payload.company_id),
        parent_id: payload.parent_id ?? null,
        name,
        code,
        description: payload.description ?? null,
        manager_name: payload.manager_name?.trim() ?? null,
        manager_email: payload.manager_email?.trim() ?? null,
        employee_count: 0,
        level: payload.level ?? 1,
        sort_order: payload.sort_order ?? 0,
        status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const tenantId = resolveHrmPersistTenantId(
      authorization,
      payload.company_id,
    ) ?? resolveHrmRequestTenantId(authorization, payload.company_id);
    const id = randomUUID();
    const res = await this.db.query<DepartmentRow>(
      `INSERT INTO public.departments (
        id, company_id, tenant_id, parent_id, name, code, description, manager_name, manager_email,
        level, sort_order, status
      ) VALUES (
        $1, $2, $3, $4::uuid, $5, $6, $7, $8, $9, $10, $11, 'active'
      )
      RETURNING ${this.selectColumns};`,
      [
        id,
        companyId,
        tenantId,
        payload.parent_id ?? null,
        name,
        code,
        payload.description ?? null,
        payload.manager_name?.trim() ?? null,
        payload.manager_email?.trim() ?? null,
        payload.level ?? 1,
        payload.sort_order ?? 0,
      ],
    );
    return this.mapRow(res.rows[0]);
  }

  async updateDepartment(
    departmentId: string,
    payload: UpdateDepartmentDto,
    authorization?: string,
  ): Promise<DepartmentRow> {
    await this.ensureSchema();
    const name = payload.name?.trim();
    const code =
      payload.code !== undefined
        ? payload.code?.trim()?.toLowerCase() ?? null
        : undefined;
    const previousCatalogCode =
      payload.previous_catalog_code?.trim().toLowerCase() || null;
    const catalogStatus =
      payload.status === 'inactive' ? ('draft' as const) : ('active' as const);

    if (previousCatalogCode && code && previousCatalogCode !== code) {
      await this.syncDepartmentCatalogItem(
        authorization,
        payload.company_id,
        {
          code: previousCatalogCode,
          name: name || previousCatalogCode,
          status: 'draft',
        },
      );
    }

    if (code && name) {
      await this.syncDepartmentCatalogItem(authorization, payload.company_id, {
        code,
        name,
        status: catalogStatus,
      });
    }

    const resolvedId = await this.resolveDepartmentUuid(
      departmentId,
      payload.company_id,
      authorization,
      code ?? previousCatalogCode ?? departmentId,
    );

    if (!resolvedId) {
      if (catalogStatus === 'draft' || payload.status === 'inactive') {
        return this.getDepartmentById(
          code || departmentId,
          payload.company_id,
          authorization,
        );
      }
      return this.createDepartment(
        {
          company_id: payload.company_id,
          name: name || code || departmentId,
          code: code || undefined,
          description: payload.description ?? undefined,
          manager_name: payload.manager_name ?? undefined,
          manager_email: payload.manager_email ?? undefined,
          parent_id: payload.parent_id ?? undefined,
          level: payload.level,
          sort_order: payload.sort_order,
          status: payload.status,
        },
        authorization,
      );
    }

    const existing = await this.getDepartmentById(
      resolvedId,
      payload.company_id,
      authorization,
    );
    const scope = resolveHrmListScope(authorization, payload.company_id);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEPT-404',
      mismatchCode: 'HRM-DEPT-409',
    });
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (payload.name != null) set('name', payload.name.trim());
    if (payload.code !== undefined) set('code', payload.code?.trim() ?? null);
    if (payload.description !== undefined)
      set('description', payload.description ?? null);
    if (payload.manager_name !== undefined)
      set('manager_name', payload.manager_name?.trim() ?? null);
    if (payload.manager_email !== undefined)
      set('manager_email', payload.manager_email?.trim() ?? null);
    if (payload.parent_id !== undefined) set('parent_id', payload.parent_id);
    if (payload.level != null) set('level', payload.level);
    if (payload.sort_order != null) set('sort_order', payload.sort_order);
    if (payload.status != null) set('status', payload.status);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(resolvedId);
    const res = await this.db.query<DepartmentRow>(
      `UPDATE public.departments SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.selectColumns};`,
      values,
    );
    return this.mapRow(res.rows[0]);
  }

  async deleteDepartment(
    departmentId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getDepartmentById(
      departmentId,
      companyId,
      authorization,
    );
    const code =
      existing.code?.trim() || suggestDepartmentCode(existing.name);
    await this.syncDepartmentCatalogItem(authorization, companyId, {
      code: code.toLowerCase(),
      name: existing.name,
      status: 'draft',
    });

    if (isDepartmentUuid(existing.id)) {
      const scope = resolveHrmListScope(authorization, companyId);
      assertResourceInHrmScope(existing, scope, {
        notFoundCode: 'HRM-DEPT-404',
        mismatchCode: 'HRM-DEPT-409',
      });
      await this.db.query(`DELETE FROM public.departments WHERE id = $1::uuid;`, [
        existing.id,
      ]);
      return { id: existing.id };
    }

    return { id: existing.id };
  }
}
