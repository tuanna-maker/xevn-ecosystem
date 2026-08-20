/**
 * @CODE-MEMORY
 * Screen:     HRM → Số dư phép (leave-balance) · panel quỹ khi nộp đơn
 * UC:         FR-UC-H03 · FR-UC-M03 · FR-UC-BP-ATT-05b
 * BR:         BR-BP-LV-PANEL-01 · ưu tiên employee_leave_balances · fallback custom_fields · source tag
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.8 · FR-UC-BP-ATT-05b
 * TechSpec:   docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §4.1 · ADR-HRM-ATTENDANCE-CFG-PERSIST (scope slug)
 * Purpose:    Đọc số dư phép trước/khi tạo đơn — display-ready; panel 5 loại MVP một request.
 * WorkItem:   W1-B-01-TC-LEAVE
 * Coded:      2026-08-03
 * Callers:    attendance.controller.ts GET leave-balance · leave-balance/panel
 * Callees:    HrmDbService · resolveHrmListScope · employee_leave_balances / employees.custom_fields
 * must_keep:  scope parity loadEmployeeInScope · self-or-HR access · source tag · soft default 0 · empty hợp lệ
 * SOLID:      Balance đọc tách LeaveRequestsService mutate
 * LastVerified: leave-balance.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-TC-LEAVE
 * change_mode: UPGRADE
 * What: CODE-MEMORY + leave_type_label trên payload (OS 28 display-ready)
 * must_keep: source tag · scope · no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-ATT-03d-05b-BE-01
 * change_mode: ADD
 * What: GET leave-balance/panel — 5 loại MVP (năm/thâm niên/bù/chuyển kỳ/ứng) một response;
 *       label VI; empty/default 0 hợp lệ; không hardcode tháng FY.
 * Why:  SRS v0.8 FR-UC-BP-ATT-05b — panel khi nộp đơn; tránh spinner storm N×GET.
 * must_keep: getLeaveBalance single-type contract; U65 no seed; ATT-04 FY CRUD không invent
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02
 * change_mode: ADD
 * What: PUT tracked-entitlement upsert employee_leave_balances (HR grant · U65 product path · ≠ seed)
 * Why:  UC-BP-ATT-09 hold AC cần row PRESENT — QA R-ATT-09-NO-TRACKED-BALANCE
 * must_keep: GET panel/single · source tag · DENY att_leave_hold dual · Nest /core DENY · ≠ ATT-09 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01
 * change_mode: ADD
 * What: advanced_days column + available = entitled − used − pending − advanced_days on GET/panel;
 *       parity assertSufficientLeaveBalance in leave-requests.service.ts
 * Why:  FR-UC-BP-ATT-04b DATA-01 §4.1 · R-ATT-04B-ADVANCED-WIRE · must_keep ATT09 pending_days
 * must_keep: HRM_LEAVE_VAL_BALANCE · DENY att_leave_hold · DENY F-ATT-LEAVE-04 offset · ≠ FR-04b DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-02
 * change_mode: FIX
 * What: GET balance/panel query employee_leave_balances với alias company_id (main↔holding↔UUID);
 *       OT accrual partition read parity — J-HRM-ATT-06-04 compensatory entitled sau approve.
 * Why:  Accrual ghi holding (persist) · employee.company_id UUID/main → entitled 0 trên read.
 * must_keep: DENY merge compensatory→annual · pending_days hold · source tag · ≠ ATT-06 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-03
 * change_mode: FIX
 * What: GET single leave_type dùng lower(leave_type) parity panel.
 * Why:  J-04 read miss row khi leave_type casing lệch policy key.
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01
 * change_mode: ADD
 * What: Peer RETAIN — auto enroll consumer ghi cùng bảng/cột (AttActivateEnrollService)
 * Why:  FR-UC-BP-ATT-12 · AC-ATT-12-≠-MANUAL-AUTO-DONE · upsertTrackedEntitlement unchanged
 * must_keep: DENY merge buckets · ATT09 pending_days · ≠ ATT-12 DONE
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandPayrollAttendanceSheetCompanyIds,
  normalizePayrollListCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  canFullEmployeeUpdate,
  readJwtEmployeeId,
} from '../employees/employee-update-policy';
import { GetLeaveBalancePanelQueryDto } from './dto/get-leave-balance-panel.query.dto';
import { GetLeaveBalanceQueryDto } from './dto/get-leave-balance.query.dto';
import { UpsertTrackedLeaveBalanceDto } from './dto/upsert-tracked-leave-balance.dto';

const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/** SRS ATT-04 / ATT-05b — tối thiểu 5 loại quỹ (code canonical GĐ1). */
export const MVP_LEAVE_BALANCE_TYPES = [
  'annual',
  'seniority',
  'compensatory',
  'carry_over',
  'advance',
] as const;

export type MvpLeaveBalanceType = (typeof MVP_LEAVE_BALANCE_TYPES)[number];

const LEAVE_TYPE_LABELS_VI: Record<string, string> = {
  annual: 'Phép năm',
  annual_leave: 'Phép năm',
  seniority: 'Phép thâm niên',
  seniority_leave: 'Phép thâm niên',
  compensatory: 'Phép bù OT',
  compensatory_leave: 'Phép bù OT',
  carry_over: 'Phép chuyển kỳ',
  carryover: 'Phép chuyển kỳ',
  carry_forward: 'Phép chuyển kỳ',
  advance: 'Ứng phép',
  leave_advance: 'Ứng phép',
  advance_leave: 'Ứng phép',
  sick: 'Nghỉ ốm',
  sick_leave: 'Nghỉ ốm',
  maternity: 'Thai sản',
  unpaid: 'Không lương',
};

function leaveTypeLabelVi(leaveType: string): string {
  const key = leaveType.trim().toLowerCase();
  return LEAVE_TYPE_LABELS_VI[key] ?? leaveType;
}

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
  advanced_days?: string;
  updated_at: string;
};

export type LeaveBalancePayload = {
  company_id: string;
  employee_id: string;
  leave_type: string;
  leave_type_label: string;
  balance_year: number;
  year: number;
  period: number;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  advanced_days: number;
  remaining_days: number;
  available_days: number;
  as_of: string;
  source: 'employee_leave_balances' | 'custom_fields' | 'default';
};

export type LeaveBalancePanelPayload = {
  company_id: string;
  employee_id: string;
  balance_year: number;
  year: number;
  as_of: string;
  /** Luôn đủ 5 loại MVP — thiếu row → source default / custom_fields, số 0 hợp lệ. */
  items: LeaveBalancePayload[];
};

function calendarYearInHoChiMinh(): number {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: HCM_TIMEZONE,
  }).format(new Date());
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
  advanced_days?: string | number;
  updated_at?: string;
};

/** FR-UC-BP-ATT-04b — shared with leave-requests assertSufficientLeaveBalance. */
export function computeLeaveAvailableDays(
  entitled: number,
  used: number,
  pending: number,
  advanced: number,
): number {
  return Math.max(0, entitled - used - pending - advanced);
}

/** Partition aliases for TEXT company_id on employee_leave_balances (ADR main↔holding). */
function expandLeaveBalanceCompanyKeys(employeeCompanyId: string): string[] {
  return expandPayrollAttendanceSheetCompanyIds(employeeCompanyId);
}

function pickPreferredBalanceRow(
  rows: LeaveBalanceRow[],
  employeeCompanyId: string,
  leaveType: string,
): LeaveBalanceRow | undefined {
  const lt = leaveType.trim().toLowerCase();
  const matches = rows.filter((r) => r.leave_type.trim().toLowerCase() === lt);
  if (matches.length === 0) {
    return undefined;
  }
  const empKey = employeeCompanyId.trim().toLowerCase();
  const exact = matches.find(
    (r) => r.company_id.trim().toLowerCase() === empKey,
  );
  if (exact) {
    return exact;
  }
  return matches.reduce((best, row) =>
    toDayNumber(row.entitled_days) > toDayNumber(best.entitled_days)
      ? row
      : best,
  );
}

function mapBalancePayload(
  row: MapBalanceInput,
  source: LeaveBalancePayload['source'],
): LeaveBalancePayload {
  const entitled = toDayNumber(row.entitled_days);
  const used = toDayNumber(row.used_days);
  const pending = toDayNumber(row.pending_days);
  const advanced = toDayNumber(row.advanced_days);
  const remaining = computeLeaveAvailableDays(
    entitled,
    used,
    pending,
    advanced,
  );
  const asOf =
    row.updated_at != null
      ? new Date(row.updated_at).toISOString()
      : new Date().toISOString();
  return {
    company_id: row.company_id,
    employee_id: row.employee_id,
    leave_type: row.leave_type,
    leave_type_label: leaveTypeLabelVi(row.leave_type),
    balance_year: row.balance_year,
    year: row.balance_year,
    period: row.balance_year,
    entitled_days: entitled,
    used_days: used,
    pending_days: pending,
    advanced_days: advanced,
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
        advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
    await this.db.query(`
      ALTER TABLE public.employee_leave_balances
        ADD COLUMN IF NOT EXISTS advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0;
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

  /** HR / quản lý — cấp quỹ tracked (≠ seed script · U65 product mutate). */
  private assertHrGrantEntitlement(authorization?: string): void {
    if (!canFullEmployeeUpdate(authorization)) {
      throw new ApiException(
        'HRM-LEAVE-BAL-403',
        'Tracked leave entitlement may only be granted by HR or manager roles',
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
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
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

  private resolveOneType(
    employee: EmployeeScopeRow,
    leaveType: string,
    balanceYear: number,
    rowByType: Map<string, LeaveBalanceRow>,
  ): LeaveBalancePayload {
    const row = rowByType.get(leaveType.trim().toLowerCase());
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
          advanced_days: row.advanced_days,
          updated_at: row.updated_at,
        },
        'employee_leave_balances',
      );
    }
    const fallback = this.readCustomFieldsFallback(
      employee,
      leaveType,
      balanceYear,
    );
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
    const balanceCompanyKeys = expandLeaveBalanceCompanyKeys(
      employee.company_id,
    );

    const res = await this.db.query<LeaveBalanceRow>(
      `
        SELECT id, company_id, employee_id, leave_type, balance_year,
               entitled_days::text, used_days::text, pending_days::text,
               advanced_days::text, updated_at
        FROM public.employee_leave_balances
        WHERE company_id = ANY($1::text[])
          AND employee_id = $2::uuid
          AND lower(leave_type) = lower($3)
          AND balance_year = $4;
      `,
      [balanceCompanyKeys, employee.id, leaveType, balanceYear],
    );

    const row = pickPreferredBalanceRow(
      res.rows,
      employee.company_id,
      leaveType,
    );
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
          advanced_days: row.advanced_days,
          updated_at: row.updated_at,
        },
        'employee_leave_balances',
      );
    }

    const fallback = this.readCustomFieldsFallback(
      employee,
      leaveType,
      balanceYear,
    );
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

  /**
   * UC-BP-ATT-05b — panel quỹ theo 5 loại MVP trong một GET (không N-roundtrip).
   * Empty từng loại = source default + 0 — hợp lệ, không 404.
   */
  async getLeaveBalancePanel(
    query: GetLeaveBalancePanelQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<LeaveBalancePanelPayload> {
    await this.ensureSchema();
    this.assertSelfOrHrAccess(query.employee_id, authorization);
    const employee = await this.loadEmployeeInScope(
      query.employee_id,
      query.company_id,
      authorization,
      tenantId,
    );

    const balanceYear = query.year ?? calendarYearInHoChiMinh();
    const types = [...MVP_LEAVE_BALANCE_TYPES];
    const balanceCompanyKeys = expandLeaveBalanceCompanyKeys(
      employee.company_id,
    );

    const res = await this.db.query<LeaveBalanceRow>(
      `
        SELECT id, company_id, employee_id, leave_type, balance_year,
               entitled_days::text, used_days::text, pending_days::text,
               advanced_days::text, updated_at
        FROM public.employee_leave_balances
        WHERE company_id = ANY($1::text[])
          AND employee_id = $2::uuid
          AND balance_year = $3
          AND lower(leave_type) = ANY($4::text[]);
      `,
      [balanceCompanyKeys, employee.id, balanceYear, types],
    );

    const rowByType = new Map<string, LeaveBalanceRow>();
    for (const leaveType of types) {
      const picked = pickPreferredBalanceRow(
        res.rows,
        employee.company_id,
        leaveType,
      );
      if (picked) {
        rowByType.set(leaveType, picked);
      }
    }

    const items = types.map((leaveType) =>
      this.resolveOneType(employee, leaveType, balanceYear, rowByType),
    );
    const asOf =
      items.find((i) => i.source === 'employee_leave_balances')?.as_of ??
      new Date().toISOString();

    return {
      company_id: employee.company_id,
      employee_id: employee.id,
      balance_year: balanceYear,
      year: balanceYear,
      as_of: asOf,
      items,
    };
  }

  /**
   * F-ATT-LEAVE-BAL-UPSERT-01 — cấp/cập nhật entitled trên employee_leave_balances (tracked hold path).
   * U65: HR tạo row qua API (menu cấp phép) — không dùng pnpm seed:*.
   */
  async upsertTrackedEntitlement(
    body: UpsertTrackedLeaveBalanceDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<LeaveBalancePayload> {
    await this.ensureSchema();
    this.assertHrGrantEntitlement(authorization);
    const employee = await this.loadEmployeeInScope(
      body.employee_id,
      body.company_id,
      authorization,
      tenantId,
    );

    const leaveType = body.leave_type?.trim() || 'annual';
    const balanceYear = body.balance_year ?? calendarYearInHoChiMinh();
    const entitled = body.entitled_days;

    const existing = await this.db.query<LeaveBalanceRow>(
      `
        SELECT id, company_id, employee_id, leave_type, balance_year,
               entitled_days::text, used_days::text, pending_days::text,
               advanced_days::text, updated_at
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4
        LIMIT 1;
      `,
      [employee.company_id, employee.id, leaveType, balanceYear],
    );

    const used = existing.rows[0] ? toDayNumber(existing.rows[0].used_days) : 0;
    const pending = existing.rows[0]
      ? toDayNumber(existing.rows[0].pending_days)
      : 0;
    const advanced = existing.rows[0]
      ? toDayNumber(existing.rows[0].advanced_days)
      : 0;
    if (entitled < used + pending + advanced) {
      throw new ApiException(
        'HRM-LEAVE-BAL-409',
        'entitled_days cannot be less than used_days + pending_days + advanced_days',
        HttpStatus.CONFLICT,
        {
          entitled_days: entitled,
          used_days: used,
          pending_days: pending,
          advanced_days: advanced,
        },
      );
    }

    const res = await this.db.query<LeaveBalanceRow>(
      `
        INSERT INTO public.employee_leave_balances (
          company_id, employee_id, leave_type, balance_year,
          entitled_days, used_days, pending_days, updated_at
        ) VALUES (
          $1, $2::uuid, $3, $4,
          $5::numeric, $6::numeric, $7::numeric, NOW()
        )
        ON CONFLICT (company_id, employee_id, leave_type, balance_year)
        DO UPDATE SET
          entitled_days = EXCLUDED.entitled_days,
          updated_at = NOW()
        RETURNING id, company_id, employee_id, leave_type, balance_year,
                  entitled_days::text, used_days::text, pending_days::text,
                  advanced_days::text, updated_at;
      `,
      [
        employee.company_id,
        employee.id,
        leaveType,
        balanceYear,
        entitled,
        used,
        pending,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-LEAVE-BAL-500',
        'Failed to upsert tracked leave balance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
}
