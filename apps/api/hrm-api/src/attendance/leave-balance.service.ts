import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  normalizePayrollListCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  canFullEmployeeUpdate,
  readJwtEmployeeId,
} from '../employees/employee-update-policy';
import { GetLeaveBalanceQueryDto } from './dto/get-leave-balance.query.dto';

const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';

type EmployeeScopeRow = {
  id: string;
  company_id: string;
  custom_fields: Record<string, unknown> | null;
};

type LeaveBalanceRow = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  balance_year: number;
  entitled_days: string;
  used_days: string;
  pending_days: string;
  updated_at: string;
};

export type LeaveBalancePayload = {
  company_id: string;
  employee_id: string;
  leave_type: string;
  balance_year: number;
  year: number;
  period: number;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  available_days: number;
  as_of: string;
  source: 'employee_leave_balances' | 'custom_fields' | 'default';
};

function calendarYearInHoChiMinh(): number {
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: HCM_TIMEZONE }).format(new Date());
  const match = /^(\d{4})-/.exec(iso);
  return match ? Number(match[1]) : new Date().getUTCFullYear();
}

function toDayNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

type MapBalanceInput = {
  company_id: string;
  employee_id: string;
  leave_type: string;
  balance_year: number;
  entitled_days: string | number;
  used_days: string | number;
  pending_days: string | number;
  updated_at?: string;
};

function mapBalancePayload(
  row: MapBalanceInput,
  source: LeaveBalancePayload['source'],
): LeaveBalancePayload {
  const entitled = toDayNumber(row.entitled_days);
  const used = toDayNumber(row.used_days);
  const pending = toDayNumber(row.pending_days);
  const remaining = Math.max(0, entitled - used - pending);
  const asOf =
    row.updated_at != null ? new Date(row.updated_at).toISOString() : new Date().toISOString();
  return {
    company_id: row.company_id,
    employee_id: row.employee_id,
    leave_type: row.leave_type,
    balance_year: row.balance_year,
    year: row.balance_year,
    period: row.balance_year,
    entitled_days: entitled,
    used_days: used,
    pending_days: pending,
    remaining_days: remaining,
    available_days: remaining,
    as_of: asOf,
    source,
  };
}

@Injectable()
export class LeaveBalanceService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL DEFAULT 'annual',
        balance_year INT NOT NULL,
        entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_leave_balances_employee_year
      ON public.employee_leave_balances (employee_id, balance_year DESC);
    `);
  }

  private assertSelfOrHrAccess(
    targetEmployeeId: string,
    authorization?: string,
  ): void {
    const jwtEmployeeId = readJwtEmployeeId(authorization);
    if (!jwtEmployeeId || canFullEmployeeUpdate(authorization)) {
      return;
    }
    if (jwtEmployeeId !== targetEmployeeId) {
      throw new ApiException(
        'HRM-LEAVE-403',
        'Leave balance may only be read for the authenticated employee',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async loadEmployeeInScope(
    employeeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmployeeScopeRow> {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, companyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const filters: string[] = ['e.id = $1::uuid', 'e.archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'e.id');
    const res = await this.db.query<EmployeeScopeRow>(
      `
        SELECT e.id, e.company_id, e.custom_fields
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-LEAVE-BAL-404',
      mismatchCode: 'HRM-ERR-SCOPE-INVALID',
    });
    if (!row) {
      throw new ApiException(
        'HRM-LEAVE-BAL-404',
        'Employee not found in scope',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  private readCustomFieldsFallback(
    employee: EmployeeScopeRow,
    leaveType: string,
    balanceYear: number,
  ): LeaveBalancePayload | null {
    const custom = employee.custom_fields ?? {};
    const key = `leave_balance_${leaveType}`;
    const raw = custom[key];
    if (raw == null || raw === '') {
      return null;
    }
    const entitled = toDayNumber(String(raw));
    return mapBalancePayload(
      {
        company_id: employee.company_id,
        employee_id: employee.id,
        leave_type: leaveType,
        balance_year: balanceYear,
        entitled_days: entitled,
        used_days: 0,
        pending_days: 0,
      },
      'custom_fields',
    );
  }

  async getLeaveBalance(
    query: GetLeaveBalanceQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<LeaveBalancePayload> {
    await this.ensureSchema();
    this.assertSelfOrHrAccess(query.employee_id, authorization);
    const employee = await this.loadEmployeeInScope(
      query.employee_id,
      query.company_id,
      authorization,
      tenantId,
    );

    const leaveType = query.leave_type?.trim() || 'annual';
    const balanceYear = query.year ?? calendarYearInHoChiMinh();

    const res = await this.db.query<LeaveBalanceRow>(
      `
        SELECT id, company_id, employee_id, leave_type, balance_year,
               entitled_days::text, used_days::text, pending_days::text, updated_at
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4
        LIMIT 1;
      `,
      [employee.company_id, employee.id, leaveType, balanceYear],
    );

    const row = res.rows[0];
    if (row) {
      return mapBalancePayload(
        {
          company_id: row.company_id,
          employee_id: row.employee_id,
          leave_type: row.leave_type,
          balance_year: row.balance_year,
          entitled_days: row.entitled_days,
          used_days: row.used_days,
          pending_days: row.pending_days,
          updated_at: row.updated_at,
        },
        'employee_leave_balances',
      );
    }

    const fallback = this.readCustomFieldsFallback(employee, leaveType, balanceYear);
    if (fallback) {
      return fallback;
    }

    return mapBalancePayload(
      {
        company_id: employee.company_id,
        employee_id: employee.id,
        leave_type: leaveType,
        balance_year: balanceYear,
        entitled_days: 0,
        used_days: 0,
        pending_days: 0,
      },
      'default',
    );
  }
}
