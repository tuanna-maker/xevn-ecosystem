import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { CreateAdvanceRequestDto } from './dto/create-advance-request.dto';
import { DecideAdvanceRequestDto } from './dto/decide-advance-request.dto';
import { ListAdvanceRequestsQueryDto } from './dto/list-advance-requests.query.dto';

type PayrollPayslipRow = {
  id: string;
  company_id: string;
  period_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  gross_amount: string;
  deduction_amount: string;
  net_amount: string;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type PayrollPeriodRow = {
  id: string;
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'processed' | 'closed';
  created_by: string | null;
  processed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PayrollService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payroll_periods (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        period_label TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT NULL,
        processed_at TIMESTAMPTZ NULL,
        closed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_payroll_status CHECK (status IN ('draft', 'processed', 'closed')),
        CONSTRAINT chk_payroll_date_range CHECK (start_date <= end_date)
      );
    `);
    try {
      await this.db.query(`
        ALTER TABLE public.payroll_periods
        ALTER COLUMN company_id TYPE TEXT USING company_id::text;
      `);
    } catch {
      /* already text */
    }
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_period_company_date_range
      ON public.payroll_periods (company_id, start_date, end_date);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payroll_payslips (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        deduction_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'VND',
        status TEXT NOT NULL DEFAULT 'processed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_payslip_status CHECK (status IN ('draft', 'processed', 'paid'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_payslip_period_employee
      ON public.payroll_payslips (period_id, employee_id);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.advance_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        salary_period TEXT NOT NULL,
        department TEXT,
        position TEXT,
        employee_count INTEGER DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        current_approval_level INTEGER DEFAULT 1,
        approval_steps JSONB,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.advance_request_employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        request_id UUID NOT NULL REFERENCES public.advance_requests(id) ON DELETE CASCADE,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        advance_amount NUMERIC NOT NULL DEFAULT 0,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private mapPeriod(row: PayrollPeriodRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      period_label: row.period_label,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      created_by: row.created_by,
      processed_at: row.processed_at,
      closed_at: row.closed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async queryPeriodInScope(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PayrollPeriodRow | undefined> {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [periodId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<PayrollPeriodRow>(
      `
        SELECT
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at
        FROM public.payroll_periods
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    return res.rows[0];
  }

  async getPeriodById(periodId: string, requestedCompanyId: string, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const row = await this.queryPeriodInScope(periodId, requestedCompanyId, authorization);
    if (!row) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    return this.mapPeriod(row);
  }

  async createPayrollPeriod(payload: CreatePayrollPeriodDto) {
    await this.ensureSchema();
    if (new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()) {
      throw new ApiException('HRM-PAY-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
    }

    const overlapRes = await this.db.query<{ id: string }>(
      `
        SELECT id
        FROM public.payroll_periods
        WHERE company_id = $1
          AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
        LIMIT 1;
      `,
      [payload.company_id, payload.start_date, payload.end_date],
    );
    if (overlapRes.rows[0]) {
      throw new ApiException('HRM-PAY-002', 'Payroll period overlaps with existing period', HttpStatus.CONFLICT);
    }

    const res = await this.db.query<PayrollPeriodRow>(
      `
        INSERT INTO public.payroll_periods (
          id, company_id, period_label, start_date, end_date, status, created_by
        ) VALUES ($1, $2, $3, $4::date, $5::date, 'draft', $6)
        RETURNING
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at;
      `,
      [
        randomUUID(),
        payload.company_id,
        payload.period_label.trim(),
        payload.start_date,
        payload.end_date,
        payload.created_by?.trim() ?? null,
      ],
    );
    return this.mapPeriod(res.rows[0]);
  }

  async listPayrollPeriods(query: ListPayrollPeriodsQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }
    const res = await this.db.query<PayrollPeriodRow>(
      `
        SELECT
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at
        FROM public.payroll_periods
        WHERE ${filters.join(' AND ')}
        ORDER BY start_date DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows.map((row) => this.mapPeriod(row)) };
  }

  async processPayrollPeriod(periodId: string, requestedCompanyId: string, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(periodId, requestedCompanyId, authorization);
    if (!current) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (current.status !== 'draft') {
      throw new ApiException('HRM-PAY-003', 'Only draft payroll periods can move to processed', HttpStatus.CONFLICT);
    }

    const res = await this.db.query<PayrollPeriodRow>(
      `
        UPDATE public.payroll_periods
        SET status = 'processed', processed_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at;
      `,
      [periodId],
    );
    return this.mapPeriod(res.rows[0]);
  }

  async closePayrollPeriod(periodId: string, requestedCompanyId: string, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(periodId, requestedCompanyId, authorization);
    if (!current) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (current.status !== 'processed') {
      throw new ApiException(
        'HRM-PAY-004',
        'Only processed payroll periods can be closed',
        HttpStatus.CONFLICT,
      );
    }

    const res = await this.db.query<PayrollPeriodRow>(
      `
        UPDATE public.payroll_periods
        SET status = 'closed', closed_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at;
      `,
      [periodId],
    );
    return this.mapPeriod(res.rows[0]);
  }

  async getPayrollReconciliationSummary(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const where = filters.join(' AND ');
    const res = await this.db.query<{ status: 'draft' | 'processed' | 'closed'; total: string }>(
      `
        SELECT status, COUNT(*)::text AS total
        FROM public.payroll_periods
        WHERE ${where}
        GROUP BY status;
      `,
      values,
    );
    const summary = { draft: 0, processed: 0, closed: 0 };
    for (const row of res.rows) {
      summary[row.status] = Number(row.total ?? 0);
    }
    return summary;
  }

  private mapPayslip(row: PayrollPayslipRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      period_id: row.period_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code,
      employee_name: row.employee_name,
      gross_amount: Number(row.gross_amount),
      deduction_amount: Number(row.deduction_amount),
      net_amount: Number(row.net_amount),
      currency: row.currency,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async listPayslips(
    query: {
      company_id: string;
      period_id?: string;
      employee_id?: string;
      page?: number | string;
      page_size?: number | string;
      pageSize?: number | string;
    },
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, scopeContext);
    const filters: string[] = [];
    const values: unknown[] = [];
    if (scope.masterTenantPartition || scope.memberTenantId) {
      pushWorkforceEmployeeScopeFilter(filters, values, scope, 'p.employee_id');
    } else if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`p.company_id = $${values.length}`);
    } else {
      values.push(scope.companyIds);
      filters.push(`p.company_id = ANY($${values.length}::text[])`);
    }
    if (query.period_id) {
      values.push(query.period_id);
      filters.push(`p.period_id = $${values.length}::uuid`);
    }
    if (query.employee_id) {
      values.push(query.employee_id);
      filters.push(`p.employee_id = $${values.length}::uuid`);
    }
    const res = await this.db.query<PayrollPayslipRow & { period_label: string }>(
      `
        SELECT
          p.id, p.company_id, p.period_id, p.employee_id, p.employee_code, p.employee_name,
          p.gross_amount::text, p.deduction_amount::text, p.net_amount::text,
          p.currency, p.status, p.created_at, p.updated_at,
          pp.period_label
        FROM public.payroll_payslips p
        JOIN public.payroll_periods pp ON pp.id = p.period_id
        WHERE ${filters.join(' AND ')}
        ORDER BY pp.start_date DESC, p.employee_code ASC;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => ({
        ...this.mapPayslip(row),
        period_label: row.period_label,
      })),
    };
  }

  private async ensureSalaryTemplateSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.salary_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_salary_templates_company_code UNIQUE (company_id, code)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_salary_template_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        component_id UUID NOT NULL,
        default_value NUMERIC NOT NULL DEFAULT 0,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async listSalaryTemplates(
    query: { company_id: string; status?: string },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }
    const res = await this.db.query<{
      id: string;
      company_id: string;
      code: string;
      name: string;
      description: string | null;
      is_default: boolean;
      status: string;
      created_at: string;
      updated_at: string;
    }>(
      `
        SELECT id, company_id, code, name, description, is_default, status, created_at, updated_at
        FROM public.salary_templates
        WHERE ${filters.join(' AND ')}
        ORDER BY is_default DESC, name ASC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createSalaryTemplate(
    payload: {
      company_id: string;
      code: string;
      name: string;
      description?: string;
      is_default?: boolean;
    },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    if (payload.is_default) {
      await this.db.query(
        `UPDATE public.salary_templates SET is_default = FALSE, updated_at = NOW() WHERE company_id = $1;`,
        [companyId],
      );
    }
    const res = await this.db.query(
      `
        INSERT INTO public.salary_templates (id, company_id, code, name, description, is_default, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING id, company_id, code, name, description, is_default, status, created_at, updated_at;
      `,
      [
        randomUUID(),
        companyId,
        payload.code.trim(),
        payload.name.trim(),
        payload.description ?? null,
        payload.is_default ?? false,
      ],
    );
    return res.rows[0];
  }

  async updateSalaryTemplate(
    templateId: string,
    payload: {
      company_id: string;
      code?: string;
      name?: string;
      description?: string;
      is_default?: boolean;
      status?: string;
    },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const existingRes = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM public.salary_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new ApiException('HRM-PAY-404', 'Salary template not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (payload.is_default) {
      await this.db.query(
        `UPDATE public.salary_templates SET is_default = FALSE, updated_at = NOW() WHERE company_id = $1;`,
        [existing.company_id],
      );
    }
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (payload.code != null) set('code', payload.code.trim());
    if (payload.name != null) set('name', payload.name.trim());
    if (payload.description !== undefined) set('description', payload.description ?? null);
    if (payload.is_default != null) set('is_default', payload.is_default);
    if (payload.status != null) set('status', payload.status);
    if (fields.length === 0) {
      const res = await this.db.query(
        `SELECT id, company_id, code, name, description, is_default, status, created_at, updated_at
         FROM public.salary_templates WHERE id = $1::uuid;`,
        [templateId],
      );
      return res.rows[0];
    }
    fields.push('updated_at = NOW()');
    values.push(templateId);
    const res = await this.db.query(
      `UPDATE public.salary_templates SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING id, company_id, code, name, description, is_default, status, created_at, updated_at;`,
      values,
    );
    return res.rows[0];
  }

  async deleteSalaryTemplate(templateId: string, companyId: string, authorization?: string) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existingRes = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM public.salary_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new ApiException('HRM-PAY-404', 'Salary template not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    await this.db.query(`DELETE FROM public.salary_templates WHERE id = $1::uuid;`, [templateId]);
    return { id: templateId };
  }

  async listSalaryTemplateComponents(templateId: string, companyId: string, authorization?: string) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['stc.template_id = $1::uuid'];
    const values: unknown[] = [templateId];
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`stc.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`stc.company_id = ANY($${values.length}::text[])`);
    }
    const res = await this.db.query(
      `SELECT stc.*, sc.code AS component_code, sc.name AS component_name, sc.component_type, sc.nature, sc.value_type
       FROM public.hrm_salary_template_components stc
       LEFT JOIN public.salary_components sc ON sc.id = stc.component_id
       WHERE ${filters.join(' AND ')}
       ORDER BY stc.sort_order ASC;`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => ({
        id: row.id,
        template_id: row.template_id,
        component_id: row.component_id,
        default_value: Number(row.default_value ?? 0),
        is_required: Boolean(row.is_required),
        sort_order: Number(row.sort_order ?? 0),
        created_at: row.created_at,
        component: row.component_code
          ? {
              id: row.component_id,
              code: row.component_code,
              name: row.component_name,
              component_type: row.component_type,
              nature: row.nature,
              value_type: row.value_type,
            }
          : undefined,
      })),
    };
  }

  async addSalaryTemplateComponent(
    templateId: string,
    payload: { company_id: string; component_id: string; default_value?: number; is_required?: boolean; sort_order?: number },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_salary_template_components
        (id, template_id, company_id, component_id, default_value, is_required, sort_order)
       VALUES ($1, $2::uuid, $3, $4::uuid, $5, $6, $7) RETURNING *;`,
      [id, templateId, companyId, payload.component_id, payload.default_value ?? 0, payload.is_required ?? false, payload.sort_order ?? 0],
    );
    return res.rows[0];
  }

  async updateSalaryTemplateComponent(
    componentRowId: string,
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_salary_template_components WHERE id = $1::uuid LIMIT 1;`,
      [componentRowId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-STC-404', mismatchCode: 'HRM-STC-409' });
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of ['default_value', 'is_required', 'sort_order']) {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }
    values.push(componentRowId);
    const res = await this.db.query(
      `UPDATE public.hrm_salary_template_components SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  async removeSalaryTemplateComponent(componentRowId: string, companyId: string, authorization?: string) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_salary_template_components WHERE id = $1::uuid LIMIT 1;`,
      [componentRowId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-STC-404', mismatchCode: 'HRM-STC-409' });
    await this.db.query(`DELETE FROM public.hrm_salary_template_components WHERE id = $1::uuid;`, [componentRowId]);
    return { id: componentRowId };
  }

  async duplicateSalaryTemplate(templateId: string, companyId: string, authorization?: string) {
    const existing = await this.db.query(
      `SELECT * FROM public.salary_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException('HRM-PAY-404', 'Salary template not found', HttpStatus.NOT_FOUND);
    }
    const copy = await this.createSalaryTemplate(
      {
        company_id: companyId,
        code: `${row.code}-copy`,
        name: `${row.name} (copy)`,
        description: row.description,
        is_default: false,
      },
      authorization,
    );
    const components = await this.listSalaryTemplateComponents(templateId, companyId, authorization);
    for (const comp of components.data) {
      await this.addSalaryTemplateComponent(
        copy.id,
        {
          company_id: companyId,
          component_id: comp.component_id,
          default_value: comp.default_value,
          is_required: comp.is_required,
          sort_order: comp.sort_order,
        },
        authorization,
      );
    }
    return copy;
  }

  async upsertPayslip(input: {
    company_id: string;
    period_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    gross_amount: number;
    deduction_amount: number;
    net_amount: number;
    status?: string;
  }) {
    await this.ensureSchema();
    const res = await this.db.query<PayrollPayslipRow>(
      `
        INSERT INTO public.payroll_payslips (
          id, company_id, period_id, employee_id, employee_code, employee_name,
          gross_amount, deduction_amount, net_amount, status
        ) VALUES ($1, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (period_id, employee_id) DO UPDATE SET
          employee_code = EXCLUDED.employee_code,
          employee_name = EXCLUDED.employee_name,
          gross_amount = EXCLUDED.gross_amount,
          deduction_amount = EXCLUDED.deduction_amount,
          net_amount = EXCLUDED.net_amount,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING
          id, company_id, period_id, employee_id, employee_code, employee_name,
          gross_amount::text, deduction_amount::text, net_amount::text,
          currency, status, created_at, updated_at;
      `,
      [
        randomUUID(),
        input.company_id,
        input.period_id,
        input.employee_id,
        input.employee_code,
        input.employee_name,
        input.gross_amount,
        input.deduction_amount,
        input.net_amount,
        input.status ?? 'processed',
      ],
    );
    return this.mapPayslip(res.rows[0]);
  }

  async listAdvanceRequests(query: ListAdvanceRequestsQueryDto, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const params: unknown[] = [];
    const filters: string[] = [];
    pushCompanyIdFilter(filters, params, scope.companyIds);
    let sql = `SELECT ar.* FROM public.advance_requests ar WHERE ${filters.join(' AND ')}`;
    if (query.status?.trim()) {
      params.push(query.status.trim());
      sql += ` AND ar.status = $${params.length}`;
    }
    sql += ` ORDER BY ar.created_at DESC LIMIT 200`;
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createAdvanceRequest(body: CreateAdvanceRequestDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id);
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.advance_requests (
          id, company_id, name, salary_period, department, position, approval_steps, status
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7::jsonb, 'pending'
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.name.trim(),
        body.salary_period.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.approval_steps ? JSON.stringify(body.approval_steps) : null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-ADV-500', 'Failed to create advance request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return row;
  }

  async listAdvanceRequestEmployees(requestId: string, companyId: string, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const header = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(header, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `SELECT * FROM public.advance_request_employees WHERE request_id = $1::uuid ORDER BY created_at;`,
      [requestId],
    );
    return { total: res.rows.length, data: res.rows };
  }

  private async loadAdvanceRequestScopeRow(requestId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM public.advance_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  async approveAdvanceRequest(
    requestId: string,
    _body: DecideAdvanceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.advance_requests
        SET status = 'approved',
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-ADV-404', 'Advance request not found or not pending', HttpStatus.NOT_FOUND);
    }
    return row;
  }

  async rejectAdvanceRequest(
    requestId: string,
    _body: DecideAdvanceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.advance_requests
        SET status = 'rejected',
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-ADV-404', 'Advance request not found or not pending', HttpStatus.NOT_FOUND);
    }
    return row;
  }

  async markAdvanceRequestPaid(
    requestId: string,
    _body: DecideAdvanceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.advance_requests
        SET status = 'paid',
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'approved'
        RETURNING *;
      `,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ADV-404',
        'Advance request not found or not approved',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }
}
