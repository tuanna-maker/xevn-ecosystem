/**
 * @CODE-MEMORY
 * Screen:     HRM → AMIS Step4 input packs `/api/hrm/payroll/periods/:id/timesheet-binds|input-lines`
 * UC:         FR-UC-BP-PAY-01 · FR-UC-BP-PAY-06 · AC-PAY-SRC-03 · AC-AMIS-ATT-XFER-01
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md
 * TechSpec:   docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01.md
 * Purpose:    ensureSchema bind+input · CRUD chuyển công/thu nhập khác · advance bridge · scope_parity U19
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01
 * must_keep:  ATT-LINE-01 · formula F.1 · TPL F.1 · payroll_e2e_ready=false · alias bind ≠ att_timesheet_line
 * SOLID:      Tách bind/input/advance bridge khỏi payroll.service monolith
 * LastVerified: pay-period-input-pack.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02
 * change_mode: FIX
 * What: bindSelectSql — cấm s.code (attendance_sheets không có cột code); label từ name + status
 * Why: R-PAY-INP-BIND-SHEET-CODE-COL — LIST/GET binds 500 sau INSERT
 * must_keep: timesheetDisplayLabel từ name · timesheetStatus=closed · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
 * change_mode: ADD
 * What: S-PAY-CNS-02 assertComponentCodeInEffectiveCatalog → HRM-SC-COMP-KEY (VAL-PAY-CNS-04/05)
 * must_keep: soft allow when Nest active=0 · admin open N+1 · payroll_e2e_ready=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01
 * change_mode: FIX (RETAIN cite)
 * What: assertClosedSheetForBind → HRM-PAY-ATT-412 — closed + overlap window (F-PAY-PERIOD-BIND-03)
 * SRS:  FR-UC-BP-PAY-01 · ATT11QC1 peer · API-01 §4.3
 * must_keep: payroll_e2e_ready=false · C-SLICE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-02-CLUSTER-BE-01
 * change_mode: FIX (RETAIN cite)
 * What: R-PAY-02-COMP-01 jest — createInputLine assertComponentCodeInEffectiveCatalog (S-PAY-CNS-02)
 * SRS:  AC-PAY-COMP-01 · FR-UC-BP-PAY-02 #0b–0c
 * must_keep: soft allow catalog=0 · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-PAY-CNTT-BE-01
 * change_mode: ADD
 * What: createInputLine/patchInputLine — assert source_kind ∈ snapshot setupContext → HRM-PAY-INP-PROFILE-422
 * must_keep: ATT bind orthogonal · payroll_e2e_ready=false · formula HOLD
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import {
  assertResourceInHrmScope,
  expandPayrollAttendanceSheetCompanyIds,
  expandPayrollPeriodCompanyIds,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { ensureAttendanceSheetSchema } from '../attendance/attendance-sheet-schema.bootstrap';
import { HrmDbQueryFn, HrmDbService } from '../db/hrm-db.service';
import {
  DEFAULT_ADVANCE_COMPONENT_CODE,
  DEFAULT_TRANSFER_KIND,
  HRM_PAY_ADV_409_BRIDGE,
  HRM_PAY_ADV_409_PERIOD,
  HRM_PAY_ATT_412,
  HRM_PAY_INP_404,
  HRM_PAY_INP_409_DUP,
  HRM_PAY_PERIOD_409_IMMUTABLE,
  PAY_PERIOD_MUTABLE_STATUSES,
} from './pay-period-input-pack.constants';
import type { CreatePeriodInputLineDto } from './dto/pay-period-input-line.dto';
import type { CreateTimesheetBindDto } from './dto/pay-period-timesheet-bind.dto';
import type { UpdatePeriodInputLineDto } from './dto/pay-period-input-line.dto';
import { ensurePeriodInputSchema } from './pay-src-resolver';
import { assertComponentCodeInEffectiveCatalog } from './salary-component-consumer-assert';
import {
  assertSourceKindAllowedByProfile,
  parseSetupContextFromSnapshot,
} from './pay-cntt-setup.helpers';

type PayrollPeriodRow = {
  id: string;
  company_id: string;
  start_date: string;
  end_date: string;
  status: string;
  sheet_template_snapshot_json?: unknown;
};

type TimesheetBindRow = {
  id: string;
  company_id: string;
  payroll_period_id: string;
  timesheet_header_id: string;
  transfer_kind: string;
  bound_at: string;
  bound_by: string | null;
  note: string | null;
  archived_at: string | null;
  timesheet_code: string | null;
  timesheet_name: string | null;
  timesheet_status: string | null;
  sheet_date_from: string | null;
  sheet_date_to: string | null;
};

type InputLineRow = {
  id: string;
  company_id: string;
  period_id: string;
  employee_id: string;
  component_code: string;
  amount: string;
  quantity: string | null;
  source_kind: string;
  source_ref: string | null;
  effective_date: string | null;
  note: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  employee_display_name: string | null;
  component_display_label: string | null;
};

/** Public for jest + pay-src-resolver bootstrap. */
export async function ensurePayPeriodTimesheetBindSchema(db: HrmDbService): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_period_timesheet_bind (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      payroll_period_id UUID NOT NULL,
      timesheet_header_id UUID NOT NULL,
      transfer_kind TEXT NOT NULL DEFAULT 'closed_transfer',
      bound_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      bound_by TEXT NULL,
      note TEXT NULL,
      archived_at TIMESTAMPTZ NULL
    );
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_period_timesheet_bind_active
    ON public.pay_period_timesheet_bind (payroll_period_id, timesheet_header_id)
    WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_period_timesheet_bind_company_period
    ON public.pay_period_timesheet_bind (company_id, payroll_period_id);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_period_timesheet_bind_header
    ON public.pay_period_timesheet_bind (timesheet_header_id);
  `);
}

export async function ensurePayPeriodInputPackSchema(db: HrmDbService): Promise<void> {
  await ensurePayPeriodTimesheetBindSchema(db);
  await ensurePeriodInputSchema(db);
}

@Injectable()
export class PayPeriodInputPackService {
  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    await ensurePayPeriodInputPackSchema(this.db);
  }

  private resolveActorSub(authorization?: string): string | null {
    try {
      const payload = getVerifiedInternalJwtPayload(authorization);
      const sub = payload?.sub;
      return typeof sub === 'string' ? sub : null;
    } catch {
      return null;
    }
  }

  private assertPeriodMutable(period: Pick<PayrollPeriodRow, 'status'>): void {
    if (!PAY_PERIOD_MUTABLE_STATUSES.includes(period.status as (typeof PAY_PERIOD_MUTABLE_STATUSES)[number])) {
      throw new ApiException(
        HRM_PAY_PERIOD_409_IMMUTABLE,
        'Payroll period is immutable — cannot mutate bind or input lines',
        HttpStatus.CONFLICT,
      );
    }
  }

  private async loadPeriodInScope(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PayrollPeriodRow> {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [periodId];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query<PayrollPeriodRow>(
      `
        SELECT id::text AS id, company_id, start_date::text AS start_date,
               end_date::text AS end_date, status,
               sheet_template_snapshot_json
        FROM public.payroll_periods
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  private bindSelectSql(): string {
    // R-PAY-INP-BIND-SHEET-CODE-COL: attendance_sheets DDL has name/status/dates — no `code` column.
    return `
      b.id::text AS id,
      b.company_id,
      b.payroll_period_id::text AS payroll_period_id,
      b.timesheet_header_id::text AS timesheet_header_id,
      b.transfer_kind,
      b.bound_at::text AS bound_at,
      b.bound_by,
      b.note,
      b.archived_at::text AS archived_at,
      NULL::text AS timesheet_code,
      s.name AS timesheet_name,
      s.status AS timesheet_status,
      s.start_date::text AS sheet_date_from,
      s.end_date::text AS sheet_date_to
    `;
  }

  private mapBind(row: TimesheetBindRow) {
    const labelParts = [row.timesheet_name].filter(Boolean);
    return {
      id: row.id,
      companyId: row.company_id,
      payrollPeriodId: row.payroll_period_id,
      timesheetHeaderId: row.timesheet_header_id,
      timesheetDisplayLabel: labelParts.length > 0 ? labelParts.join(' — ') : row.timesheet_header_id,
      timesheetStatus: row.timesheet_status,
      transferKind: row.transfer_kind,
      boundAt: row.bound_at,
      boundBy: row.bound_by,
      note: row.note,
      archivedAt: row.archived_at,
      sheetDateFrom: row.sheet_date_from,
      sheetDateTo: row.sheet_date_to,
    };
  }

  private mapInputLine(row: InputLineRow) {
    return {
      id: row.id,
      companyId: row.company_id,
      periodId: row.period_id,
      employeeId: row.employee_id,
      employeeDisplayName: row.employee_display_name ?? row.employee_id,
      componentCode: row.component_code,
      componentDisplayLabel: row.component_display_label ?? row.component_code,
      amount: Number(row.amount),
      quantity: row.quantity != null ? Number(row.quantity) : null,
      sourceKind: row.source_kind,
      sourceRef: row.source_ref,
      effectiveDate: row.effective_date,
      note: row.note,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async loadBindInScope(
    periodId: string,
    bindId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<TimesheetBindRow> {
    const period = await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    const res = await this.db.query<TimesheetBindRow>(
      `
        SELECT ${this.bindSelectSql()}
        FROM public.pay_period_timesheet_bind b
        INNER JOIN public.attendance_sheets s ON s.id = b.timesheet_header_id
        WHERE b.id = $1::uuid
          AND b.payroll_period_id = $2::uuid
          AND b.company_id = ANY($3::text[])
        LIMIT 1;
      `,
      [bindId, periodId, companyIds],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_PAY_INP_404, 'Timesheet bind not found', HttpStatus.NOT_FOUND);
    }
    if (row.company_id !== period.company_id && !companyIds.includes(row.company_id)) {
      throw new ApiException('HRM-SCOPE-409', 'Timesheet bind company scope mismatch', HttpStatus.CONFLICT);
    }
    return row;
  }

  private async assertClosedSheetForBind(
    timesheetHeaderId: string,
    period: PayrollPeriodRow,
  ): Promise<{ company_id: string; status: string; start_date: string; end_date: string }> {
    await ensureAttendanceSheetSchema(this.db);
    const companyIds = expandPayrollAttendanceSheetCompanyIds(period.company_id);
    const sheetRes = await this.db.query<{
      company_id: string;
      status: string;
      start_date: string;
      end_date: string;
    }>(
      `
        SELECT company_id, status, start_date::text AS start_date, end_date::text AS end_date
        FROM public.attendance_sheets
        WHERE id = $1::uuid AND company_id = ANY($2::text[])
        LIMIT 1;
      `,
      [timesheetHeaderId, companyIds],
    );
    const sheet = sheetRes.rows[0];
    if (!sheet) {
      throw new ApiException(HRM_PAY_INP_404, 'Attendance sheet not found in scope', HttpStatus.NOT_FOUND);
    }
    if (sheet.status !== 'closed') {
      throw new ApiException(
        HRM_PAY_ATT_412,
        'Attendance sheet must be closed before bind to payroll period',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const periodStart = new Date(period.start_date);
    const periodEnd = new Date(period.end_date);
    const sheetStart = new Date(sheet.start_date);
    const sheetEnd = new Date(sheet.end_date);
    const overlaps = sheetStart <= periodEnd && sheetEnd >= periodStart;
    if (!overlaps) {
      throw new ApiException(
        HRM_PAY_ATT_412,
        'Attendance sheet date range must overlap payroll period window',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    return sheet;
  }

  async listTimesheetBinds(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
    opts?: { includeArchived?: boolean; transferKind?: string },
  ) {
    await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    const filters = ['b.payroll_period_id = $1::uuid', 'b.company_id = ANY($2::text[])'];
    const values: unknown[] = [periodId, companyIds];
    if (!opts?.includeArchived) {
      filters.push('b.archived_at IS NULL');
    }
    if (opts?.transferKind) {
      values.push(opts.transferKind);
      filters.push(`b.transfer_kind = $${values.length}`);
    }
    const res = await this.db.query<TimesheetBindRow>(
      `
        SELECT ${this.bindSelectSql()}
        FROM public.pay_period_timesheet_bind b
        INNER JOIN public.attendance_sheets s ON s.id = b.timesheet_header_id
        WHERE ${filters.join(' AND ')}
        ORDER BY b.bound_at DESC;
      `,
      values,
    );
    return { items: res.rows.map((r) => this.mapBind(r)) };
  }

  async getTimesheetBindById(
    periodId: string,
    bindId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const row = await this.loadBindInScope(periodId, bindId, requestedCompanyId, authorization);
    return this.mapBind(row);
  }

  async createTimesheetBind(
    periodId: string,
    payload: CreateTimesheetBindDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const period = await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    this.assertPeriodMutable(period);
    await this.assertClosedSheetForBind(payload.timesheetHeaderId, period);
    const actor = this.resolveActorSub(authorization);
    const id = randomUUID();
    try {
      const res = await this.db.query<TimesheetBindRow>(
        `
          INSERT INTO public.pay_period_timesheet_bind (
            id, company_id, payroll_period_id, timesheet_header_id,
            transfer_kind, bound_at, bound_by, note
          ) VALUES (
            $1::uuid, $2, $3::uuid, $4::uuid, $5, NOW(), $6, $7
          )
          RETURNING
            id::text AS id, company_id, payroll_period_id::text AS payroll_period_id,
            timesheet_header_id::text AS timesheet_header_id, transfer_kind,
            bound_at::text AS bound_at, bound_by, note, archived_at::text AS archived_at,
            NULL::text AS timesheet_code, NULL::text AS timesheet_name,
            NULL::text AS timesheet_status, NULL::text AS sheet_date_from, NULL::text AS sheet_date_to;
        `,
        [
          id,
          period.company_id,
          periodId,
          payload.timesheetHeaderId,
          payload.transferKind?.trim() || DEFAULT_TRANSFER_KIND,
          actor,
          payload.note?.trim() ?? null,
        ],
      );
      return this.getTimesheetBindById(periodId, res.rows[0].id, requestedCompanyId, authorization);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_period_timesheet_bind_active|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_INP_409_DUP,
          'Active timesheet bind already exists for this period and sheet',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async archiveTimesheetBind(
    periodId: string,
    bindId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const period = await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    this.assertPeriodMutable(period);
    await this.loadBindInScope(periodId, bindId, requestedCompanyId, authorization);
    await this.db.query(
      `
        UPDATE public.pay_period_timesheet_bind
        SET archived_at = COALESCE(archived_at, NOW())
        WHERE id = $1::uuid AND payroll_period_id = $2::uuid;
      `,
      [bindId, periodId],
    );
    return this.getTimesheetBindById(periodId, bindId, requestedCompanyId, authorization);
  }

  private inputLineSelectSql(): string {
    return `
      l.id::text AS id,
      l.company_id,
      l.period_id::text AS period_id,
      l.employee_id::text AS employee_id,
      l.component_code,
      l.amount::text AS amount,
      l.quantity::text AS quantity,
      l.source_kind,
      l.source_ref,
      l.effective_date::text AS effective_date,
      l.note,
      l.archived_at::text AS archived_at,
      l.created_at::text AS created_at,
      l.updated_at::text AS updated_at,
      e.full_name AS employee_display_name,
      sc.name AS component_display_label
    `;
  }

  private async assertSalaryComponent(
    companyId: string,
    componentCode: string,
    authorization?: string,
  ): Promise<void> {
    await assertComponentCodeInEffectiveCatalog({
      query: this.db.query.bind(this.db) as HrmDbQueryFn,
      companyId,
      componentCode,
      authorization,
    });
  }

  private async loadInputLineInScope(
    periodId: string,
    lineId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<InputLineRow> {
    await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    const res = await this.db.query<InputLineRow>(
      `
        SELECT ${this.inputLineSelectSql()}
        FROM public.pay_period_input_lines l
        LEFT JOIN public.employees e ON e.id = l.employee_id
        LEFT JOIN public.salary_components sc
          ON sc.company_id = l.company_id AND lower(sc.code) = lower(l.component_code)
        WHERE l.id = $1::uuid
          AND l.period_id = $2::uuid
          AND l.company_id = ANY($3::text[])
        LIMIT 1;
      `,
      [lineId, periodId, companyIds],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_PAY_INP_404, 'Period input line not found', HttpStatus.NOT_FOUND);
    }
    return row;
  }

  async listInputLines(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
    opts?: {
      employeeId?: string;
      componentCode?: string;
      sourceKind?: string;
      includeArchived?: boolean;
      limit?: number;
    },
  ) {
    await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    const filters = ['l.period_id = $1::uuid', 'l.company_id = ANY($2::text[])'];
    const values: unknown[] = [periodId, companyIds];
    if (!opts?.includeArchived) {
      filters.push('l.archived_at IS NULL');
    }
    if (opts?.employeeId) {
      values.push(opts.employeeId);
      filters.push(`l.employee_id = $${values.length}::uuid`);
    }
    if (opts?.componentCode) {
      values.push(opts.componentCode);
      filters.push(`lower(l.component_code) = lower($${values.length}::text)`);
    }
    if (opts?.sourceKind) {
      values.push(opts.sourceKind);
      filters.push(`l.source_kind = $${values.length}`);
    }
    const limit = Math.min(opts?.limit ?? 200, 500);
    values.push(limit);
    const res = await this.db.query<InputLineRow>(
      `
        SELECT ${this.inputLineSelectSql()}
        FROM public.pay_period_input_lines l
        LEFT JOIN public.employees e ON e.id = l.employee_id
        LEFT JOIN public.salary_components sc
          ON sc.company_id = l.company_id AND lower(sc.code) = lower(l.component_code)
        WHERE ${filters.join(' AND ')}
        ORDER BY l.updated_at DESC
        LIMIT $${values.length};
      `,
      values,
    );
    return { items: res.rows.map((r) => this.mapInputLine(r)) };
  }

  async getInputLineById(
    periodId: string,
    lineId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const row = await this.loadInputLineInScope(periodId, lineId, requestedCompanyId, authorization);
    return this.mapInputLine(row);
  }

  async createInputLine(
    periodId: string,
    payload: CreatePeriodInputLineDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const period = await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    this.assertPeriodMutable(period);
    if (!Number.isFinite(payload.amount)) {
      throw new ApiException('HRM-VAL-400', 'amount must be a finite number', HttpStatus.BAD_REQUEST);
    }
    const componentCode = payload.componentCode.trim();
    await this.assertSalaryComponent(period.company_id, componentCode, authorization);
    const actor = this.resolveActorSub(authorization);
    const sourceKind = payload.sourceKind?.trim() || 'manual';
    const setupContext = parseSetupContextFromSnapshot(period.sheet_template_snapshot_json);
    assertSourceKindAllowedByProfile(sourceKind, setupContext);
    const id = randomUUID();
    try {
      const res = await this.db.query<{ id: string }>(
        `
          INSERT INTO public.pay_period_input_lines (
            id, company_id, period_id, employee_id, component_code,
            amount, quantity, source_kind, source_ref, effective_date, note,
            created_by, updated_by
          ) VALUES (
            $1::uuid, $2, $3::uuid, $4::uuid, $5,
            $6, $7, $8, $9, $10::date, $11, $12, $12
          )
          RETURNING id::text AS id;
        `,
        [
          id,
          period.company_id,
          periodId,
          payload.employeeId,
          componentCode,
          payload.amount,
          payload.quantity ?? null,
          sourceKind,
          payload.sourceRef?.trim() ?? null,
          payload.effectiveDate ?? null,
          payload.note?.trim() ?? null,
          actor,
        ],
      );
      return this.getInputLineById(periodId, res.rows[0].id, requestedCompanyId, authorization);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_period_input_active|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_INP_409_DUP,
          'Active input line already exists for period, employee, component and source_kind',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchInputLine(
    periodId: string,
    lineId: string,
    payload: UpdatePeriodInputLineDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const period = await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    this.assertPeriodMutable(period);
    await this.loadInputLineInScope(periodId, lineId, requestedCompanyId, authorization);
    const actor = this.resolveActorSub(authorization);
    const sets: string[] = ['updated_at = NOW()', 'updated_by = $3'];
    const values: unknown[] = [lineId, periodId, actor];
    if (payload.amount != null) {
      if (!Number.isFinite(payload.amount)) {
        throw new ApiException('HRM-VAL-400', 'amount must be finite', HttpStatus.BAD_REQUEST);
      }
      values.push(payload.amount);
      sets.push(`amount = $${values.length}`);
    }
    if (payload.quantity != null) {
      values.push(payload.quantity);
      sets.push(`quantity = $${values.length}`);
    }
    if (payload.note !== undefined) {
      values.push(payload.note?.trim() ?? null);
      sets.push(`note = $${values.length}`);
    }
    if (payload.effectiveDate !== undefined) {
      values.push(payload.effectiveDate);
      sets.push(`effective_date = $${values.length}::date`);
    }
    if (payload.sourceKind !== undefined) {
      const sourceKind = payload.sourceKind.trim() || 'manual';
      const setupContext = parseSetupContextFromSnapshot(period.sheet_template_snapshot_json);
      assertSourceKindAllowedByProfile(sourceKind, setupContext);
      values.push(sourceKind);
      sets.push(`source_kind = $${values.length}`);
    }
    await this.db.query(
      `
        UPDATE public.pay_period_input_lines
        SET ${sets.join(', ')}
        WHERE id = $1::uuid AND period_id = $2::uuid AND archived_at IS NULL;
      `,
      values,
    );
    return this.getInputLineById(periodId, lineId, requestedCompanyId, authorization);
  }

  async archiveInputLine(
    periodId: string,
    lineId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const period = await this.loadPeriodInScope(periodId, requestedCompanyId, authorization);
    this.assertPeriodMutable(period);
    await this.loadInputLineInScope(periodId, lineId, requestedCompanyId, authorization);
    await this.db.query(
      `
        UPDATE public.pay_period_input_lines
        SET archived_at = COALESCE(archived_at, NOW()), updated_at = NOW()
        WHERE id = $1::uuid AND period_id = $2::uuid;
      `,
      [lineId, periodId],
    );
    return this.getInputLineById(periodId, lineId, requestedCompanyId, authorization);
  }

  /** BR-PAY-ADV-BRIDGE-01..02 — upsert advance lines into input pack. */
  async bridgeAdvanceRequestToPeriod(input: {
    requestId: string;
    payrollPeriodId: string;
    componentCode?: string;
    requestedCompanyId: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<{ bridgedInputLineIds: string[]; failedEmployees: string[] }> {
    await this.ensureSchema();
    const scope = resolveHrmListScope(input.authorization, input.requestedCompanyId, {
      tenantId: input.tenantId,
    });
    const reqRes = await this.db.query<{ id: string; company_id: string; status: string }>(
      `SELECT id::text AS id, company_id, status FROM public.advance_requests WHERE id = $1::uuid LIMIT 1;`,
      [input.requestId],
    );
    const request = reqRes.rows[0];
    assertResourceInHrmScope(request, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    if (!request) {
      throw new ApiException('HRM-ADV-404', 'Advance request not found', HttpStatus.NOT_FOUND);
    }

    let period: PayrollPeriodRow;
    try {
      period = await this.loadPeriodInScope(
        input.payrollPeriodId,
        input.requestedCompanyId,
        input.authorization,
      );
    } catch {
      throw new ApiException(
        HRM_PAY_ADV_409_PERIOD,
        'Payroll period not found or out of scope for advance bridge',
        HttpStatus.CONFLICT,
      );
    }
    this.assertPeriodMutable(period);

    const componentCode = input.componentCode?.trim() || DEFAULT_ADVANCE_COMPONENT_CODE;
    await this.assertSalaryComponent(period.company_id, componentCode, input.authorization);
    const actor = this.resolveActorSub(input.authorization);

    const empRes = await this.db.query<{
      id: string;
      employee_id: string | null;
      employee_code: string;
      advance_amount: string;
    }>(
      `
        SELECT id::text AS id, employee_id::text AS employee_id, employee_code, advance_amount::text AS advance_amount
        FROM public.advance_request_employees
        WHERE request_id = $1::uuid;
      `,
      [input.requestId],
    );

    const bridgedInputLineIds: string[] = [];
    const failedEmployees: string[] = [];

    for (const emp of empRes.rows) {
      let employeeId = emp.employee_id;
      if (!employeeId) {
        const lookup = await this.db.query<{ id: string }>(
          `
            SELECT id::text AS id FROM public.employees
            WHERE company_id = ANY($1::text[]) AND employee_code = $2
            LIMIT 1;
          `,
          [expandPayrollPeriodCompanyIds(scope), emp.employee_code],
        );
        employeeId = lookup.rows[0]?.id ?? null;
      }
      if (!employeeId) {
        failedEmployees.push(emp.employee_code);
        continue;
      }
      const sourceRef = `advance_request_employee:${emp.id}`;
      const amount = Number(emp.advance_amount);
      if (!Number.isFinite(amount)) {
        failedEmployees.push(emp.employee_code);
        continue;
      }

      const existing = await this.db.query<{ id: string }>(
        `
          SELECT id::text AS id FROM public.pay_period_input_lines
          WHERE period_id = $1::uuid AND employee_id = $2::uuid
            AND lower(component_code) = lower($3::text)
            AND source_kind = 'advance' AND archived_at IS NULL
          LIMIT 1;
        `,
        [input.payrollPeriodId, employeeId, componentCode],
      );

      try {
        if (existing.rows[0]) {
          await this.db.query(
            `
              UPDATE public.pay_period_input_lines
              SET amount = $2, source_ref = $3, updated_at = NOW(), updated_by = $4
              WHERE id = $1::uuid;
            `,
            [existing.rows[0].id, amount, sourceRef, actor],
          );
          bridgedInputLineIds.push(existing.rows[0].id);
        } else {
          const lineId = randomUUID();
          await this.db.query(
            `
              INSERT INTO public.pay_period_input_lines (
                id, company_id, period_id, employee_id, component_code,
                amount, source_kind, source_ref, created_by, updated_by
              ) VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, 'advance', $7, $8, $8);
            `,
            [lineId, period.company_id, input.payrollPeriodId, employeeId, componentCode, amount, sourceRef, actor],
          );
          bridgedInputLineIds.push(lineId);
        }
      } catch {
        failedEmployees.push(emp.employee_code);
      }
    }

    if (failedEmployees.length > 0 && bridgedInputLineIds.length === 0) {
      throw new ApiException(
        HRM_PAY_ADV_409_BRIDGE,
        'Advance bridge failed for all employees',
        HttpStatus.CONFLICT,
        { failedEmployees },
      );
    }

    return { bridgedInputLineIds, failedEmployees };
  }

  /** BR-PAY-ADV-BRIDGE-03 — archive bridged lines on reject/cancel. */
  async archiveAdvanceBridgedLines(requestId: string): Promise<number> {
    await this.ensureSchema();
    const empRes = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.advance_request_employees WHERE request_id = $1::uuid;`,
      [requestId],
    );
    if (empRes.rows.length === 0) return 0;
    const refs = empRes.rows.map((e) => `advance_request_employee:${e.id}`);
    const res = await this.db.query(
      `
        UPDATE public.pay_period_input_lines
        SET archived_at = COALESCE(archived_at, NOW()), updated_at = NOW()
        WHERE source_ref = ANY($1::text[]) AND archived_at IS NULL;
      `,
      [refs],
    );
    return res.rowCount ?? 0;
  }
}
