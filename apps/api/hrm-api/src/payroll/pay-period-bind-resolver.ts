/**
 * @CODE-MEMORY
 * Screen:     HRM → Process kỳ lương — bind table resolver (F-PAY-ATT-CLOSED-01)
 * UC:         FR-UC-BP-PAY-01 · AC-AMIS-ATT-XFER-01
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md §2
 * Purpose:    Prefer pay_period_timesheet_bind over EXISTS probe when present — orthogonal to att_timesheet_line.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01
 * must_keep:  ATT-LINE-01 hours bag unchanged · alias bind ≠ att_timesheet_line
 */
import { HrmDbService } from '../db/hrm-db.service';

export async function probeTimesheetBindTable(
  db: HrmDbService,
): Promise<boolean> {
  try {
    const res = await db.query<{ exists: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'pay_period_timesheet_bind'
        ) AS exists;
      `,
    );
    return Boolean(res.rows[0]?.exists);
  } catch {
    return false;
  }
}

/** Active closed sheet header ids bound to payroll period — empty when table absent or no binds. */
export async function resolveBoundClosedSheetIds(
  db: HrmDbService,
  periodId: string,
): Promise<string[]> {
  const present = await probeTimesheetBindTable(db);
  if (!present) return [];
  try {
    const res = await db.query<{ timesheet_header_id: string }>(
      `
        SELECT b.timesheet_header_id::text AS timesheet_header_id
        FROM public.pay_period_timesheet_bind b
        INNER JOIN public.attendance_sheets s ON s.id = b.timesheet_header_id
        WHERE b.payroll_period_id = $1::uuid
          AND b.archived_at IS NULL
          AND s.status = 'closed'
        ORDER BY b.bound_at DESC;
      `,
      [periodId],
    );
    return res.rows.map((r) => r.timesheet_header_id);
  } catch {
    return [];
  }
}

/** True when bind table has at least one active bind for period (AMIS chuyển công). */
export async function hasActiveTimesheetBindForPeriod(
  db: HrmDbService,
  periodId: string,
): Promise<boolean> {
  const ids = await resolveBoundClosedSheetIds(db, periodId);
  return ids.length > 0;
}
