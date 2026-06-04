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
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { ListEmployeeInsurancesQueryDto } from './dto/list-employee-insurances.query.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';

export type EmployeeInsuranceRow = {
  id: string;
  employee_id: string;
  company_id: string;
  type: string;
  provider: string;
  policy_number: string | null;
  start_date: string | null;
  end_date: string | null;
  contribution: string | number;
  employer_contribution: string | number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class EmployeeInsurancesService {
  constructor(private readonly db: HrmDbService) {}

  private selectColumns = `
    id, employee_id, company_id, type, provider, policy_number, start_date, end_date,
    contribution, employer_contribution, status, notes, created_at, updated_at
  `;

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_insurances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'social',
        provider TEXT NOT NULL,
        policy_number TEXT,
        start_date DATE,
        end_date DATE,
        contribution NUMERIC NOT NULL DEFAULT 0,
        employer_contribution NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_insurances_company_employee
      ON public.employee_insurances (company_id, employee_id);
    `);
  }

  private mapRow(row: EmployeeInsuranceRow) {
    return {
      ...row,
      contribution: Number(row.contribution ?? 0),
      employer_contribution: Number(row.employer_contribution ?? 0),
    };
  }

  async list(query: ListEmployeeInsurancesQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.employee_id) {
      values.push(query.employee_id);
      filters.push(`employee_id = $${values.length}::uuid`);
    }
    const res = await this.db.query<EmployeeInsuranceRow>(
      `SELECT ${this.selectColumns}
       FROM public.employee_insurances
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
    const res = await this.db.query<EmployeeInsuranceRow>(
      `SELECT ${this.selectColumns}
       FROM public.employee_insurances
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-EINS-404', 'Employee insurance not found', HttpStatus.NOT_FOUND);
    }
    return this.mapRow(row);
  }

  async create(payload: CreateEmployeeInsuranceDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const id = randomUUID();
    const res = await this.db.query<EmployeeInsuranceRow>(
      `INSERT INTO public.employee_insurances (
        id, employee_id, company_id, type, provider, policy_number, start_date, end_date,
        contribution, employer_contribution, status, notes
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7::date, $8::date, $9, $10, $11, $12
      )
      RETURNING ${this.selectColumns};`,
      [
        id,
        payload.employee_id,
        companyId,
        payload.type ?? 'social',
        payload.provider.trim(),
        payload.policy_number?.trim() ?? null,
        payload.start_date ?? null,
        payload.end_date ?? null,
        payload.contribution ?? 0,
        payload.employer_contribution ?? 0,
        payload.status ?? 'active',
        payload.notes ?? null,
      ],
    );
    return this.mapRow(res.rows[0]);
  }

  async update(id: string, payload: UpdateEmployeeInsuranceDto, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.getById(id, payload.company_id, authorization);
    const scope = resolveHrmListScope(authorization, payload.company_id);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EINS-404',
      mismatchCode: 'HRM-EINS-409',
    });
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (payload.type != null) set('type', payload.type);
    if (payload.provider != null) set('provider', payload.provider.trim());
    if (payload.policy_number !== undefined) set('policy_number', payload.policy_number?.trim() ?? null);
    if (payload.start_date !== undefined) set('start_date', payload.start_date);
    if (payload.end_date !== undefined) set('end_date', payload.end_date);
    if (payload.contribution != null) set('contribution', payload.contribution);
    if (payload.employer_contribution != null) set('employer_contribution', payload.employer_contribution);
    if (payload.status != null) set('status', payload.status);
    if (payload.notes !== undefined) set('notes', payload.notes ?? null);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(id);
    const res = await this.db.query<EmployeeInsuranceRow>(
      `UPDATE public.employee_insurances SET ${fields.join(', ')}
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
      notFoundCode: 'HRM-EINS-404',
      mismatchCode: 'HRM-EINS-409',
    });
    await this.db.query(`DELETE FROM public.employee_insurances WHERE id = $1::uuid;`, [id]);
    return { id };
  }
}
