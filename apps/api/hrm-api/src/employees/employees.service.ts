import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScope,
  HrmListScopeContext,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

type EmployeeRow = {
  id: string;
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string | null;
  manager_id: string | null;
  status: string;
  hired_at: string | null;
  archived_at: string | null;
  custom_fields: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(private readonly db: HrmDbService) {}

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
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived
      ON public.employees (company_id, archived_at, created_at DESC);
    `);
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
    return {
      id: row.id,
      company_id: row.company_id,
      employee_code: row.employee_code,
      email: row.email,
      full_name: row.full_name,
      job_title_key: row.job_title_key,
      manager_id: row.manager_id,
      status: row.status,
      hired_at: row.hired_at,
      archived_at: row.archived_at,
      custom_fields: row.custom_fields ?? {},
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async createEmployee(payload: CreateEmployeeDto) {
    const employeeId = randomUUID();
    try {
      const res = await this.db.query<EmployeeRow>(
        `
          INSERT INTO public.employees (
            id, company_id, employee_code, email, full_name, job_title_key, hired_at, custom_fields
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8::jsonb)
          RETURNING
            id, company_id, employee_code, email, full_name, job_title_key,
            status, hired_at, archived_at, custom_fields, created_at, updated_at;
        `,
        [
          employeeId,
          payload.company_id,
          payload.employee_code.trim(),
          payload.email.toLowerCase().trim(),
          payload.full_name.trim(),
          payload.job_title_key?.trim() ?? null,
          payload.hired_at ?? null,
          JSON.stringify(payload.custom_fields ?? {}),
        ],
      );
      return this.mapEmployee(res.rows[0]);
    } catch (error) {
      const pg = error as { code?: string };
      if (pg.code === '23505') {
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

  async listEmployees(
    query: ListEmployeesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const offset = (page - 1) * pageSize;
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushEmployeeListScopeFilters(filters, values, scope);
    let idx = values.length + 1;

    if (!query.include_archived) {
      filters.push('archived_at IS NULL');
    }
    if (query.status) {
      filters.push(`status = $${idx}`);
      values.push(query.status);
      idx += 1;
    }
    if (query.keyword?.trim()) {
      filters.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR employee_code ILIKE $${idx})`);
      values.push(`%${query.keyword.trim()}%`);
      idx += 1;
    }

    const whereClause = filters.join(' AND ');
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`,
      values,
    );
    const dataRes = await this.db.query<EmployeeRow>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key,
          status, hired_at, archived_at, custom_fields, created_at, updated_at
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page,
      page_size: pageSize,
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
          manager_id, status, hired_at, archived_at, custom_fields, created_at, updated_at
        FROM public.employees
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    return res.rows[0];
  }

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
      updates.push(`job_title_key = $${updates.length + 1}`);
      values.push(payload.job_title_key.trim());
    }
    if (payload.hired_at !== undefined) {
      updates.push(`hired_at = $${updates.length + 1}::date`);
      values.push(payload.hired_at);
    }
    if (payload.custom_fields !== undefined) {
      updates.push(`custom_fields = $${updates.length + 1}::jsonb`);
      values.push(JSON.stringify(payload.custom_fields ?? {}));
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
          id, company_id, employee_code, email, full_name, job_title_key,
          status, hired_at, archived_at, custom_fields, created_at, updated_at;
      `,
      [...values, employeeId],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException('HRM-EMP-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(updated);
  }

  async archiveEmployee(employeeId: string, requestedCompanyId: string, authorization?: string) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const existing = await this.getEmployeeById(employeeId, { company_id: requestedCompanyId }, authorization);
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
          id, company_id, employee_code, email, full_name, job_title_key,
          status, hired_at, archived_at, custom_fields, created_at, updated_at;
      `,
      [employeeId],
    );
    const archived = res.rows[0];
    if (!archived) {
      throw new ApiException('HRM-EMP-404', 'Employee not found or already archived', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(archived);
  }

  async restoreEmployee(employeeId: string) {
    const existing = await this.db.query<{ archived_at: string | null }>(
      `SELECT archived_at FROM public.employees WHERE id = $1::uuid`,
      [employeeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException('HRM-EMP-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    if (row.archived_at === null) {
      throw new ApiException('HRM-EMP-409', 'Employee is already active', HttpStatus.CONFLICT);
    }
    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET archived_at = NULL, updated_at = NOW(), status = 'active'
        WHERE id = $1::uuid AND archived_at IS NOT NULL
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key,
          status, hired_at, archived_at, custom_fields, created_at, updated_at;
      `,
      [employeeId],
    );
    const restored = res.rows[0];
    if (!restored) {
      throw new ApiException('HRM-EMP-404', 'Employee not found or not archived', HttpStatus.NOT_FOUND);
    }
    return this.mapEmployee(restored);
  }
}
