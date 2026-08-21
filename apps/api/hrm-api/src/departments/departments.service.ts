import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

export type DepartmentRow = {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  manager_name: string | null;
  manager_email: string | null;
  employee_count: number;
  level: number;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class DepartmentsService {
  constructor(private readonly db: HrmDbService) {}

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
  }

  private mapRow(row: DepartmentRow) {
    return {
      ...row,
      employee_count: Number(row.employee_count ?? 0),
      level: Number(row.level ?? 1),
      sort_order: Number(row.sort_order ?? 0),
    };
  }

  private selectColumns = `
    id, company_id, parent_id, name, code, description, manager_name, manager_email,
    employee_count, level, sort_order, status, created_at, updated_at
  `;

  async listDepartments(
    query: ListDepartmentsQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
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
    const data = res.rows.map((row) => this.mapRow(row));
    return { total: data.length, data };
  }

  async getDepartmentById(
    departmentId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [departmentId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<DepartmentRow>(
      `SELECT ${this.selectColumns}
       FROM public.departments
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-DEPT-404',
        'Department not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapRow(row);
  }

  async createDepartment(payload: CreateDepartmentDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const id = randomUUID();
    const res = await this.db.query<DepartmentRow>(
      `INSERT INTO public.departments (
        id, company_id, parent_id, name, code, description, manager_name, manager_email,
        level, sort_order, status
      ) VALUES (
        $1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10, 'active'
      )
      RETURNING ${this.selectColumns};`,
      [
        id,
        companyId,
        payload.parent_id ?? null,
        payload.name.trim(),
        payload.code?.trim() ?? null,
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
  ) {
    await this.ensureSchema();
    const existing = await this.getDepartmentById(
      departmentId,
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
    values.push(departmentId);
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
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEPT-404',
      mismatchCode: 'HRM-DEPT-409',
    });
    await this.db.query(`DELETE FROM public.departments WHERE id = $1::uuid;`, [
      departmentId,
    ]);
    return { id: departmentId };
  }
}
