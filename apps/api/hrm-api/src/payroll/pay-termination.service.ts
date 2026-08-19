/**
 * @CODE-MEMORY
 * Screen:     HRM PAY — tất toán nghỉ việc (F-PAY-TERM-SETTLE-01)
 * UC:         UC-BP-PAY-07 · FR-UC-BP-PAY-07
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md §4.1–4.3
 * Purpose:    Soft TERM resolve (O3) · checklist READ · settlement lifecycle · process step 0/12 bind.
 * WorkItem:   PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-01
 * must_keep:  PAY01..06 process order · payroll_e2e_ready=false · DENY PAY mutate CORE/ATT
 */
import { HttpStatus } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import type { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_TERM_404_NO_CASE,
  HRM_PAY_TERM_409,
  PAY_TERM_CHECKLIST_REASON,
  PAY_TERM_TERMINAL_STATUS_KEYS,
  type PayTermChecklistReasonCode,
  type PayTermSettlementStatus,
} from './pay-term.constants';
import { hasActiveTimesheetBindForPeriod } from './pay-period-bind-resolver';
import { ensureAttendanceSheetSchema } from '../attendance/attendance-sheet-schema.bootstrap';

export type PayTermChecklistSnapshot = {
  assetAck: boolean;
  siCutoff: boolean;
  leaveCashout: boolean;
  rdIncluded: boolean;
};

export type PayTermResolvedCase = {
  employeeId: string;
  terminationId: string;
  terminationDate: string;
  decisionId: string | null;
  midMonthSplitRequired: boolean;
};

export type PayTermSettlementRow = {
  id: string;
  company_id: string;
  termination_id: string;
  employee_id: string;
  payroll_period_id: string | null;
  final_payslip_id: string | null;
  timesheet_header_id: string | null;
  si_cutoff_done: boolean;
  leave_cashout_done: boolean;
  asset_checklist_ack: boolean;
  reward_discipline_included: boolean;
  status: PayTermSettlementStatus;
};

function parseIsoDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dateInInclusiveRange(iso: string, fromIso: string, toIso: string): boolean {
  const d = parseIsoDateOnly(iso).getTime();
  return d >= parseIsoDateOnly(fromIso).getTime() && d <= parseIsoDateOnly(toIso).getTime();
}

/** O3 — deterministic opaque termination_id per soft case. */
export function buildSoftTerminationCaseId(input: {
  companyId: string;
  employeeId: string;
  terminationDate: string;
  decisionId?: string | null;
}): string {
  const digest = createHash('sha256')
    .update(
      `${input.companyId}|${input.employeeId}|${input.terminationDate.slice(0, 10)}|${input.decisionId ?? ''}`,
      'utf8',
    )
    .digest();
  const bytes = Buffer.from(digest.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function isTerminalEmploymentStatus(status: string): boolean {
  const key = status.trim().toLowerCase();
  return PAY_TERM_TERMINAL_STATUS_KEYS.has(key);
}

function mandatoryReasonCodesFromChecklist(checklist: PayTermChecklistSnapshot): PayTermChecklistReasonCode[] {
  const codes: PayTermChecklistReasonCode[] = [];
  if (!checklist.assetAck) codes.push(PAY_TERM_CHECKLIST_REASON.ASSET_OPEN);
  if (!checklist.siCutoff) codes.push(PAY_TERM_CHECKLIST_REASON.SI_CUTOFF_OPEN);
  if (!checklist.leaveCashout) codes.push(PAY_TERM_CHECKLIST_REASON.LEAVE_CASHOUT_OPEN);
  if (!checklist.rdIncluded) codes.push(PAY_TERM_CHECKLIST_REASON.RD_PENDING);
  return codes;
}

export class PayTerminationService {
  constructor(private readonly db: HrmDbService) {}

  /** §4.2 — soft TERM (hrd_02 + resigned + termination_date in period). */
  async resolveTerminationCaseForPayroll(input: {
    companyId: string;
    employeeId: string;
    periodFrom: string;
    periodTo: string;
    terminationDateOverride?: string | null;
  }): Promise<PayTermResolvedCase | null> {
    const empRes = await this.db.query<{
      id: string;
      status: string;
      custom_fields: Record<string, unknown> | null;
    }>(
      `
        SELECT id, status, custom_fields
        FROM public.employees
        WHERE id = $1::uuid AND archived_at IS NULL
        LIMIT 1;
      `,
      [input.employeeId],
    );
    const emp = empRes.rows[0];
    if (!emp) return null;

    const cf = (emp.custom_fields ?? {}) as Record<string, unknown>;
    const statusFromCf = String(cf.employment_status ?? cf.employmentStatus ?? '').trim();
    const statusKey = (statusFromCf || emp.status || '').trim().toLowerCase();
    if (!isTerminalEmploymentStatus(statusKey)) {
      return null;
    }

    const decisionRes = await this.db.query<{
      id: string;
      effective_date: string | null;
    }>(
      `
        SELECT id, effective_date::text AS effective_date
        FROM public.hr_decisions
        WHERE employee_id = $1::uuid
          AND company_id = $2
          AND lower(decision_type) IN ('hrd_02', 'termination')
          AND lower(COALESCE(status, '')) IN ('approved', 'published', 'active', 'effective')
        ORDER BY effective_date DESC NULLS LAST, created_at DESC
        LIMIT 1;
      `,
      [input.employeeId, input.companyId],
    );
    const decision = decisionRes.rows[0];
    const fromCustom = String(cf.termination_date ?? cf.terminationDate ?? '').trim().slice(0, 10);
    const fromDecision = decision?.effective_date?.slice(0, 10) ?? '';
    const override = input.terminationDateOverride?.slice(0, 10) ?? '';
    const terminationDate = override || fromCustom || fromDecision;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(terminationDate)) {
      return null;
    }
    if (!dateInInclusiveRange(terminationDate, input.periodFrom, input.periodTo)) {
      return null;
    }

    const terminationId = buildSoftTerminationCaseId({
      companyId: input.companyId,
      employeeId: input.employeeId,
      terminationDate,
      decisionId: decision?.id ?? null,
    });

    const midMonthSplitRequired = terminationDate < input.periodTo.slice(0, 10);

    return {
      employeeId: input.employeeId,
      terminationId,
      terminationDate,
      decisionId: decision?.id ?? null,
      midMonthSplitRequired,
    };
  }

  /** §4.3 — peer READ snapshot (CORE/ATT owners; PAY không mutate). */
  async readTerminationChecklistSnapshot(
    employeeId: string,
    companyId: string,
  ): Promise<PayTermChecklistSnapshot> {
    let assetAck = true;
    try {
      const assetRes = await this.db.query<{ cnt: string }>(
        `
          SELECT COUNT(*)::text AS cnt
          FROM public.employee_assets
          WHERE employee_id = $1::uuid
            AND company_id = $2
            AND lower(COALESCE(status, '')) = 'assigned';
        `,
        [employeeId, companyId],
      );
      assetAck = Number(assetRes.rows[0]?.cnt ?? 0) === 0;
    } catch {
      assetAck = false;
    }

    const empRes = await this.db.query<{ custom_fields: Record<string, unknown> | null }>(
      `SELECT custom_fields FROM public.employees WHERE id = $1::uuid LIMIT 1;`,
      [employeeId],
    );
    const cf = (empRes.rows[0]?.custom_fields ?? {}) as Record<string, unknown>;

    const siCutoff = Boolean(cf.pay_si_cutoff_done ?? cf.si_cutoff_done);
    const leaveCashout = Boolean(cf.pay_leave_cashout_done ?? cf.leave_cashout_done);
    const rdIncluded = Boolean(
      cf.pay_rd_included ?? cf.reward_discipline_included ?? cf.rd_included ?? false,
    );

    return {
      assetAck,
      siCutoff,
      leaveCashout,
      rdIncluded,
    };
  }

  async loadOpenSettlement(
    companyId: string,
    employeeId: string,
    payrollPeriodId: string,
  ): Promise<PayTermSettlementRow | null> {
    const res = await this.db.query<PayTermSettlementRow>(
      `
        SELECT
          id::text AS id,
          company_id,
          termination_id::text AS termination_id,
          employee_id::text AS employee_id,
          payroll_period_id::text AS payroll_period_id,
          final_payslip_id::text AS final_payslip_id,
          timesheet_header_id::text AS timesheet_header_id,
          si_cutoff_done,
          leave_cashout_done,
          asset_checklist_ack,
          reward_discipline_included,
          status
        FROM public.pay_termination_settlement
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND payroll_period_id = $3::uuid
          AND archived_at IS NULL
          AND status IN ('draft', 'ready', 'posted')
        ORDER BY updated_at DESC
        LIMIT 1;
      `,
      [companyId, employeeId, payrollPeriodId],
    );
    return res.rows[0] ?? null;
  }

  async loadSettlementById(
    settlementId: string,
    companyId: string,
  ): Promise<PayTermSettlementRow | null> {
    const res = await this.db.query<PayTermSettlementRow>(
      `
        SELECT
          id::text AS id,
          company_id,
          termination_id::text AS termination_id,
          employee_id::text AS employee_id,
          payroll_period_id::text AS payroll_period_id,
          final_payslip_id::text AS final_payslip_id,
          timesheet_header_id::text AS timesheet_header_id,
          si_cutoff_done,
          leave_cashout_done,
          asset_checklist_ack,
          reward_discipline_included,
          status
        FROM public.pay_termination_settlement
        WHERE id = $1::uuid AND company_id = $2 AND archived_at IS NULL
        LIMIT 1;
      `,
      [settlementId, companyId],
    );
    return res.rows[0] ?? null;
  }

  private async assertClosedSheetForPosted(
    period: { id: string; company_id: string; start_date: string },
    requireClosedTimesheet: boolean,
  ): Promise<string | null> {
    await ensureAttendanceSheetSchema(this.db);
    const bound = await hasActiveTimesheetBindForPeriod(this.db, period.id);
    if (bound) {
      return null;
    }
    if (!requireClosedTimesheet) {
      return null;
    }
    const companyIds = [period.company_id, period.company_id === 'main' ? 'holding' : period.company_id];
    const res = await this.db.query<{ sheet_id: string | null }>(
      `
        SELECT s.id::text AS sheet_id
        FROM public.attendance_sheets s
        WHERE s.company_id = ANY($1::text[])
          AND date_trunc('month', s.period_start::date) = date_trunc('month', $2::date)
          AND lower(COALESCE(s.status, '')) IN ('closed', 'locked')
        LIMIT 1;
      `,
      [companyIds, period.start_date],
    );
    return res.rows[0]?.sheet_id ?? null;
  }

  throwTerm409(reasonCodes: PayTermChecklistReasonCode[], employeeId?: string, settlementId?: string): never {
    throw new ApiException(
      HRM_PAY_TERM_409,
      'Checklist tất toán nghỉ chưa đủ điều kiện bắt buộc',
      HttpStatus.CONFLICT,
      {
        code: HRM_PAY_TERM_409,
        reason_codes: reasonCodes,
        employee_id: employeeId,
        settlement_id: settlementId,
        payroll_e2e_ready: false,
      },
    );
  }

  /** F-PAY-TERM-SETTLE-01 — upsert lifecycle draft→ready→posted. */
  async upsertTerminationSettlement(input: {
    companyId: string;
    periodId: string;
    periodFrom: string;
    periodTo: string;
    periodStartDate: string;
    employeeIds: string[];
    targetStatus: PayTermSettlementStatus;
    requireClosedTimesheet: boolean;
    terminationDateByEmployee?: Record<string, string>;
  }): Promise<{
    period_id: string;
    items: Array<{
      employee_id: string;
      termination_id: string;
      settlement_id: string;
      settlement_status: PayTermSettlementStatus;
      checklist: {
        asset_ack: boolean;
        si_cutoff: boolean;
        leave_cashout: boolean;
        rd_included: boolean;
      };
      reason_codes?: PayTermChecklistReasonCode[];
      termination_date?: string;
      mid_month_split_required?: boolean;
    }>;
  }> {
    const items: Array<{
      employee_id: string;
      termination_id: string;
      settlement_id: string;
      settlement_status: PayTermSettlementStatus;
      checklist: {
        asset_ack: boolean;
        si_cutoff: boolean;
        leave_cashout: boolean;
        rd_included: boolean;
      };
      reason_codes?: PayTermChecklistReasonCode[];
      termination_date?: string;
      mid_month_split_required?: boolean;
    }> = [];

    let closedSheetId: string | null = null;
    if (input.targetStatus === 'posted') {
      closedSheetId = await this.assertClosedSheetForPosted(
        { id: input.periodId, company_id: input.companyId, start_date: input.periodStartDate },
        input.requireClosedTimesheet,
      );
      if (input.requireClosedTimesheet && !closedSheetId) {
        throw new ApiException(
          'HRM-PAY-ATT-412',
          'Attendance sheet must be closed before posting termination settlement',
          HttpStatus.PRECONDITION_FAILED,
          { payroll_e2e_ready: false },
        );
      }
    }

    for (const employeeId of input.employeeIds) {
      const resolved = await this.resolveTerminationCaseForPayroll({
        companyId: input.companyId,
        employeeId,
        periodFrom: input.periodFrom,
        periodTo: input.periodTo,
        terminationDateOverride: input.terminationDateByEmployee?.[employeeId] ?? null,
      });
      if (!resolved) {
        throw new ApiException(
          HRM_PAY_TERM_404_NO_CASE,
          'Không tìm thấy hồ sơ nghỉ việc hợp lệ cho nhân viên trong kỳ lương',
          HttpStatus.NOT_FOUND,
          { employee_id: employeeId, payroll_e2e_ready: false },
        );
      }

      const checklist = await this.readTerminationChecklistSnapshot(employeeId, input.companyId);
      const reasonCodes = mandatoryReasonCodesFromChecklist(checklist);

      let targetStatus = input.targetStatus;
      if (targetStatus === 'ready' && reasonCodes.length > 0) {
        targetStatus = 'draft';
      }
      if (targetStatus === 'posted' && reasonCodes.length > 0) {
        this.throwTerm409(reasonCodes, employeeId);
      }

      const existing = await this.loadOpenSettlement(input.companyId, employeeId, input.periodId);
      if (existing?.status === 'posted' && targetStatus !== 'posted') {
        throw new ApiException(
          HRM_PAY_TERM_409,
          'Không được hạ trạng thái tất toán đã posted',
          HttpStatus.CONFLICT,
          { payroll_e2e_ready: false },
        );
      }

      const snapshotFlags = {
        si_cutoff_done: checklist.siCutoff,
        leave_cashout_done: checklist.leaveCashout,
        asset_checklist_ack: checklist.assetAck,
        reward_discipline_included: checklist.rdIncluded,
      };

      let settlementId: string;
      if (existing) {
        settlementId = existing.id;
        await this.db.query(
          `
            UPDATE public.pay_termination_settlement
            SET
              termination_id = $2::uuid,
              status = $3,
              si_cutoff_done = $4,
              leave_cashout_done = $5,
              asset_checklist_ack = $6,
              reward_discipline_included = $7,
              timesheet_header_id = COALESCE($8::uuid, timesheet_header_id),
              updated_at = NOW()
            WHERE id = $1::uuid;
          `,
          [
            settlementId,
            resolved.terminationId,
            targetStatus,
            snapshotFlags.si_cutoff_done,
            snapshotFlags.leave_cashout_done,
            snapshotFlags.asset_checklist_ack,
            snapshotFlags.reward_discipline_included,
            closedSheetId,
          ],
        );
      } else {
        const ins = await this.db.query<{ id: string }>(
          `
            INSERT INTO public.pay_termination_settlement (
              company_id, termination_id, employee_id, payroll_period_id,
              si_cutoff_done, leave_cashout_done, asset_checklist_ack, reward_discipline_included,
              status, timesheet_header_id
            ) VALUES ($1, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10::uuid)
            RETURNING id::text AS id;
          `,
          [
            input.companyId,
            resolved.terminationId,
            employeeId,
            input.periodId,
            snapshotFlags.si_cutoff_done,
            snapshotFlags.leave_cashout_done,
            snapshotFlags.asset_checklist_ack,
            snapshotFlags.reward_discipline_included,
            targetStatus,
            closedSheetId,
          ],
        );
        settlementId = ins.rows[0].id;
      }

      items.push({
        employee_id: employeeId,
        termination_id: resolved.terminationId,
        settlement_id: settlementId,
        settlement_status: targetStatus,
        checklist: {
          asset_ack: checklist.assetAck,
          si_cutoff: checklist.siCutoff,
          leave_cashout: checklist.leaveCashout,
          rd_included: checklist.rdIncluded,
        },
        ...(reasonCodes.length > 0 ? { reason_codes: reasonCodes } : {}),
        termination_date: resolved.terminationDate,
        mid_month_split_required: resolved.midMonthSplitRequired,
      });
    }

    return { period_id: input.periodId, items };
  }

  /** Process step (0) — terminating employees must have posted settlement. */
  async assertTerminationSettlementsPostedForProcess(
    companyId: string,
    period: { id: string; start_date: string; end_date: string },
    employeeIds: string[],
  ): Promise<void> {
    for (const employeeId of employeeIds) {
      const resolved = await this.resolveTerminationCaseForPayroll({
        companyId,
        employeeId,
        periodFrom: period.start_date,
        periodTo: period.end_date,
      });
      const row = await this.loadOpenSettlement(companyId, employeeId, period.id);
      if (!resolved && !row) continue;
      if (!row || row.status !== 'posted') {
        const checklist = await this.readTerminationChecklistSnapshot(employeeId, companyId);
        const reasonCodes = mandatoryReasonCodesFromChecklist(checklist);
        this.throwTerm409(
          reasonCodes.length > 0 ? reasonCodes : [PAY_TERM_CHECKLIST_REASON.SI_CUTOFF_OPEN],
          employeeId,
          row?.id,
        );
      }
    }
  }

  /** Process step (12) — bind final payslip + is_final_pay. */
  async bindFinalPayslipToSettlement(input: {
    companyId: string;
    periodId: string;
    employeeId: string;
    payslipId: string;
  }): Promise<void> {
    const settlement = await this.loadOpenSettlement(input.companyId, input.employeeId, input.periodId);
    if (!settlement || settlement.status !== 'posted') {
      return;
    }
    await this.db.query(
      `
        UPDATE public.payroll_payslips
        SET is_final_pay = true,
            termination_settlement_id = $2::uuid,
            updated_at = NOW()
        WHERE id = $1::uuid AND employee_id = $3::uuid;
      `,
      [input.payslipId, settlement.id, input.employeeId],
    );
    await this.db.query(
      `
        UPDATE public.pay_termination_settlement
        SET final_payslip_id = $2::uuid, updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [settlement.id, input.payslipId],
    );
  }

  mapChecklistDisplay(snapshot: PayTermChecklistSnapshot) {
    return {
      asset_ack: snapshot.assetAck,
      si_cutoff: snapshot.siCutoff,
      leave_cashout: snapshot.leaveCashout,
      rd_included: snapshot.rdIncluded,
    };
  }
}
