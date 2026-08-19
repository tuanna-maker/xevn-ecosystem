/**
 * @CODE-MEMORY
 * Screen:     HRM → Người phụ thuộc (F-CORE-DEP-01)
 * UC:         UC-BP-CORE-01 · FR-UC-BP-CORE-01 Diễn biến #3–#4
 * BR:         O5 CORE-DEP-ONE · O6 CORE-FAMILY-≠-SALARY · U19 CORE-S-SCOPE
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-01
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md §5.2
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md §5 employee_dependents
 * Purpose:    CRUD soft-delete dependents on ONE SoT public.employee_dependents · relation_label.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    employees.controller …/dependents*
 * Callees:    resolveHrmListScope · assertResourceInHrmScope · employee-public-ring
 * FEActions:  dependents UI → GET/POST/PATCH/DELETE /employees/:id/dependents*
 * BEChain:    ensureSchema → parent emp in scope → INSERT/UPDATE/soft archive
 * Impact:     Second deps table / PAY dependent_count as person CRUD = O5 FAIL
 * must_keep:  soft archived_at · HRM-CORE-DEP-* · U19 · no Nest /core dual · no salary leak
 * SOLID:      Service SRP for deps — EMP public ring stays in EmployeesService
 * LastVerified: po-hrm-mvp-gd1-core-01-cluster-be-01.spec.ts
 */
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScopeContext,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { EmployeeRow } from './employee-directory.types';
import {
  assertNoCorePublicCbDenyKeys,
  HRM_CORE_DEP_404,
  HRM_CORE_DEP_VAL_400,
  resolveDependentRelationLabel,
} from './employee-public-ring';
import type {
  CreateEmployeeDependentDto,
  GetEmployeeDependentQueryDto,
  ListEmployeeDependentsQueryDto,
  UpdateEmployeeDependentDto,
} from './dto/employee-dependent.dto';

export type EmployeeDependentRow = {
  id: string;
  employee_id: string;
  company_id: string;
  full_name: string;
  relation_code: string;
  date_of_birth: string | null;
  is_tax_dependent: boolean;
  effective_from: string | null;
  effective_to: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class EmployeeDependentsService implements OnModuleInit {
  constructor(private readonly db: HrmDbService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_dependents (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        relation_code TEXT NOT NULL,
        date_of_birth DATE NULL,
        is_tax_dependent BOOLEAN NOT NULL DEFAULT FALSE,
        effective_from DATE NULL,
        effective_to DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_emp_deps_employee_active
      ON public.employee_dependents (employee_id)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_emp_deps_company_employee
      ON public.employee_dependents (company_id, employee_id);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_emp_deps_company_relation
      ON public.employee_dependents (company_id, relation_code);
    `);
  }

  private mapDependent(row: EmployeeDependentRow) {
    return {
      id: row.id,
      employee_id: row.employee_id,
      company_id: row.company_id,
      full_name: row.full_name,
      relation_code: row.relation_code,
      relation_label: resolveDependentRelationLabel(row.relation_code),
      date_of_birth: row.date_of_birth,
      is_tax_dependent: Boolean(row.is_tax_dependent),
      effective_from: row.effective_from,
      effective_to: row.effective_to,
      archived_at: row.archived_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async loadParentEmployee(
    employeeId: string,
    companyId: string,
    authorization: string | undefined,
    scopeContext: HrmListScopeContext | undefined,
  ): Promise<EmployeeRow> {
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushEmployeeListScopeFilters(filters, values, scope);
    const res = await this.db.query<EmployeeRow>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key,
          manager_id, status, hired_at, archived_at, avatar_url, custom_fields,
          created_at, updated_at
        FROM public.employees
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    let row = res.rows[0];
    if (!row && scope.masterTenantPartition) {
      const filters2: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
      const values2: unknown[] = [employeeId];
      pushEmployeeListScopeFilters(filters2, values2, scope, { skipTenantPartition: true });
      const res2 = await this.db.query<EmployeeRow>(
        `
          SELECT
            id, company_id, employee_code, email, full_name, job_title_key,
            manager_id, status, hired_at, archived_at, avatar_url, custom_fields,
            created_at, updated_at
          FROM public.employees
          WHERE ${filters2.join(' AND ')};
        `,
        values2,
      );
      row = res2.rows[0];
    }
    if (!row) {
      throw new ApiException('HRM-EMP-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    return row;
  }

  private assertWelfareCreate(payload: CreateEmployeeDependentDto): void {
    const name = payload.full_name?.trim() ?? '';
    const relation = payload.relation_code?.trim() ?? '';
    const dob = payload.date_of_birth?.trim() ?? '';
    if (!name || !relation || !dob) {
      throw new ApiException(
        HRM_CORE_DEP_VAL_400,
        'Người phụ thuộc yêu cầu họ tên, quan hệ và ngày sinh',
        HttpStatus.BAD_REQUEST,
        { required: ['full_name', 'relation_code', 'date_of_birth'] },
      );
    }
  }

  async listDependents(
    employeeId: string,
    query: ListEmployeeDependentsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const filters: string[] = ['employee_id = $1::uuid', 'company_id = $2::text'];
    const values: unknown[] = [employeeId, parent.company_id];
    if (!query.include_archived) {
      filters.push('archived_at IS NULL');
    }
    const res = await this.db.query<EmployeeDependentRow>(
      `
        SELECT
          id, employee_id, company_id, full_name, relation_code,
          date_of_birth::text AS date_of_birth, is_tax_dependent,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          archived_at, created_at, updated_at
        FROM public.employee_dependents
        WHERE ${filters.join(' AND ')}
        ORDER BY date_of_birth ASC NULLS LAST, full_name ASC, id ASC;
      `,
      values,
    );
    return {
      employee_id: employeeId,
      company_id: parent.company_id,
      total: res.rows.length,
      data: res.rows.map((row) => this.mapDependent(row)),
    };
  }

  async getDependentById(
    employeeId: string,
    dependentId: string,
    query: GetEmployeeDependentQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const res = await this.db.query<EmployeeDependentRow>(
      `
        SELECT
          id, employee_id, company_id, full_name, relation_code,
          date_of_birth::text AS date_of_birth, is_tax_dependent,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          archived_at, created_at, updated_at
        FROM public.employee_dependents
        WHERE id = $1::uuid
          AND employee_id = $2::uuid
          AND company_id = $3::text
          AND archived_at IS NULL;
      `,
      [dependentId, employeeId, parent.company_id],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CORE_DEP_404,
        'Dependent not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapDependent(row);
  }

  async createDependent(
    employeeId: string,
    query: GetEmployeeDependentQueryDto,
    payload: CreateEmployeeDependentDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    assertNoCorePublicCbDenyKeys(payload as unknown as Record<string, unknown>);
    this.assertWelfareCreate(payload);
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const id = randomUUID();
    const res = await this.db.query<EmployeeDependentRow>(
      `
        INSERT INTO public.employee_dependents (
          id, employee_id, company_id, full_name, relation_code,
          date_of_birth, is_tax_dependent, effective_from, effective_to
        ) VALUES (
          $1::uuid, $2::uuid, $3::text, $4, $5,
          $6::date, COALESCE($7, FALSE), $8::date, $9::date
        )
        RETURNING
          id, employee_id, company_id, full_name, relation_code,
          date_of_birth::text AS date_of_birth, is_tax_dependent,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          archived_at, created_at, updated_at;
      `,
      [
        id,
        employeeId,
        parent.company_id,
        payload.full_name.trim(),
        payload.relation_code.trim().toLowerCase().replace(/-/g, '_'),
        payload.date_of_birth,
        payload.is_tax_dependent ?? false,
        payload.effective_from ?? null,
        payload.effective_to ?? null,
      ],
    );
    return this.mapDependent(res.rows[0]);
  }

  async updateDependent(
    employeeId: string,
    dependentId: string,
    query: GetEmployeeDependentQueryDto,
    payload: UpdateEmployeeDependentDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    assertNoCorePublicCbDenyKeys(payload as unknown as Record<string, unknown>);
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const updates: string[] = [];
    const values: unknown[] = [];
    if (payload.full_name !== undefined) {
      const name = payload.full_name.trim();
      if (!name) {
        throw new ApiException(
          HRM_CORE_DEP_VAL_400,
          'Họ tên người phụ thuộc không được để trống',
          HttpStatus.BAD_REQUEST,
        );
      }
      updates.push(`full_name = $${updates.length + 1}`);
      values.push(name);
    }
    if (payload.relation_code !== undefined) {
      const relation = payload.relation_code.trim().toLowerCase().replace(/-/g, '_');
      if (!relation) {
        throw new ApiException(
          HRM_CORE_DEP_VAL_400,
          'Mã quan hệ không được để trống',
          HttpStatus.BAD_REQUEST,
        );
      }
      updates.push(`relation_code = $${updates.length + 1}`);
      values.push(relation);
    }
    if (payload.date_of_birth !== undefined) {
      if (!payload.date_of_birth?.trim()) {
        throw new ApiException(
          HRM_CORE_DEP_VAL_400,
          'Ngày sinh không được để trống',
          HttpStatus.BAD_REQUEST,
        );
      }
      updates.push(`date_of_birth = $${updates.length + 1}::date`);
      values.push(payload.date_of_birth);
    }
    if (payload.is_tax_dependent !== undefined) {
      updates.push(`is_tax_dependent = $${updates.length + 1}`);
      values.push(payload.is_tax_dependent);
    }
    if (payload.effective_from !== undefined) {
      updates.push(`effective_from = $${updates.length + 1}::date`);
      values.push(payload.effective_from);
    }
    if (payload.effective_to !== undefined) {
      updates.push(`effective_to = $${updates.length + 1}::date`);
      values.push(payload.effective_to);
    }
    if (updates.length === 0) {
      throw new ApiException(
        HRM_CORE_DEP_VAL_400,
        'Không có trường nào để cập nhật',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.db.query<EmployeeDependentRow>(
      `
        UPDATE public.employee_dependents
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${updates.length + 1}::uuid
          AND employee_id = $${updates.length + 2}::uuid
          AND company_id = $${updates.length + 3}::text
          AND archived_at IS NULL
        RETURNING
          id, employee_id, company_id, full_name, relation_code,
          date_of_birth::text AS date_of_birth, is_tax_dependent,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          archived_at, created_at, updated_at;
      `,
      [...values, dependentId, employeeId, parent.company_id],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CORE_DEP_404,
        'Dependent not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapDependent(row);
  }

  /** Soft-delete product path — sets archived_at (DENY hard DELETE as sole SoT). */
  async softDeleteDependent(
    employeeId: string,
    dependentId: string,
    query: GetEmployeeDependentQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const res = await this.db.query<EmployeeDependentRow>(
      `
        UPDATE public.employee_dependents
        SET archived_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
          AND employee_id = $2::uuid
          AND company_id = $3::text
          AND archived_at IS NULL
        RETURNING
          id, employee_id, company_id, full_name, relation_code,
          date_of_birth::text AS date_of_birth, is_tax_dependent,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          archived_at, created_at, updated_at;
      `,
      [dependentId, employeeId, parent.company_id],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CORE_DEP_404,
        'Dependent not found or already archived',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapDependent(row);
  }
}
