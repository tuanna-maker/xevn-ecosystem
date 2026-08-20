"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const hrm_company_display_name_1 = require("../operating-units/hrm-company-display-name");
const settings_catalogs_service_1 = require("../settings-catalogs/settings-catalogs.service");
const employee_list_cursor_1 = require("./employee-list-cursor");
const employee_summary_1 = require("./employee-summary");
const employee_directory_1 = require("./employee-directory");
const employee_update_policy_1 = require("./employee-update-policy");
let EmployeesService = class EmployeesService {
    db;
    settingsCatalogs;
    constructor(db, settingsCatalogs) {
        this.db = db;
        this.settingsCatalogs = settingsCatalogs;
    }
    async assertJobTitleKeyInCatalog(companyId, jobTitleKey, scopeContext) {
        const code = jobTitleKey?.trim();
        if (!code || !this.settingsCatalogs)
            return;
        const tenantId = scopeContext?.tenantId?.trim() || hrm_list_scope_1.MASTER_TENANT_ID;
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
    async ensureSchema() {
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
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived_created_id
      ON public.employees (company_id, archived_at, created_at DESC, id DESC);
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived_name_code_id
      ON public.employees (company_id, archived_at, full_name ASC, employee_code ASC, id ASC);
    `);
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
    async ensureSeedData() {
        if (process.env.NODE_ENV === 'production') {
            return;
        }
        const holdingExists = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.employees WHERE company_id = 'holding';`);
        if (Number(holdingExists.rows[0]?.total ?? 0) > 0) {
            return;
        }
        await this.db.query(`
      INSERT INTO public.employees (id, company_id, employee_code, email, full_name, job_title_key, status, hired_at)
      VALUES
        ('11111111-1111-4111-8111-111111111111', 'holding', 'NV001', 'ceo@xe.vn', 'Nguyen Van A', 'CEO', 'active', CURRENT_DATE - INTERVAL '400 days'),
        ('22222222-2222-4222-8222-222222222222', 'holding', 'NV002', 'hr.manager@xe.vn', 'Tran Thi B', 'CHRO', 'active', CURRENT_DATE - INTERVAL '280 days'),
        ('33333333-3333-4333-8333-333333333333', 'trsport', 'NV101', 'ops.manager@xe.vn', 'Le Van C', 'OPS_MANAGER', 'active', CURRENT_DATE - INTERVAL '180 days');
      `);
        await this.db.query(`
      UPDATE public.employees
      SET manager_id = '22222222-2222-4222-8222-222222222222'::uuid
      WHERE id = '11111111-1111-4111-8111-111111111111'::uuid AND manager_id IS NULL;
    `);
    }
    mapEmployee(row) {
        const companyUuid = (0, hrm_list_scope_1.resolveHrmCompanyUuidForSlug)(row.company_id);
        const company_display_name = (0, hrm_company_display_name_1.resolveCompanyDisplayNameVi)(row.company_id, null);
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
    async createEmployee(payload, authorization, scopeContext) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id, scopeContext);
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id, scopeContext);
        const customFields = { ...(payload.custom_fields ?? {}) };
        if (scope.memberTenantId && !customFields.tenant_id?.trim()) {
            customFields.tenant_id = scope.memberTenantId;
        }
        else if (scope.masterTenantPartition && !customFields.tenant_id?.trim()) {
            customFields.tenant_id = hrm_list_scope_1.MASTER_TENANT_ID;
        }
        await this.assertJobTitleKeyInCatalog(companyId, payload.job_title_key, scopeContext);
        const employeeId = (0, node_crypto_1.randomUUID)();
        try {
            const res = await this.db.query(`
          INSERT INTO public.employees (
            id, company_id, employee_code, email, full_name, job_title_key, hired_at, avatar_url, custom_fields
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9::jsonb)
          RETURNING
            id, company_id, employee_code, email, full_name, job_title_key, manager_id,
            status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
        `, [
                employeeId,
                companyId,
                payload.employee_code.trim(),
                payload.email.toLowerCase().trim(),
                payload.full_name.trim(),
                payload.job_title_key?.trim() ?? null,
                payload.hired_at ?? null,
                payload.avatar_url?.trim() || null,
                JSON.stringify(customFields),
            ]);
            return this.mapEmployee(res.rows[0]);
        }
        catch (error) {
            const pg = error;
            if (pg.code === '23505') {
                throw new api_exception_1.ApiException('HRM-EMP-DUPLICATE', 'Duplicate employee code or email for this company', common_1.HttpStatus.CONFLICT);
            }
            const message = error instanceof Error ? error.message : 'Cannot create employee';
            throw new api_exception_1.ApiException('HRM-EMP-001', message, common_1.HttpStatus.BAD_REQUEST, {
                original: error instanceof Error ? error.message : String(error),
            });
        }
    }
    buildEmployeeListFilters(query, authorization, scopeContext, options) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushEmployeeListScopeFilters)(filters, values, scope);
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
        const searchTerm = (0, employee_directory_1.resolveDirectorySearchTerm)(query.keyword, query.q);
        if (searchTerm) {
            filters.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR employee_code ILIKE $${idx})`);
            values.push(`%${searchTerm}%`);
            idx += 1;
        }
        return { scope, filters, values, idx };
    }
    async loadAttendanceTodayByEmployeeIds(employeeIds) {
        if (employeeIds.length === 0) {
            return new Map();
        }
        const today = (0, employee_directory_1.todayIsoInHoChiMinh)();
        const res = await this.db.query(`
        SELECT employee_id::text AS employee_id, check_in_at, status
        FROM public.attendance_records
        WHERE employee_id = ANY($1::uuid[]) AND attendance_date = $2::date;
      `, [employeeIds, today]);
        return new Map(res.rows.map((row) => [
            row.employee_id,
            { check_in_at: row.check_in_at, status: row.status },
        ]));
    }
    async listEmployeeDirectory(query, authorization, scopeContext) {
        const page = query.page ?? 1;
        const pageSize = query.page_size ?? 30;
        const offset = (page - 1) * pageSize;
        const includeAttendanceToday = query.include_attendance_today === true;
        const { filters, values, idx } = this.buildEmployeeListFilters(query, authorization, scopeContext, {
            directoryDefaults: true,
        });
        const whereClause = filters.join(' AND ');
        const dataRes = await this.db.query(`
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at,
          COUNT(*) OVER()::text AS list_total
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY full_name ASC, employee_code ASC, id ASC
        LIMIT $${idx} OFFSET $${idx + 1};
      `, [...values, pageSize, offset]);
        let total = Number(dataRes.rows[0]?.list_total ?? 0);
        if (dataRes.rows.length === 0 && page > 1) {
            const countRes = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`, values);
            total = Number(countRes.rows[0]?.total ?? 0);
        }
        const attendanceByEmployee = includeAttendanceToday
            ? await this.loadAttendanceTodayByEmployeeIds(dataRes.rows.map((row) => row.id))
            : new Map();
        let data = dataRes.rows.map((row) => (0, employee_directory_1.mapDirectoryListItem)(row, attendanceByEmployee.get(row.id) ?? null, includeAttendanceToday));
        if (includeAttendanceToday && query.attendance_filter) {
            data = data.filter((item) => (0, employee_directory_1.directoryItemPassesAttendanceFilter)(item, query.attendance_filter));
        }
        return {
            total,
            page,
            page_size: pageSize,
            data,
        };
    }
    async getEmployeesSummary(query, authorization, scopeContext) {
        const listQuery = {
            company_id: query.company_id,
            keyword: query.keyword,
            status: query.status,
            include_archived: query.include_archived,
        };
        const { filters, values, scope } = this.buildEmployeeListFilters(listQuery, authorization, scopeContext);
        const whereClause = filters.join(' AND ');
        const bundledRes = await this.db.query(`
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
            ${employee_summary_1.EMPLOYEE_SALARY_NUM_SQL} AS salary_num
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
      `, values);
        const emptyAggregate = {
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
            by_company: (0, employee_summary_1.buildEmployeeSummaryByCompany)(companyRows, scope.companyIds),
            salary_ranges: (0, employee_summary_1.buildSalaryRangesFromCounts)(aggregate),
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
    async listEmployees(query, authorization, scopeContext) {
        const page = query.page ?? 1;
        const pageSize = query.page_size ?? 20;
        const cursorRaw = typeof query.cursor === 'string' ? query.cursor.trim() : '';
        const { filters, values, idx } = this.buildEmployeeListFilters(query, authorization, scopeContext);
        const whereClause = filters.join(' AND ');
        if (cursorRaw) {
            if ((0, employee_directory_1.isDirectoryView)(query.view)) {
                throw new api_exception_1.ApiException('HRM-EMP-CURSOR-002', 'cursor is not supported with view=directory', common_1.HttpStatus.BAD_REQUEST);
            }
            let cursor;
            try {
                cursor = (0, employee_list_cursor_1.decodeEmployeeListCursor)(cursorRaw);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'invalid cursor';
                throw new api_exception_1.ApiException('HRM-EMP-CURSOR-001', message, common_1.HttpStatus.BAD_REQUEST);
            }
            const fetchSize = pageSize + 1;
            const dataRes = await this.db.query(`
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
        `, [...values, cursor.createdAt, cursor.id, fetchSize]);
            const hasMore = dataRes.rows.length > pageSize;
            const pageRows = hasMore ? dataRes.rows.slice(0, pageSize) : dataRes.rows;
            const total = Number(pageRows[0]?.list_total ?? dataRes.rows[0]?.list_total ?? 0);
            const last = pageRows[pageRows.length - 1];
            const nextCursor = hasMore && last ? (0, employee_list_cursor_1.encodeEmployeeListCursorFromRow)(last) : null;
            return {
                total,
                page,
                page_size: pageSize,
                next_cursor: nextCursor,
                data: pageRows.map((row) => this.mapEmployee(row)),
            };
        }
        const offset = (page - 1) * pageSize;
        const dataRes = await this.db.query(`
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at,
          to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_cursor,
          COUNT(*) OVER()::text AS list_total
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `, [...values, pageSize, offset]);
        let total = Number(dataRes.rows[0]?.list_total ?? 0);
        if (dataRes.rows.length === 0 && page > 1) {
            const countRes = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`, values);
            total = Number(countRes.rows[0]?.total ?? 0);
        }
        const last = dataRes.rows[dataRes.rows.length - 1];
        const nextCursor = dataRes.rows.length === pageSize && last && offset + dataRes.rows.length < total
            ? (0, employee_list_cursor_1.encodeEmployeeListCursorFromRow)(last)
            : null;
        return {
            total,
            page,
            page_size: pageSize,
            next_cursor: nextCursor,
            data: dataRes.rows.map((row) => this.mapEmployee(row)),
        };
    }
    async queryEmployeeById(employeeId, scope, includeArchived, options) {
        const filters = ['id = $1::uuid'];
        const values = [employeeId];
        (0, hrm_list_scope_1.pushEmployeeListScopeFilters)(filters, values, scope, options);
        if (!includeArchived) {
            filters.push('archived_at IS NULL');
        }
        const res = await this.db.query(`
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key,
          manager_id, status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at
        FROM public.employees
        WHERE ${filters.join(' AND ')};
      `, values);
        return res.rows[0];
    }
    async getEmployeeDirectoryById(employeeId, query, authorization, scopeContext) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        let row = await this.queryEmployeeById(employeeId, scope, query.include_archived);
        if (!row && scope.masterTenantPartition) {
            row = await this.queryEmployeeById(employeeId, scope, query.include_archived, {
                skipTenantPartition: true,
            });
        }
        if (!row) {
            throw new api_exception_1.ApiException('HRM-EMP-404', 'Employee not found', common_1.HttpStatus.NOT_FOUND);
        }
        const includeAttendanceToday = query.include_attendance_today === true;
        const attendanceByEmployee = includeAttendanceToday
            ? await this.loadAttendanceTodayByEmployeeIds([employeeId])
            : new Map();
        return (0, employee_directory_1.mapDirectoryDetail)(row, authorization, attendanceByEmployee.get(employeeId) ?? null, includeAttendanceToday);
    }
    async getEmployeeById(employeeId, query, authorization, scopeContext) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        let row = await this.queryEmployeeById(employeeId, scope, query.include_archived);
        if (!row && scope.masterTenantPartition) {
            row = await this.queryEmployeeById(employeeId, scope, query.include_archived, {
                skipTenantPartition: true,
            });
        }
        if (!row) {
            throw new api_exception_1.ApiException('HRM-EMP-404', 'Employee not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapEmployee(row);
    }
    async updateEmployee(employeeId, payload, requestedCompanyId, authorization) {
        (0, employee_update_policy_1.assertEmployeeUpdateAllowed)(employeeId, payload, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId);
        const existing = await this.getEmployeeById(employeeId, { company_id: requestedCompanyId }, authorization);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EMP-404',
            mismatchCode: 'HRM-EMP-409',
        });
        const updates = [];
        const values = [];
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
            const nextCustomFields = (0, employee_update_policy_1.isSelfEmployeeTarget)(employeeId, authorization)
                ? (0, employee_update_policy_1.mergeSelfEssCustomFields)(existing.custom_fields, payload.custom_fields)
                : (payload.custom_fields ?? {});
            updates.push(`custom_fields = $${updates.length + 1}::jsonb`);
            values.push(JSON.stringify(nextCustomFields));
        }
        if (payload.avatar_url !== undefined) {
            updates.push(`avatar_url = $${updates.length + 1}`);
            values.push(payload.avatar_url?.trim() || null);
        }
        if (updates.length === 0) {
            throw new api_exception_1.ApiException('HRM-EMP-002', 'No fields to update', common_1.HttpStatus.BAD_REQUEST);
        }
        const res = await this.db.query(`
        UPDATE public.employees
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${updates.length + 1}::uuid
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
      `, [...values, employeeId]);
        const updated = res.rows[0];
        if (!updated) {
            throw new api_exception_1.ApiException('HRM-EMP-404', 'Employee not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapEmployee(updated);
    }
    async archiveEmployee(employeeId, requestedCompanyId, authorization, scopeContext) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, scopeContext);
        const existing = await this.getEmployeeById(employeeId, { company_id: requestedCompanyId }, authorization, scopeContext);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EMP-404',
            mismatchCode: 'HRM-EMP-409',
        });
        const res = await this.db.query(`
        UPDATE public.employees
        SET archived_at = NOW(), updated_at = NOW(), status = 'inactive'
        WHERE id = $1::uuid AND archived_at IS NULL
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
      `, [employeeId]);
        const archived = res.rows[0];
        if (!archived) {
            throw new api_exception_1.ApiException('HRM-EMP-404', 'Employee not found or already archived', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapEmployee(archived);
    }
    async restoreEmployee(employeeId, requestedCompanyId, authorization, scopeContext) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, scopeContext);
        const existing = await this.getEmployeeById(employeeId, { company_id: requestedCompanyId, include_archived: true }, authorization, scopeContext);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EMP-404',
            mismatchCode: 'HRM-EMP-409',
        });
        if (existing.archived_at === null) {
            throw new api_exception_1.ApiException('HRM-EMP-409', 'Employee is already active', common_1.HttpStatus.CONFLICT);
        }
        const filters = ['id = $1::uuid', 'archived_at IS NOT NULL'];
        const values = [employeeId];
        (0, hrm_list_scope_1.pushEmployeeListScopeFilters)(filters, values, scope);
        const res = await this.db.query(`
        UPDATE public.employees
        SET archived_at = NULL, updated_at = NOW(), status = 'active'
        WHERE ${filters.join(' AND ')}
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at;
      `, values);
        const restored = res.rows[0];
        if (!restored) {
            throw new api_exception_1.ApiException('HRM-EMP-404', 'Employee not found or not archived', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapEmployee(restored);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        settings_catalogs_service_1.SettingsCatalogsService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map