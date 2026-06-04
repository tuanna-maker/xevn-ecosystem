import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { pushCompanyIdFilter, resolveHrmListScope, resolveHrmPersistCompanyIdText } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateEmployeeKpiDto } from './dto/create-employee-kpi.dto';
import { ListEmployeeKpisQueryDto } from './dto/list-employee-kpis.query.dto';

@Injectable()
export class EmployeeKpisService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_kpis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        kpi_name TEXT NOT NULL,
        kpi_type TEXT,
        target_value NUMERIC,
        actual_value NUMERIC,
        unit TEXT,
        weight NUMERIC,
        period_start DATE,
        period_end DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async list(query: ListEmployeeKpisQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.employee_id) {
      values.push(query.employee_id);
      filters.push(`employee_id = $${values.length}::uuid`);
    }
    const res = await this.db.query(
      `SELECT * FROM public.employee_kpis
       WHERE ${filters.join(' AND ')}
       ORDER BY period_end DESC NULLS LAST, created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async create(payload: CreateEmployeeKpiDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.employee_kpis (
        id, employee_id, company_id, kpi_name, kpi_type, target_value, actual_value,
        unit, weight, period_start, period_end, status, notes
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10::date, $11::date, $12, $13
      ) RETURNING *;`,
      [
        id,
        payload.employee_id,
        companyId,
        payload.kpi_name.trim(),
        payload.kpi_type ?? null,
        payload.target_value ?? null,
        payload.actual_value ?? null,
        payload.unit ?? null,
        payload.weight ?? null,
        payload.period_start ?? null,
        payload.period_end ?? null,
        payload.status ?? 'active',
        payload.notes ?? null,
      ],
    );
    return res.rows[0];
  }

  async remove(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.employee_kpis WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-KPI-404', 'Employee KPI not found', HttpStatus.NOT_FOUND);
    }
    return { id };
  }
}
