/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảng công — tổng hợp dòng giờ (AGG)
 * UC:         FR-UC-BP-ATT-10 · FR-UC-BP-ATT-11
 * BR:         BR-BP-TS-01 · BR-PAY-ATT-LINE-05 · FUNNEL OPEN-Q3
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-10
 * TechSpec:   DATA-ATT-LINE-01 §2 · API-ATT-LINE-01 §2 · FUNNEL-DB-01 §4.2
 * Purpose:    Pure helpers + AGG materialize att_timesheet_line từ attendance_records / OT ATT SoT.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * Coded:      2026-08-07
 * Callers:    attendance-sheet-sign.service (aggregate / submit / close / reopen)
 * Callees:    HrmDbService · ensureAttTimesheetLineSchema · expandPayrollAttendanceSheetCompanyIds
 * must_keep:  cấm PAY Leave/OT HTTP · cấm silent invent hours ngoài ATT SoT · soft-delete only
 * SOLID:      AGG compute tách Nest controller
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02
 * Coded:      2026-08-07
 * What:       Header start_date/end_date → toLeaveDayKey (Date|ISO|yyyy-MM-dd); cấm String(Date).slice
 * Why:        QA-ATT-LINE-01 FAIL AGG_SHEET_DATE_INVALID · stamp PAYFEATT-MSIJH9MT (pg Date live)
 * must_keep:  ATT-412 / PREVIEW-STUB taxonomy · no silent 0 · payroll_e2e_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem:   PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
 * change_mode: ADD
 * What:       Write late_penalty_hours on AGG via evaluateLatePenaltyHours (mode/bands/off).
 * Why:        FR-UC-BP-ATT-02 Diễn biến #3/#5 funnel · ≠ ATT-10/PAY DONE
 * must_keep:  notifyLate ≠ off · Nest /core DENY · attendance_uat_ready=false
 */
import { randomUUID } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { expandPayrollAttendanceSheetCompanyIds } from '../common/hrm-list-scope';
import type { HrmDbService } from '../db/hrm-db.service';
import { ensureAttTimesheetLineSchema } from './attendance-sheet-schema.bootstrap';
import type { AttendanceSheetHeaderRow } from './attendance-sheet-scope';
import { toLeaveDayKey } from './leave-attendance-funnel.service';
import {
  evaluateLatePenaltyHours,
  normalizeLatePenaltyMode,
  parseLatePenaltyBands,
  type LatePenaltyBand,
  type LatePenaltyMode,
} from './late-penalty.util';

/** GĐ1 default day length when punch span absent (FUNNEL-DB §4.2). */
export const ATT_STANDARD_DAY_HOURS = 8;

export type AttTimesheetLineHours = {
  standard_hours: number;
  ot_hours_weighted: number;
  paid_leave_hours: number;
  unpaid_leave_hours: number;
  payable_hours: number;
  work_days: number | null;
};

export type AggregateSheetResult = {
  sheet_id: string;
  status: string;
  line_count: number;
  warnings: string[];
};

/** FUNNEL-DB-01 §4.2 unpaid bucket — no invent catalog is_paid column. */
export function isUnpaidLeaveTypeKey(
  leaveTypeKey: string | null | undefined,
): boolean {
  const raw = String(leaveTypeKey ?? '')
    .trim()
    .toLowerCase();
  if (!raw) return false;
  if (raw === 'unpaid' || raw === 'lvt_04') return true;
  const stripped = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
  if (stripped.includes('khong luong') || stripped.includes('unpaid'))
    return true;
  return false;
}

function roundHours(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function hoursFromPunch(checkIn: unknown, checkOut: unknown): number | null {
  if (!checkIn || !checkOut) return null;
  const a = new Date(String(checkIn)).getTime();
  const b = new Date(String(checkOut)).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  return roundHours((b - a) / 3_600_000);
}

export function computeLineHoursFromRecords(input: {
  records: Array<{
    status: string;
    leave_type_key?: string | null;
    check_in_at?: unknown;
    check_out_at?: unknown;
  }>;
  otWeightedHours: number;
  standardDayHours?: number;
}): AttTimesheetLineHours {
  const dayH = input.standardDayHours ?? ATT_STANDARD_DAY_HOURS;
  let standard = 0;
  let paidLeave = 0;
  let unpaidLeave = 0;
  let workDays = 0;

  for (const rec of input.records) {
    const status = String(rec.status ?? '')
      .trim()
      .toLowerCase();
    if (status === 'present') {
      const punch = hoursFromPunch(rec.check_in_at, rec.check_out_at);
      const h = punch != null && punch > 0 ? Math.min(punch, dayH * 2) : dayH;
      standard += h;
      workDays += 1;
    } else if (status === 'leave') {
      if (isUnpaidLeaveTypeKey(rec.leave_type_key)) {
        unpaidLeave += dayH;
      } else {
        paidLeave += dayH;
      }
    }
  }

  const ot = Math.max(0, roundHours(input.otWeightedHours));
  standard = roundHours(standard);
  paidLeave = roundHours(paidLeave);
  unpaidLeave = roundHours(unpaidLeave);
  const payable = roundHours(standard + paidLeave + ot);

  return {
    standard_hours: standard,
    ot_hours_weighted: ot,
    paid_leave_hours: paidLeave,
    unpaid_leave_hours: unpaidLeave,
    payable_hours: payable,
    work_days: workDays > 0 ? workDays : null,
  };
}

async function sumOtWeightedHours(
  db: HrmDbService,
  companyIds: string[],
  employeeId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  try {
    const res = await db.query<{ weighted: string }>(
      `
        SELECT COALESCE(SUM(total_hours * COALESCE(coefficient, 1.5)), 0)::text AS weighted
        FROM public.overtime_requests
        WHERE employee_id = $1::uuid
          AND company_id::text = ANY($2::text[])
          AND status = 'approved'
          AND overtime_date::date >= $3::date
          AND overtime_date::date <= $4::date;
      `,
      [employeeId, companyIds, startDate, endDate],
    );
    const n = Number(res.rows[0]?.weighted ?? 0);
    return Number.isFinite(n) && n > 0 ? roundHours(n) : 0;
  } catch {
    return 0;
  }
}

async function sumApprovedLateMinutes(
  db: HrmDbService,
  companyIds: string[],
  employeeId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  try {
    const res = await db.query<{ late: string }>(
      `
        SELECT COALESCE(SUM(COALESCE(late_minutes, 0)), 0)::text AS late
        FROM public.late_early_requests
        WHERE employee_id = $1::uuid
          AND company_id::text = ANY($2::text[])
          AND status = 'approved'
          AND request_date::date >= $3::date
          AND request_date::date <= $4::date;
      `,
      [employeeId, companyIds, startDate, endDate],
    );
    const n = Number(res.rows[0]?.late ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

async function loadCompanyLatePenaltyCfg(
  db: HrmDbService,
  companyId: string,
): Promise<{
  latePenaltyEnabled: boolean;
  mode: LatePenaltyMode | null;
  bands: LatePenaltyBand[];
}> {
  try {
    const companyIds = expandPayrollAttendanceSheetCompanyIds(companyId);
    const res = await db.query<{
      late_penalty_mode: string | null;
      late_penalty_bands: unknown;
      late_penalty_enabled: boolean | null;
    }>(
      `
        SELECT late_penalty_mode, late_penalty_bands, late_penalty_enabled
        FROM public.attendance_rules
        WHERE company_id::text = ANY($1::text[])
        ORDER BY updated_at DESC NULLS LAST
        LIMIT 1;
      `,
      [companyIds],
    );
    const row = res.rows[0];
    if (!row) {
      return { latePenaltyEnabled: true, mode: null, bands: [] };
    }
    let bands: LatePenaltyBand[] = [];
    try {
      bands = parseLatePenaltyBands(row.late_penalty_bands ?? []);
    } catch {
      bands = [];
    }
    return {
      latePenaltyEnabled: row.late_penalty_enabled !== false,
      mode: normalizeLatePenaltyMode(row.late_penalty_mode),
      bands,
    };
  } catch {
    return { latePenaltyEnabled: true, mode: null, bands: [] };
  }
}

/**
 * F-ATT-SHEET-AGG-01 — idempotent rebuild active lines for sheet window.
 * Closed header → 409 HRM-ATT-SHEET-LOCKED.
 */
export async function aggregateAttendanceSheetLines(
  db: HrmDbService,
  header: AttendanceSheetHeaderRow,
): Promise<AggregateSheetResult> {
  await ensureAttTimesheetLineSchema(db);

  const status = String(header.status ?? '')
    .trim()
    .toLowerCase();
  if (status === 'closed') {
    throw new ApiException(
      'HRM-ATT-SHEET-LOCKED',
      'Cannot aggregate a closed attendance sheet',
      HttpStatus.CONFLICT,
    );
  }

  const sheetId = String(header.id);
  const companyId = String(header.company_id);
  // Policy = sheet header write / leave funnel: pg DATE → local Y-M-D; ISO/plain → lead-10.
  // Cấm String(Date).slice(0,10) → "Tue Sep 01…" → AGG_SHEET_DATE_INVALID → line_count=0.
  const startDate =
    toLeaveDayKey(header.start_date as string | Date | null | undefined) ?? '';
  const endDate =
    toLeaveDayKey(header.end_date as string | Date | null | undefined) ?? '';
  const warnings: string[] = [];

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    warnings.push('AGG_SHEET_DATE_INVALID');
    return {
      sheet_id: sheetId,
      status: String(header.status),
      line_count: 0,
      warnings,
    };
  }

  const companyIds = expandPayrollAttendanceSheetCompanyIds(companyId);
  const penaltyCfg = await loadCompanyLatePenaltyCfg(db, companyId);

  let records: Array<{
    employee_id: string;
    status: string;
    leave_type_key: string | null;
    check_in_at: unknown;
    check_out_at: unknown;
  }> = [];
  try {
    const recRes = await db.query<{
      employee_id: string;
      status: string;
      leave_type_key: string | null;
      check_in_at: unknown;
      check_out_at: unknown;
    }>(
      `
        SELECT
          employee_id::text AS employee_id,
          status,
          leave_type_key,
          check_in_at,
          check_out_at
        FROM public.attendance_records
        WHERE company_id::text = ANY($1::text[])
          AND attendance_date::date >= $2::date
          AND attendance_date::date <= $3::date
        ORDER BY employee_id, attendance_date;
      `,
      [companyIds, startDate, endDate],
    );
    records = recRes.rows;
  } catch {
    warnings.push('AGG_RECORDS_UNAVAILABLE');
  }

  const byEmployee = new Map<string, typeof records>();
  for (const row of records) {
    const empId = String(row.employee_id);
    const list = byEmployee.get(empId) ?? [];
    list.push(row);
    byEmployee.set(empId, list);
  }

  // Also enroll employees with approved OT in window but no day records.
  try {
    const otEmp = await db.query<{ employee_id: string }>(
      `
        SELECT DISTINCT employee_id::text AS employee_id
        FROM public.overtime_requests
        WHERE company_id::text = ANY($1::text[])
          AND status = 'approved'
          AND overtime_date::date >= $2::date
          AND overtime_date::date <= $3::date;
      `,
      [companyIds, startDate, endDate],
    );
    for (const row of otEmp.rows) {
      const empId = String(row.employee_id);
      if (!byEmployee.has(empId)) {
        byEmployee.set(empId, []);
      }
    }
  } catch {
    warnings.push('AGG_OT_ENROLL_UNAVAILABLE');
  }

  if (byEmployee.size === 0) {
    warnings.push('AGG_EMPTY_ENROLLMENT');
  }

  let lineCount = 0;
  for (const [employeeId, empRecords] of byEmployee) {
    const otWeighted = await sumOtWeightedHours(
      db,
      companyIds,
      employeeId,
      startDate,
      endDate,
    );
    const hours = computeLineHoursFromRecords({
      records: empRecords,
      otWeightedHours: otWeighted,
    });

    // FR-UC-BP-ATT-02 funnel: evaluate late_penalty_hours (≠ PAY / ≠ ATT-10 DONE).
    // Input minutes from approved late_early peer (source of late span) — mode SoT remains rules.
    const lateMinutes = await sumApprovedLateMinutes(
      db,
      companyIds,
      employeeId,
      startDate,
      endDate,
    );
    const latePenaltyHours = evaluateLatePenaltyHours({
      latePenaltyEnabled: penaltyCfg.latePenaltyEnabled,
      mode: penaltyCfg.mode,
      bands: penaltyCfg.bands,
      lateMinutes,
    });

    const existing = await db.query<{ id: string }>(
      `
        SELECT id::text AS id
        FROM public.att_timesheet_line
        WHERE header_id = $1::uuid
          AND employee_id = $2::uuid
          AND archived_at IS NULL
        LIMIT 1;
      `,
      [sheetId, employeeId],
    );

    if (existing.rows[0]?.id) {
      await db.query(
        `
          UPDATE public.att_timesheet_line
          SET
            company_id = $2,
            standard_hours = $3,
            ot_hours_weighted = $4,
            paid_leave_hours = $5,
            unpaid_leave_hours = $6,
            payable_hours = $7,
            work_days = $8,
            late_penalty_hours = $9,
            line_locked = FALSE,
            updated_at = NOW()
          WHERE id = $1::uuid;
        `,
        [
          existing.rows[0].id,
          companyId,
          hours.standard_hours,
          hours.ot_hours_weighted,
          hours.paid_leave_hours,
          hours.unpaid_leave_hours,
          hours.payable_hours,
          hours.work_days,
          latePenaltyHours,
        ],
      );
    } else {
      await db.query(
        `
          INSERT INTO public.att_timesheet_line (
            id, header_id, company_id, employee_id,
            standard_hours, ot_hours_weighted, paid_leave_hours, unpaid_leave_hours,
            payable_hours, line_locked, work_days, late_penalty_hours, created_at, updated_at
          ) VALUES (
            $1::uuid, $2::uuid, $3, $4::uuid,
            $5, $6, $7, $8,
            $9, FALSE, $10, $11, NOW(), NOW()
          );
        `,
        [
          randomUUID(),
          sheetId,
          companyId,
          employeeId,
          hours.standard_hours,
          hours.ot_hours_weighted,
          hours.paid_leave_hours,
          hours.unpaid_leave_hours,
          hours.payable_hours,
          hours.work_days,
          latePenaltyHours,
        ],
      );
    }
    lineCount += 1;
  }

  const countRes = await db.query<{ c: string }>(
    `
      SELECT COUNT(*)::text AS c
      FROM public.att_timesheet_line
      WHERE header_id = $1::uuid AND archived_at IS NULL;
    `,
    [sheetId],
  );
  const activeCount = Number(countRes.rows[0]?.c ?? lineCount);
  if (activeCount === 0) {
    warnings.push('AGG_LINE_COUNT_ZERO');
  }

  return {
    sheet_id: sheetId,
    status: String(header.status),
    line_count: activeCount,
    warnings,
  };
}

/** F-ATT-SHEET-02 EXPAND — lock active lines when header closes. */
export async function lockAttTimesheetLinesForSheet(
  db: HrmDbService,
  headerId: string,
): Promise<number> {
  await ensureAttTimesheetLineSchema(db);
  const res = await db.query<{ c: string }>(
    `
      WITH updated AS (
        UPDATE public.att_timesheet_line
        SET line_locked = TRUE, updated_at = NOW()
        WHERE header_id = $1::uuid AND archived_at IS NULL
        RETURNING id
      )
      SELECT COUNT(*)::text AS c FROM updated;
    `,
    [headerId],
  );
  return Number(res.rows[0]?.c ?? 0);
}

/** F-ATT-SHEET-03 EXPAND — archive active lines on reopen (soft-delete). */
export async function archiveAttTimesheetLinesForSheet(
  db: HrmDbService,
  headerId: string,
): Promise<number> {
  await ensureAttTimesheetLineSchema(db);
  const res = await db.query<{ c: string }>(
    `
      WITH archived AS (
        UPDATE public.att_timesheet_line
        SET archived_at = NOW(), line_locked = FALSE, updated_at = NOW()
        WHERE header_id = $1::uuid AND archived_at IS NULL
        RETURNING id
      )
      SELECT COUNT(*)::text AS c FROM archived;
    `,
    [headerId],
  );
  return Number(res.rows[0]?.c ?? 0);
}
