/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ nhân viên (service)
 * UC:         UC-HRM-20 · UC-HRM-21 · HRM-EM-01
 * BR:         BR-HRM-SCOPE-LIST · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · BR-EMP-COL-01
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.1 · FR-HRM-EM-01
 * SRS bước:   Diễn biến #5 Trùng mã NV · #7 Lưu thành công · #8 Tải lại (list/get/cursor)
 * TechSpec:   docs/hrm/TECHSPEC.md §14.1 (ref_srs: FR-HRM-EM-01) · ADR-HRM-SCALE §5.4
 * Purpose:    CRUD + list/summary theo scope; keyset cursor tránh storm OFFSET khi export.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 *
 * Callers:
 *   - employees.controller.ts → createEmployee / listEmployees / getEmployeesSummary / …
 *
 * Callees:
 *   - resolveHrmListScope → pushEmployeeListScopeFilters → public.employees
 *   - encode/decodeEmployeeListCursor → keyset WHERE
 *   - resolveCompanyDisplayNameVi → company_display_name (ĐVTV/LE SoT; never Khối)
 *
 * FE-Actions:
 *   | Thao tác          | Handler             | Lib / RPC                |
 *   |-------------------|---------------------|--------------------------|
 *   | Lưu hồ sơ         | createEmployee      | INSERT employees         |
 *   | Trang danh sách   | listEmployees       | GET /employees?page=     |
 *   | Export walk       | listEmployees+cursor| GET /employees?cursor=   |
 *
 * BE-Chain:
 *   createEmployee → INSERT employees (23505 → HRM-EMP-DUPLICATE)
 *   listEmployees → OFFSET hoặc keyset → employees
 *
 * Impact:      Scope lệch → 404/empty; cursor lỗi → 400; trùng mã → mất Diễn biến #5
 * must_keep:   leave/recruit/F5; OFFSET khi không cursor; empty list trung thực
 * SOLID:       Service domain; cursor codec tách file
 * LastVerified: be-hrm-co-emp-count-01.spec.ts · p1-hrm-perf-be-01.spec.ts · cd-fb-05-perf-be.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BE-HRM-EMP-COMPANY-COL-01
 * change_mode: ADD
 * What: mapEmployee / list/get expose company_display_name via resolveCompanyDisplayNameVi (LE SoT)
 * Why: BA-HRM-EMP-COMPANY-COL-01 AC-EMP-COL-01..03 — cột «Thông tin công ty» ≠ Khối registry
 * must_keep: scope_parity; cursor; slug map sync stays in OperatingUnitsService (AC-EMP-COL-04)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Map Diễn biến FR-HRM-EM-01 + TechSpec §14.1; comment nhánh then (không đổi logic)
 * Why: Sponsor lock CODE-MEMORY ↔ SRS bước
 * must_keep: cursor ISO · summary · duplicate 409
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-05-PERF-BE
 * What: Additive keyset cursor on listEmployees (next_cursor); summary unchanged
 * Why: CD-FB-03 audit — stop ~12 OFFSET page storm on export/full walk
 * SRS/BR: ADR-HRM-SCALE §5.4 Cursor stretch promoted for CD-FB-05
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-C-P1-HRM-PERF-02-CURSOR-TZ
 * What: ISO-8601 cursor encode (no Date.toString); SQL created_at_cursor (US) for keyset precision
 * Why: QA FAIL page-2+ 500 gmt+0700; JS Date ms truncation skipped rows (~200/1108 walk)
 * SRS/BR: ADR-HRM-SCALE §5.4 — cursor must cast to timestamptz and not skip same-ms rows
 *
 * @CODE-MEMORY-CHANGE 2026-07-23
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * change_mode: ADD
 * What: create/update validate job_title_key ∈ job_titles when set (VAL-SET-MD-01 / FR-HRM-SC-POS-01)
 * must_keep: company_display_name LE SoT; cursor; scope_parity; no Khối
 *
 * @CODE-MEMORY-CHANGE 2026-07-25
 * WorkItem: D-HRM-SETTINGS-MD-COMPILE-BE-01
 * change_mode: UPGRADE
 * What: assertJobTitleKeyInCatalog reads scopeContext.tenantId (HrmListScopeContext), not HrmListScope fields
 * Why: nest compile TS2339 blocked :28001 / Settings master-data QA
 * must_keep: company_display_name LE SoT; list scope RBAC ladder; catalog assert when key set
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-CO-EMP-COUNT-BE-01
 * change_mode: ADD
 * What: GET /employees/summary → by_company[{company_id slug, total, active_count, …}] same resolveHrmListScope
 * Why: Company Management employee_count=0 — FE needs per-slug Plane B counts (not XBOS LE UUID)
 * must_keep: scope_parity list↔summary; rollup main zero-fills 5 slugs; no legal-entity UUID keys
 */
import { HttpStatus, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScope,
  HrmListScopeContext,
  MASTER_TENANT_ID,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmCompanyUuidForSlug,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { resolveCompanyDisplayNameVi } from '../operating-units/hrm-company-display-name';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeSummaryQueryDto } from './dto/employee-summary.query.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  decodeEmployeeListCursor,
  encodeEmployeeListCursorFromRow,
} from './employee-list-cursor';
import {
  buildEmployeeSummaryByCompany,
  buildSalaryRangesFromCounts,
  EMPLOYEE_SALARY_NUM_SQL,
} from './employee-summary';
import type { EmployeeSummaryResult } from './employee-summary.types';
import {
  directoryItemPassesAttendanceFilter,
  isDirectoryView,
  mapDirectoryDetail,
  mapDirectoryListItem,
  resolveDirectorySearchTerm,
  todayIsoInHoChiMinh,
} from './employee-directory';
import type { EmployeeRow } from './employee-directory.types';
import {
  assertEmployeeUpdateAllowed,
  isSelfEmployeeTarget,
  mergeSelfEssCustomFields,
} from './employee-update-policy';

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private async assertJobTitleKeyInCatalog(
    companyId: string,
    jobTitleKey: string | null | undefined,
    scopeContext?: HrmListScopeContext,
  ) {
    const code = jobTitleKey?.trim();
    if (!code || !this.settingsCatalogs) return;
    // HrmListScopeContext = { tenantId? } from toHrmListScopeContext — not HrmListScope.
    const tenantId = scopeContext?.tenantId?.trim() || MASTER_TENANT_ID;
    await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId,
      companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: 'HRM-EMP-JOB-TITLE',
      errorMessage: `job_title_key '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
    });
  }

  async onModuleInit() {
    await this.ensureSchema();
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employees (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_code TEXT NOT NULL,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL,
        job_title_key TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        hired_at DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employees_status CHECK (status IN ('active', 'inactive'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_code
      ON public.employees (company_id, employee_code);
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_email_active
      ON public.employees (company_id, lower(email))
      WHERE archived_at IS NULL;
    `);
    // ADR-HRM-SCALE-1000-USERS §5.4 / P1-HRM-SCALE-BE-W1 — list ORDER BY created_at, id
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived_created_id
      ON public.employees (company_id, archived_at, created_at DESC, id DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived_name_code_id
      ON public.employees (company_id, archived_at, full_name ASC, employee_code ASC, id ASC);
    `);
    // P1-HRM-SCALE-BE-W2 — expression index matches master-tenant partition predicate
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_tenant_co_arch_created_id
      ON public.employees (
        (COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn')),
        company_id,
        archived_at,
        created_at DESC,
        id DESC
      );
    `);
    await this.db.query(`DROP INDEX IF EXISTS public.idx_employees_company_archived;`);
    await this.db.query(`DROP INDEX IF EXISTS public.idx_employees_active_created_id;`);
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;
    `);
    await this.db.query(`
      ALTER TABLE public.employees
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS manager_id UUID NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_manager
      ON public.employees (manager_id) WHERE manager_id IS NOT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
    `);
    await this.ensureSeedData();
  }

  private async ensureSeedData() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const holdingExists = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employees WHERE company_id = 'holding';`,
    );
    if (Number(holdingExists.rows[0]?.total ?? 0) > 0) {
      return;
    }
    await this.db.query(
      `
      INSERT INTO public.employees (id, company_id, employee_code, email, full_name, job_title_key, status, hired_at)
      VALUES
        ('11111111-1111-4111-8111-111111111111', 'holding', 'NV001', 'ceo@xe.vn', 'Nguyen Van A', 'CEO', 'active', CURRENT_DATE - INTERVAL '400 days'),
        ('22222222-2222-4222-8222-222222222222', 'holding', 'NV002', 'hr.manager@xe.vn', 'Tran Thi B', 'CHRO', 'active', CURRENT_DATE - INTERVAL '280 days'),
        ('33333333-3333-4333-8333-333333333333', 'trsport', 'NV101', 'ops.manager@xe.vn', 'Le Van C', 'OPS_MANAGER', 'active', CURRENT_DATE - INTERVAL '180 days');
      `,
    );
    await this.db.query(`
      UPDATE public.employees
      SET manager_id = '22222222-2222-4222-8222-222222222222'::uuid
      WHERE id = '11111111-1111-4111-8111-111111111111'::uuid AND manager_id IS NULL;
    `);
  }

  private mapEmployee(row: EmployeeRow) {
    const companyUuid = resolveHrmCompanyUuidForSlug(row.company_id);
    // Plane A / ĐVTV LE SoT — never Khối* (AC-EMP-COL-01/03).
    // company_slug_map sync (upgrade Khối → LE) lives in OperatingUnitsService (AC-EMP-COL-04).
    const company_display_name = resolveCompanyDisplayNameVi(row.company_id, null);
    return {
      id: row.id,
      company_id: row.company_id,
      company_uuid: companyUuid,
      company_display_name,
      employee_code: row.employee_code,
      email: row.email,
      full_name: row.full_name,
      job_title_key: row.job_title_key,
      manager_id: row.manager_id,
      status: row.status,
      hired_at: row.hired_at,
      archived_at: row.archived_at,
      avatar_url: row.avatar_url ?? null,
      custom_fields: row.custom_fields ?? {},
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #5 Trùng mã NV · #7 Lưu thành công
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01
   */
  async createEmployee(
    payload: CreateEmployeeDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(authorization, payload.company_id, scopeContext);
    // Xử lý: persist company_id theo ladder (main→holding) — khóa đơn vị Diễn biến #7/#8.
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id, scopeContext);
    const customFields: Record<string, string> = { ...(payload.custom_fields ?? {}) };
    if (scope.memberTenantId && !customFields.tenant_id?.trim()) {
      customFields.tenant_id = scope.memberTenantId;
    } else if (scope.masterTenantPartition && !customFields.tenant_id?.trim()) {
      customFields.tenant_id = MASTER_TENANT_ID;
    }

    await this.assertJobTitleKeyInCatalog(companyId, payload.job_title_key, scopeContext);

    const employeeId = randomUUID();
    try {
      const res = await this.db.query<EmployeeRow>(
        `
          INSERT INTO public.employees (
            id, company_id, employee_code, email, full_name, job_title_key, hired_at, avatar_url, custom_fields
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9::jsonb)
          RETURNING
            id, company_id, employee_code, email, full_name, job_title_key, manager_id,
            status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
        `,
        [
          employeeId,
          companyId,
          payload.employee_code.trim(),
          payload.email.toLowerCase().trim(),
          payload.full_name.trim(),
          payload.job_title_key?.trim() ?? null,
          payload.hired_at ?? null,
          payload.avatar_url?.trim() || null,
          JSON.stringify(customFields),
        ],
      );
      // Thành công: Diễn biến #7 — trả hồ sơ mới (khóa id mang sang CI/AT).
      return this.mapEmployee(res.rows[0]);
    } catch (error) {
      const pg = error as { code?: string };
      if (pg.code === '23505') {
        // Thất bại: Diễn biến #5 — trùng mã NV / email trong đơn vị.
        throw new ApiException(
          'HRM-EMP-DUPLICATE',
          'Duplicate employee code or email for this company',
          HttpStatus.CONFLICT,
        );
      }
      const message = error instanceof Error ? error.message : 'Cannot create employee';
      throw new ApiException('HRM-EMP-001', message, HttpStatus.BAD_REQUEST, {
        original: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private buildEmployeeListFilters(
    query: ListEmployeesQueryDto,
    authorization: string | undefined,
    scopeContext: HrmListScopeContext | undefined,
    options?: { directoryDefaults?: boolean },
  ) {
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushEmployeeListScopeFilters(filters, values, scope);
    let idx = values.length + 1;

    if (!query.include_archived) {
      filters.push('archived_at IS NULL');
    }

    const status = query.status ?? (options?.directoryDefaults ? 'active' : undefined);
    if (status) {
      filters.push(`status = $${idx}`);
      values.push(status);
      idx += 1;
    }

    const searchTerm = resolveDirectorySearchTerm(query.keyword, query.q);
    if (searchTerm) {
      filters.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR employee_code ILIKE $${idx})`);
      values.push(`%${searchTerm}%`);
      idx += 1;
    }

    return { scope, filters, values, idx };
  }

  private async loadAttendanceTodayByEmployeeIds(employeeIds: string[]) {
    if (employeeIds.length === 0) {
      return new Map<string, { check_in_at: string | null; status: string | null }>();
    }
    const today = todayIsoInHoChiMinh();
    const res = await this.db.query<{
      employee_id: string;
      check_in_at: string | null;
      status: string | null;
    }>(
      `
        SELECT employee_id::text AS employee_id, check_in_at, status
        FROM public.attendance_records
        WHERE employee_id = ANY($1::uuid[]) AND attendance_date = $2::date;
      `,
      [employeeIds, today],
    );
    return new Map(
      res.rows.map((row) => [
        row.employee_id,
        { check_in_at: row.check_in_at, status: row.status },
      ]),
    );
  }

  async listEmployeeDirectory(
    query: ListEmployeesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 30;
    const offset = (page - 1) * pageSize;
    const includeAttendanceToday = query.include_attendance_today === true;
    const { filters, values, idx } = this.buildEmployeeListFilters(query, authorization, scopeContext, {
      directoryDefaults: true,
    });

    const whereClause = filters.join(' AND ');
    // P1-HRM-SCALE-BE-W2 — single round-trip: window COUNT + page rows (ADR §5.4 COUNT strategy)
    const dataRes = await this.db.query<EmployeeRow & { list_total: string }>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at,
          COUNT(*) OVER()::text AS list_total
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY full_name ASC, employee_code ASC, id ASC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    let total = Number(dataRes.rows[0]?.list_total ?? 0);
    if (dataRes.rows.length === 0 && page > 1) {
      const countRes = await this.db.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`,
        values,
      );
      total = Number(countRes.rows[0]?.total ?? 0);
    }

    const attendanceByEmployee = includeAttendanceToday
      ? await this.loadAttendanceTodayByEmployeeIds(dataRes.rows.map((row) => row.id))
      : new Map<string, { check_in_at: string | null; status: string | null }>();

    let data = dataRes.rows.map((row) =>
      mapDirectoryListItem(
        row,
        attendanceByEmployee.get(row.id) ?? null,
        includeAttendanceToday,
      ),
    );

    if (includeAttendanceToday && query.attendance_filter) {
      data = data.filter((item) => directoryItemPassesAttendanceFilter(item, query.attendance_filter));
    }

    return {
      total,
      page,
      page_size: pageSize,
      data,
    };
  }

  /**
   * P1-HRM-PERF-BE-01 — single-call dashboard aggregates (same list scope filters).
   * Replaces ~N sequential GET /employees pages for count/stats on embed.
   */
  /**
   * @CODE-MEMORY method · AC-CO-EMP / D-HRM-CO-EMP-COUNT-BE-01
   * SRS bước: Company Management — cột Số nhân viên theo ĐVTV (Plane B slug)
   * TechSpec: GET /employees/summary · by_company · same resolveHrmListScope as list
   */
  async getEmployeesSummary(
    query: EmployeeSummaryQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<EmployeeSummaryResult> {
    const listQuery: ListEmployeesQueryDto = {
      company_id: query.company_id,
      keyword: query.keyword,
      status: query.status,
      include_archived: query.include_archived,
    };
    const { filters, values, scope } = this.buildEmployeeListFilters(
      listQuery,
      authorization,
      scopeContext,
    );
    const whereClause = filters.join(' AND ');
    // P1-HRM-SCALE-BE-W2 — one CTE scan for agg + dept + by_company + recent
    type SummaryAggregateRow = {
      total: string;
      active_count: string;
      inactive_count: string;
      archived_count: string;
      new_hires_last_30_days: string;
      total_payroll: string;
      employees_with_salary: string;
      salary_range_above_30m: string;
      salary_range_20_30m: string;
      salary_range_15_20m: string;
      salary_range_below_15m: string;
    };
    type SummaryDeptRow = {
      department: string;
      count: string;
      avg_salary: string | null;
    };
    type SummaryCompanyRow = {
      company_id: string;
      total: string;
      active_count: string;
      inactive_count: string;
      archived_count: string;
    };
    type SummaryRecentRow = {
      id: string;
      employee_code: string;
      full_name: string;
      status: string;
      hired_at: string | null;
      avatar_url: string | null;
    };

    const bundledRes = await this.db.query<{
      aggregate: SummaryAggregateRow | null;
      by_department: SummaryDeptRow[] | null;
      by_company: SummaryCompanyRow[] | null;
      recent: SummaryRecentRow[] | null;
    }>(
      `
        WITH scoped AS (
          SELECT
            id,
            company_id,
            employee_code,
            full_name,
            status,
            hired_at,
            archived_at,
            avatar_url,
            created_at,
            custom_fields,
            ${EMPLOYEE_SALARY_NUM_SQL} AS salary_num
          FROM public.employees
          WHERE ${whereClause}
        ),
        agg AS (
          SELECT
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'active')::text AS active_count,
            COUNT(*) FILTER (WHERE status = 'inactive')::text AS inactive_count,
            COUNT(*) FILTER (WHERE archived_at IS NOT NULL)::text AS archived_count,
            COUNT(*) FILTER (WHERE hired_at >= (CURRENT_DATE - INTERVAL '30 days'))::text AS new_hires_last_30_days,
            COALESCE(SUM(salary_num), 0)::text AS total_payroll,
            COUNT(*) FILTER (WHERE salary_num IS NOT NULL AND salary_num > 0)::text AS employees_with_salary,
            COUNT(*) FILTER (WHERE salary_num >= 30000000)::text AS salary_range_above_30m,
            COUNT(*) FILTER (WHERE salary_num >= 20000000 AND salary_num < 30000000)::text AS salary_range_20_30m,
            COUNT(*) FILTER (WHERE salary_num >= 15000000 AND salary_num < 20000000)::text AS salary_range_15_20m,
            COUNT(*) FILTER (WHERE salary_num > 0 AND salary_num < 15000000)::text AS salary_range_below_15m
          FROM scoped
        ),
        dept AS (
          SELECT
            COALESCE(NULLIF(TRIM(custom_fields->>'department'), ''), 'Khác') AS department,
            COUNT(*)::text AS count,
            AVG(salary_num)::text AS avg_salary
          FROM scoped
          GROUP BY 1
        ),
        by_company AS (
          SELECT
            company_id,
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'active')::text AS active_count,
            COUNT(*) FILTER (WHERE status = 'inactive')::text AS inactive_count,
            COUNT(*) FILTER (WHERE archived_at IS NOT NULL)::text AS archived_count
          FROM scoped
          GROUP BY company_id
        ),
        recent AS (
          SELECT
            id::text AS id,
            employee_code,
            full_name,
            status,
            hired_at::text AS hired_at,
            avatar_url
          FROM scoped
          ORDER BY COALESCE(hired_at, created_at::date) DESC, created_at DESC
          LIMIT 5
        )
        SELECT
          (SELECT row_to_json(a) FROM agg a) AS aggregate,
          COALESCE(
            (
              SELECT json_agg(row_to_json(d) ORDER BY d.count::int DESC, d.department ASC)
              FROM dept d
            ),
            '[]'::json
          ) AS by_department,
          COALESCE(
            (
              SELECT json_agg(row_to_json(c) ORDER BY c.company_id ASC)
              FROM by_company c
            ),
            '[]'::json
          ) AS by_company,
          COALESCE(
            (SELECT json_agg(row_to_json(r)) FROM recent r),
            '[]'::json
          ) AS recent;
      `,
      values,
    );

    const emptyAggregate: SummaryAggregateRow = {
      total: '0',
      active_count: '0',
      inactive_count: '0',
      archived_count: '0',
      new_hires_last_30_days: '0',
      total_payroll: '0',
      employees_with_salary: '0',
      salary_range_above_30m: '0',
      salary_range_20_30m: '0',
      salary_range_15_20m: '0',
      salary_range_below_15m: '0',
    };
    const payload = bundledRes.rows[0];
    const aggregate = payload?.aggregate ?? emptyAggregate;
    const departmentRows = payload?.by_department ?? [];
    const companyRows = payload?.by_company ?? [];
    const recentRows = payload?.recent ?? [];

    return {
      company_id: query.company_id,
      total: Number(aggregate.total),
      active_count: Number(aggregate.active_count),
      inactive_count: Number(aggregate.inactive_count),
      archived_count: Number(aggregate.archived_count),
      payroll: {
        total: Number(aggregate.total_payroll),
        employees_with_salary: Number(aggregate.employees_with_salary),
      },
      by_department: departmentRows.map((row) => ({
        department: row.department,
        count: Number(row.count),
        avg_salary: row.avg_salary == null ? null : Number(row.avg_salary),
      })),
      by_company: buildEmployeeSummaryByCompany(companyRows, scope.companyIds),
      salary_ranges: buildSalaryRangesFromCounts(aggregate),
      new_hires: {
        last_30_days: Number(aggregate.new_hires_last_30_days),
        recent: recentRows.map((row) => ({
          id: row.id,
          employee_code: row.employee_code,
          full_name: row.full_name,
          status: row.status,
          hired_at: row.hired_at,
          avatar_url: row.avatar_url ?? null,
        })),
      },
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #8 Tải lại trang — list scoped (+ cursor export)
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01
   */
  async listEmployees(
    query: ListEmployeesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const cursorRaw = typeof query.cursor === 'string' ? query.cursor.trim() : '';
    const { filters, values, idx } = this.buildEmployeeListFilters(query, authorization, scopeContext);
    const whereClause = filters.join(' AND ');

    // CD-FB-05 — keyset cursor (ADR §5.4); OFFSET path must_keep when cursor absent
    if (cursorRaw) {
      if (isDirectoryView(query.view)) {
        throw new ApiException(
          'HRM-EMP-CURSOR-002',
          'cursor is not supported with view=directory',
          HttpStatus.BAD_REQUEST,
        );
      }
      let cursor: { createdAt: string; id: string };
      try {
        cursor = decodeEmployeeListCursor(cursorRaw);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid cursor';
        throw new ApiException('HRM-EMP-CURSOR-001', message, HttpStatus.BAD_REQUEST);
      }

      const fetchSize = pageSize + 1;
      const dataRes = await this.db.query<
        EmployeeRow & { list_total: string; created_at_cursor: string }
      >(
        `
          WITH scoped AS (
            SELECT
              id, company_id, employee_code, email, full_name, job_title_key, manager_id,
              status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_cursor,
              COUNT(*) OVER()::text AS list_total
            FROM public.employees
            WHERE ${whereClause}
          )
          SELECT *
          FROM scoped
          WHERE (created_at, id) < ($${idx}::timestamptz, $${idx + 1}::uuid)
          ORDER BY created_at DESC, id DESC
          LIMIT $${idx + 2};
        `,
        [...values, cursor.createdAt, cursor.id, fetchSize],
      );

      const hasMore = dataRes.rows.length > pageSize;
      const pageRows = hasMore ? dataRes.rows.slice(0, pageSize) : dataRes.rows;
      const total = Number(pageRows[0]?.list_total ?? dataRes.rows[0]?.list_total ?? 0);
      const last = pageRows[pageRows.length - 1];
      const nextCursor = hasMore && last ? encodeEmployeeListCursorFromRow(last) : null;

      return {
        total,
        page,
        page_size: pageSize,
        next_cursor: nextCursor,
        data: pageRows.map((row) => this.mapEmployee(row)),
      };
    }

    const offset = (page - 1) * pageSize;
    // P1-HRM-SCALE-BE-W2 — single round-trip: window COUNT + page rows (ADR §5.4 COUNT strategy)
    const dataRes = await this.db.query<
      EmployeeRow & { list_total: string; created_at_cursor: string }
    >(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at,
          to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_cursor,
          COUNT(*) OVER()::text AS list_total
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    let total = Number(dataRes.rows[0]?.list_total ?? 0);
    if (dataRes.rows.length === 0 && page > 1) {
      const countRes = await this.db.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`,
        values,
      );
      total = Number(countRes.rows[0]?.total ?? 0);
    }

    const last = dataRes.rows[dataRes.rows.length - 1];
    const nextCursor =
      dataRes.rows.length === pageSize && last && offset + dataRes.rows.length < total
        ? encodeEmployeeListCursorFromRow(last)
        : null;

    return {
      total,
      page,
      page_size: pageSize,
      next_cursor: nextCursor,
      data: dataRes.rows.map((row) => this.mapEmployee(row)),
    };
  }

  private async queryEmployeeById(
    employeeId: string,
    scope: HrmListScope,
    includeArchived: boolean | undefined,
    options?: { skipTenantPartition?: boolean },
  ): Promise<EmployeeRow | undefined> {
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [employeeId];
    pushEmployeeListScopeFilters(filters, values, scope, options);
    if (!includeArchived) {
      filters.push('archived_at IS NULL');
    }
    const res = await this.db.query<EmployeeRow>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key,
          manager_id, status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at
        FROM public.employees
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    return res.rows[0];
  }

  async getEmployeeDirectoryById(
    employeeId: string,
    query: GetEmployeeQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    let row = await this.queryEmployeeById(employeeId, scope, query.include_archived);
    if (!row && scope.masterTenantPartition) {
      row = await this.queryEmployeeById(employeeId, scope, query.include_archived, {
        skipTenantPartition: true,
      });
    }
    if (!row) {
      throw new ApiException('HRM-EMP-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    const includeAttendanceToday = query.include_attendance_today === true;
    const attendanceByEmployee = includeAttendanceToday
      ? await this.loadAttendanceTodayByEmployeeIds([employeeId])
      : new Map<string, { check_in_at: string | null; status: string | null }>();
    return mapDirectoryDetail(
      row,
      authorization,
      attendanceByEmployee.get(employeeId) ?? null,
      includeAttendanceToday,
    );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #8 — get-by-id cùng scope list (U19 parity)
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01
   */
  async getEmployeeById(
    employeeId: string,
    query: GetEmployeeQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    let row = await this.queryEmployeeById(employeeId, scope, query.include_archived);
    if (!row && scope.masterTenantPartition) {
      row = await this.queryEmployeeById(employeeId, scope, query.include_archived, {
        skipTenantPartition: true,
      });
    }
    if (!row) {
      throw new ApiException('HRM-EMP-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(row);
  }

  async updateEmployee(
    employeeId: string,
    payload: UpdateEmployeeDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    assertEmployeeUpdateAllowed(employeeId, payload, authorization);
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const existing = await this.getEmployeeById(employeeId, { company_id: requestedCompanyId }, authorization);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    const updates: string[] = [];
    const values: unknown[] = [];
    if (payload.email !== undefined) {
      updates.push(`email = $${updates.length + 1}`);
      values.push(payload.email.toLowerCase().trim());
    }
    if (payload.full_name !== undefined) {
      updates.push(`full_name = $${updates.length + 1}`);
      values.push(payload.full_name.trim());
    }
    if (payload.job_title_key !== undefined) {
      await this.assertJobTitleKeyInCatalog(existing.company_id, payload.job_title_key);
      updates.push(`job_title_key = $${updates.length + 1}`);
      values.push(payload.job_title_key.trim());
    }
    if (payload.hired_at !== undefined) {
      updates.push(`hired_at = $${updates.length + 1}::date`);
      values.push(payload.hired_at);
    }
    if (payload.custom_fields !== undefined) {
      // Option A: self always merges phone keys only (even manager|hr_manager JWT).
      const nextCustomFields = isSelfEmployeeTarget(employeeId, authorization)
        ? mergeSelfEssCustomFields(existing.custom_fields, payload.custom_fields)
        : (payload.custom_fields ?? {});
      updates.push(`custom_fields = $${updates.length + 1}::jsonb`);
      values.push(JSON.stringify(nextCustomFields));
    }
    if (payload.avatar_url !== undefined) {
      updates.push(`avatar_url = $${updates.length + 1}`);
      values.push(payload.avatar_url?.trim() || null);
    }

    if (updates.length === 0) {
      throw new ApiException('HRM-EMP-002', 'No fields to update', HttpStatus.BAD_REQUEST);
    }

    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${updates.length + 1}::uuid
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
      `,
      [...values, employeeId],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException('HRM-EMP-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(updated);
  }

  async archiveEmployee(
    employeeId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, scopeContext);
    const existing = await this.getEmployeeById(
      employeeId,
      { company_id: requestedCompanyId },
      authorization,
      scopeContext,
    );
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET archived_at = NOW(), updated_at = NOW(), status = 'inactive'
        WHERE id = $1::uuid AND archived_at IS NULL
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
      `,
      [employeeId],
    );
    const archived = res.rows[0];
    if (!archived) {
      throw new ApiException('HRM-EMP-404', 'Employee not found or already archived', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(archived);
  }

  async restoreEmployee(
    employeeId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, scopeContext);
    const existing = await this.getEmployeeById(
      employeeId,
      { company_id: requestedCompanyId, include_archived: true },
      authorization,
      scopeContext,
    );
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    if (existing.archived_at === null) {
      throw new ApiException('HRM-EMP-409', 'Employee is already active', HttpStatus.CONFLICT);
    }

    const filters: string[] = ['id = $1::uuid', 'archived_at IS NOT NULL'];
    const values: unknown[] = [employeeId];
    pushEmployeeListScopeFilters(filters, values, scope);
    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET archived_at = NULL, updated_at = NOW(), status = 'active'
        WHERE ${filters.join(' AND ')}
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
      `,
      values,
    );
    const restored = res.rows[0];
    if (!restored) {
      throw new ApiException('HRM-EMP-404', 'Employee not found or not archived', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(restored);
  }
}
