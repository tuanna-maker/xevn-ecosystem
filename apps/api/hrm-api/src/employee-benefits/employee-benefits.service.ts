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
import { CreateEmployeeBenefitDto } from './dto/create-employee-benefit.dto';
import { ListEmployeeBenefitsQueryDto } from './dto/list-employee-benefits.query.dto';
import { UpdateEmployeeBenefitDto } from './dto/update-employee-benefit.dto';

export type EmployeeBenefitRow = {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  category: string;
  value: string | number;
  unit: string;
  frequency: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class EmployeeBenefitsService {
  constructor(private readonly db: HrmDbService) {}

  private selectColumns = `
    id, employee_id, company_id, name, category, value, unit, frequency,
    start_date, end_date, status, description, created_at, updated_at
  `;

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_benefits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'allowance',
        value NUMERIC NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'VNĐ',
        frequency TEXT NOT NULL DEFAULT 'monthly',
        start_date DATE,
        end_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private mapRow(row: EmployeeBenefitRow) {
    return {
      ...row,
      value: Number(row.value ?? 0),
    };
  }

  async list(query: ListEmployeeBenefitsQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.employee_id) {
      values.push(query.employee_id);
      filters.push(`employee_id = $${values.length}::uuid`);
    }
    const res = await this.db.query<EmployeeBenefitRow>(
      `SELECT ${this.selectColumns}
       FROM public.employee_benefits
       WHERE ${filters.join(' AND ')}
       ORDER BY created_at DESC;`,
      values,
    );
    const data = res.rows.map((row) => this.mapRow(row));
    return { total: data.length, data };
  }

  async getById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<EmployeeBenefitRow>(
      `SELECT ${this.selectColumns}
       FROM public.employee_benefits
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-EBEN-404',
        'Employee benefit not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapRow(row);
  }

  async create(payload: CreateEmployeeBenefitDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const id = randomUUID();
    const res = await this.db.query<EmployeeBenefitRow>(
      `INSERT INTO public.employee_benefits (
        id, employee_id, company_id, name, category, value, unit, frequency,
        start_date, end_date, status, description
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9::date, $10::date, $11, $12
      )
      RETURNING ${this.selectColumns};`,
      [
        id,
        payload.employee_id,
        companyId,
        payload.name.trim(),
        payload.category ?? 'allowance',
        payload.value,
        payload.unit ?? 'VNĐ',
        payload.frequency ?? 'monthly',
        payload.start_date ?? null,
        payload.end_date ?? null,
        payload.status ?? 'active',
        payload.description ?? null,
      ],
    );
    return this.mapRow(res.rows[0]);
  }

  async update(
    id: string,
    payload: UpdateEmployeeBenefitDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getById(id, payload.company_id, authorization);
    const scope = resolveHrmListScope(authorization, payload.company_id);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EBEN-404',
      mismatchCode: 'HRM-EBEN-409',
    });
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (payload.name != null) set('name', payload.name.trim());
    if (payload.category != null) set('category', payload.category);
    if (payload.value != null) set('value', payload.value);
    if (payload.unit != null) set('unit', payload.unit);
    if (payload.frequency != null) set('frequency', payload.frequency);
    if (payload.start_date !== undefined) set('start_date', payload.start_date);
    if (payload.end_date !== undefined) set('end_date', payload.end_date);
    if (payload.status != null) set('status', payload.status);
    if (payload.description !== undefined)
      set('description', payload.description ?? null);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(id);
    const res = await this.db.query<EmployeeBenefitRow>(
      `UPDATE public.employee_benefits SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.selectColumns};`,
      values,
    );
    return this.mapRow(res.rows[0]);
  }

  async remove(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.getById(id, companyId, authorization);
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EBEN-404',
      mismatchCode: 'HRM-EBEN-409',
    });
    await this.db.query(
      `DELETE FROM public.employee_benefits WHERE id = $1::uuid;`,
      [id],
    );
    return { id };
  }
}
