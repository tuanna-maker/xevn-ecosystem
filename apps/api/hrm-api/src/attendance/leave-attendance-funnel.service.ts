/**
 * @CODE-MEMORY
 * Screen:     HRM → Duyệt phép → Bản ghi / lưới tuần (Công nghỉ phép)
 * UC:         FR-UC-BP-ATT-09 → ATT-10 · AC-ATT-LV-SHEET-01..03
 * BR:         INV-1..5 · F-ATT-LEAVE-FUNNEL-01..04 · conflict present · locked closed sheet
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-09/10
 * SRS bước:   ATT-09 Thành công → ATT-10 đầu vào «Công nghỉ phép» · Parent L11
 * TechSpec:   docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §4 F-ATT-LEAVE-FUNNEL-01..04 · §5
 * Purpose:    Option A — materialize/reverse attendance_records leave markers + soft FK;
 *             không FE-join; không đụng att_timesheet_line / AGG-01.
 * WorkItem:   PO-HRM-ATT-LEAVE-FUNNEL-BE-01
 * Coded:      2026-08-06
 * Callers:    LeaveRequestsService · LeaveWorkflowBridge
 * Callees:    HrmDbService · expandPayrollAttendanceSheetCompanyIds · attendance_records / sheets
 * must_keep:  J-HRM-06b storm · J-HRM-06c sign · WAIVE_L2 · AC-ATT-SHEET empty honesty · no Option C
 * SOLID:      Funnel SRP tách LeaveRequestsService / AttendanceService list projection
 * LastVerified: leave-attendance-funnel.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-01
 * change_mode: ADD
 * What: ensureSchema soft FK cols; materialize on approve; reverse on cancel-after-approve;
 *       CONFLICT present · LOCKED closed/submitted overlap; scope TEXT company expand
 * must_keep: no AGG line · no seed · attendance_uat_ready=false · no wipe sign
 * DB: docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md §3
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-02
 * change_mode: FIX
 * What: toLeaveDayKey / expandLeaveDateRange — pg Date | ISO datetime | yyyy-MM-dd
 *       (cấm String(Date).slice → "Thu Oct 08"); LOCKED path gets non-empty days
 * must_keep: J-HRM-06b/06c · WAIVE_L2 · no Option C · attendance_uat_ready=false
 * Residual closed: R-ATT-LEAVE-FUNNEL-DATE-EXPAND
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { expandPayrollAttendanceSheetCompanyIds } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { ensureAttendanceSheetSchema } from './attendance-sheet-schema.bootstrap';

export const HRM_ATT_LEAVE_FUNNEL_CONFLICT = 'HRM-ATT-LEAVE-FUNNEL-CONFLICT';
export const HRM_ATT_SHEET_LOCKED = 'HRM-ATT-SHEET-LOCKED';

/** Local label for note — avoid circular import with LeaveRequestsService. */
function leaveTypeNoteLabel(leaveType: string): string {
  const key = leaveType.trim().toLowerCase();
  const map: Record<string, string> = {
    annual: 'Phép năm',
    sick: 'Nghỉ ốm',
    maternity: 'Thai sản',
    unpaid: 'Không lương',
    compensatory: 'Nghỉ bù',
    lvt_01: 'Phép năm',
    lvt_02: 'Ốm',
    lvt_03: 'Thai sản',
    lvt_04: 'Không lương',
  };
  return map[key] ?? (leaveType.trim() || 'Nghỉ phép');
}

export type LeaveFunnelSourceRow = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  /** pg DATE may arrive as Date; ISO datetime also accepted. */
  start_date: string | Date;
  end_date: string | Date;
};

export type LeaveFunnelMaterializeResult = {
  materialized_days: string[];
  materialized_record_ids: string[];
};

/**
 * Coerce pg Date | ISO datetime | yyyy-MM-dd → calendar day YYYY-MM-DD.
 * Never use String(Date).slice(0,10) — that yields "Thu Oct 08", not a day key.
 * pg DATE → JS Date at **local** midnight (node-pg default) → use local Y-M-D;
 * ISO/plain strings starting with yyyy-MM-dd → take leading 10 chars (UTC-safe for Z).
 */
export function toLeaveDayKey(
  value: string | Date | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) {
      return null;
    }
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }
  return toLeaveDayKey(parsed);
}

/** Inclusive calendar days YYYY-MM-DD (UTC) from Date | ISO | yyyy-MM-dd. */
export function expandLeaveDateRange(
  startDate: string | Date,
  endDate: string | Date,
): string[] {
  const start = toLeaveDayKey(startDate);
  const end = toLeaveDayKey(endDate);
  if (
    !start ||
    !end ||
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end)
  ) {
    return [];
  }
  const out: string[] = [];
  const cursor = new Date(`${start}T00:00:00.000Z`);
  const last = new Date(`${end}T00:00:00.000Z`);
  if (
    !Number.isFinite(cursor.getTime()) ||
    !Number.isFinite(last.getTime()) ||
    cursor > last
  ) {
    return [];
  }
  while (cursor <= last) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

@Injectable()
export class LeaveAttendanceFunnelService {
  constructor(private readonly db: HrmDbService) {}

  /** DB-01 §3 — soft FK + partial IX (Nest ensureSchema only). */
  async ensureLeaveFunnelSchema(): Promise<void> {
    // Base table may not exist yet on leave-only path (approve without prior records GET).
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_records (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        attendance_date DATE NOT NULL,
        check_in_at TIMESTAMPTZ NULL,
        check_out_at TIMESTAMPTZ NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        note TEXT NULL,
        created_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // ATT-CODE-CATALOG-BE-01 — DROP closed status ceiling if legacy CREATE embedded CHECK.
    await this.db.query(`
      ALTER TABLE public.attendance_records
      DROP CONSTRAINT IF EXISTS chk_attendance_status;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_company_employee_date
      ON public.attendance_records (company_id, employee_id, attendance_date);
    `);
    await this.db.query(`
      ALTER TABLE public.attendance_records
      ADD COLUMN IF NOT EXISTS leave_request_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.attendance_records
      ADD COLUMN IF NOT EXISTS leave_type_key TEXT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_records_leave_request_id
      ON public.attendance_records (leave_request_id)
      WHERE leave_request_id IS NOT NULL;
    `);
  }

  /**
   * F-ATT-LEAVE-FUNNEL-01 — UPSERT status=leave + soft FK for each day in range.
   * present → 409 CONFLICT; day in submitted/closed sheet → 409 LOCKED.
   */
  async materializeApprovedLeave(
    leave: LeaveFunnelSourceRow,
  ): Promise<LeaveFunnelMaterializeResult> {
    await this.ensureLeaveFunnelSchema();
    const days = expandLeaveDateRange(leave.start_date, leave.end_date);
    if (days.length === 0) {
      return { materialized_days: [], materialized_record_ids: [] };
    }
    const companyKeys = expandPayrollAttendanceSheetCompanyIds(
      leave.company_id,
    );
    await this.assertNoLockedSheetOverlap(companyKeys, days, 'materialize');
    await this.assertNoPresentConflict(companyKeys, leave.employee_id, days);

    const leaveTypeKey = String(leave.leave_type ?? '').trim();
    const note = `Nghỉ phép: ${leaveTypeNoteLabel(leaveTypeKey)}`;
    const recordIds: string[] = [];
    const materializedDays: string[] = [];

    for (const day of days) {
      const id = randomUUID();
      const res = await this.db.query<{ id: string; attendance_date: string }>(
        `
          INSERT INTO public.attendance_records (
            id, company_id, employee_id, attendance_date,
            check_in_at, check_out_at, status, note, created_by,
            leave_request_id, leave_type_key
          ) VALUES (
            $1::uuid, $2::text, $3::uuid, $4::date,
            NULL, NULL, 'leave', $5, 'leave-funnel',
            $6::uuid, $7
          )
          ON CONFLICT (company_id, employee_id, attendance_date)
          DO UPDATE SET
            status = 'leave',
            leave_request_id = EXCLUDED.leave_request_id,
            leave_type_key = EXCLUDED.leave_type_key,
            note = COALESCE(EXCLUDED.note, public.attendance_records.note),
            updated_at = NOW()
          WHERE public.attendance_records.status IN ('pending', 'absent', 'leave')
             OR public.attendance_records.leave_request_id = EXCLUDED.leave_request_id
          RETURNING id::text AS id, attendance_date::text AS attendance_date;
        `,
        [
          id,
          leave.company_id,
          leave.employee_id,
          day,
          note,
          leave.id,
          leaveTypeKey || null,
        ],
      );
      const row = res.rows[0];
      if (!row) {
        throw new ApiException(
          HRM_ATT_LEAVE_FUNNEL_CONFLICT,
          `Cannot materialize leave on ${day}: day already present or locked`,
          HttpStatus.CONFLICT,
          { attendance_date: day, leave_request_id: leave.id },
        );
      }
      recordIds.push(row.id);
      materializedDays.push(toLeaveDayKey(row.attendance_date) ?? day);
    }

    return {
      materialized_days: materializedDays,
      materialized_record_ids: recordIds,
    };
  }

  /**
   * F-ATT-LEAVE-FUNNEL-02 — clear markers by leave_request_id when leaving approved.
   * Closed sheet covering any marker date → 409 LOCKED (no silent wipe).
   */
  async reverseLeaveMarkers(
    leaveRequestId: string,
    companyIdHint?: string,
  ): Promise<{ cleared: number }> {
    await this.ensureLeaveFunnelSchema();
    const existing = await this.db.query<{
      id: string;
      company_id: string;
      attendance_date: string;
    }>(
      `
        SELECT id::text AS id, company_id::text AS company_id, attendance_date::text AS attendance_date
        FROM public.attendance_records
        WHERE leave_request_id = $1::uuid
          AND status = 'leave';
      `,
      [leaveRequestId],
    );
    if (!existing.rows.length) {
      return { cleared: 0 };
    }
    const companyId = companyIdHint?.trim() || existing.rows[0].company_id;
    const companyKeys = expandPayrollAttendanceSheetCompanyIds(companyId);
    const days = existing.rows
      .map((r) => toLeaveDayKey(r.attendance_date))
      .filter((d): d is string => Boolean(d));
    await this.assertNoLockedSheetOverlap(companyKeys, days, 'reverse');

    const res = await this.db.query(
      `
        UPDATE public.attendance_records
        SET status = 'pending',
            leave_request_id = NULL,
            leave_type_key = NULL,
            note = NULL,
            updated_at = NOW()
        WHERE leave_request_id = $1::uuid
          AND status = 'leave'
        RETURNING id;
      `,
      [leaveRequestId],
    );
    return { cleared: res.rows.length };
  }

  private async assertNoPresentConflict(
    companyKeys: string[],
    employeeId: string,
    days: string[],
  ): Promise<void> {
    const res = await this.db.query<{
      attendance_date: string;
      status: string;
    }>(
      `
        SELECT attendance_date::text AS attendance_date, status
        FROM public.attendance_records
        WHERE company_id = ANY($1::text[])
          AND employee_id = $2::uuid
          AND attendance_date = ANY($3::date[])
          AND status = 'present';
      `,
      [companyKeys, employeeId, days],
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_ATT_LEAVE_FUNNEL_CONFLICT,
        `Leave overlaps present attendance on ${String(res.rows[0].attendance_date).slice(0, 10)}`,
        HttpStatus.CONFLICT,
        {
          attendance_date: String(res.rows[0].attendance_date).slice(0, 10),
          status: res.rows[0].status,
        },
      );
    }
  }

  /**
   * Approve path: submitted|closed lock (SPEC §5).
   * Reverse path: closed only (DB-01 §3.3).
   */
  private async assertNoLockedSheetOverlap(
    companyKeys: string[],
    days: string[],
    mode: 'materialize' | 'reverse',
  ): Promise<void> {
    await ensureAttendanceSheetSchema(this.db);
    const statusFilter =
      mode === 'materialize'
        ? `s.status IN ('submitted', 'closed')`
        : `s.status = 'closed'`;
    const res = await this.db.query<{
      id: string;
      status: string;
      day: string;
    }>(
      `
        SELECT s.id::text AS id, s.status, d.day::text AS day
        FROM public.attendance_sheets s
        CROSS JOIN LATERAL unnest($2::date[]) AS d(day)
        WHERE s.company_id = ANY($1::text[])
          AND ${statusFilter}
          AND d.day BETWEEN s.start_date AND s.end_date
        LIMIT 1;
      `,
      [companyKeys, days],
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_ATT_SHEET_LOCKED,
        `Attendance sheet is ${res.rows[0].status}; cannot ${mode} leave markers for ${String(res.rows[0].day).slice(0, 10)}`,
        HttpStatus.CONFLICT,
        {
          sheet_id: res.rows[0].id,
          sheet_status: res.rows[0].status,
          attendance_date: String(res.rows[0].day).slice(0, 10),
        },
      );
    }
  }
}
