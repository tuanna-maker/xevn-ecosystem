import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';

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

  private async getPeriodById(periodId: string) {
    const res = await this.db.query<PayrollPeriodRow>(
      `
        SELECT
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at
        FROM public.payroll_periods
        WHERE id = $1::uuid
        LIMIT 1;
      `,
      [periodId],
    );
    return res.rows[0];
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

  async listPayrollPeriods(query: ListPayrollPeriodsQueryDto) {
    await this.ensureSchema();
    const filters = ['company_id = $1'];
    const values: unknown[] = [query.company_id];
    if (query.status) {
      filters.push('status = $2');
      values.push(query.status);
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

  async processPayrollPeriod(periodId: string) {
    await this.ensureSchema();
    const current = await this.getPeriodById(periodId);
    if (!current) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
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

  async closePayrollPeriod(periodId: string) {
    await this.ensureSchema();
    const current = await this.getPeriodById(periodId);
    if (!current) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
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

  async getPayrollReconciliationSummary(companyId: string) {
    await this.ensureSchema();
    const res = await this.db.query<{ status: 'draft' | 'processed' | 'closed'; total: string }>(
      `
        SELECT status, COUNT(*)::text AS total
        FROM public.payroll_periods
        WHERE company_id = $1
        GROUP BY status;
      `,
      [companyId],
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

  async listPayslips(query: { company_id: string; period_id?: string }) {
    await this.ensureSchema();
    const filters = ['p.company_id = $1'];
    const values: unknown[] = [query.company_id];
    if (query.period_id) {
      filters.push(`p.period_id = $2::uuid`);
      values.push(query.period_id);
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
}
