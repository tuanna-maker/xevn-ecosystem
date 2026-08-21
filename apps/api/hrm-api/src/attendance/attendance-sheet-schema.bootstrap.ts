/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảng chấm công (header DDL)
 * UC:         UC-BP-ATT-10/11 · HRM-AT-14
 * BR:         BR-BP-TS-02 · F-ATT-SHEET-02
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11
 * TechSpec:   TECHSPEC_HRM_ENTERPRISE.md §6.4
 * Purpose:    Runtime DDL attendance_sheets + close columns (closed_at/closed_by) cho F-ATT-SHEET-02.
 * WorkItem:   PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01
 * Coded:      2026-08-05
 * Callers:    attendance-catalog.service.ts · attendance-sheet-sign.service.ts
 * must_keep:   ADD COLUMN IF NOT EXISTS — bảng cũ từ AT-14 không thiếu cột khi POST close
 * SOLID:      Một nơi DDL header — tránh lệch catalog vs sign
 * LastVerified: attendance-sheet-schema.bootstrap.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * change_mode: ADD
 * What: ensureAttTimesheetLineSchema — physical att_timesheet_line (DATA-ATT-LINE §2)
 * Why:  R-PAY-F-ATT-LINE — PAY bag đọc closed+locked; AGG ghi giờ công
 * SRS:  FR-UC-BP-ATT-10 · DATA-ATT-LINE-01 §2 · API-ATT-LINE-01 §2
 * must_keep: attendance_sheets header + close cols · soft-delete archived_at · cấm wipe
 */
import type { HrmDbService } from '../db/hrm-db.service';

/** Logical att_timesheet_header AS-IS table name in Nest runtime. */
export async function ensureAttendanceSheetSchema(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.attendance_sheets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      attendance_type TEXT NOT NULL DEFAULT 'daily',
      standard_type TEXT NOT NULL DEFAULT 'standard',
      department TEXT,
      positions TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT,
      notes TEXT,
      closed_at TIMESTAMPTZ,
      closed_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    ALTER TABLE public.attendance_sheets
      ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ NULL;
  `);
  await db.query(`
    ALTER TABLE public.attendance_sheets
      ADD COLUMN IF NOT EXISTS closed_by TEXT NULL;
  `);
}

/**
 * Physical PAY hours grain — Nest name must be exact `att_timesheet_line` (probe hard-coded).
 * Writer: ATT AGG only. Reader: PAY bag when header closed AND line_locked.
 */
export async function ensureAttTimesheetLineSchema(
  db: HrmDbService,
): Promise<void> {
  await ensureAttendanceSheetSchema(db);
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.att_timesheet_line (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      header_id UUID NOT NULL,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      standard_hours NUMERIC(12,4) NOT NULL,
      ot_hours_weighted NUMERIC(12,4) NOT NULL DEFAULT 0,
      paid_leave_hours NUMERIC(12,4) NOT NULL DEFAULT 0,
      unpaid_leave_hours NUMERIC(12,4) NOT NULL DEFAULT 0,
      late_penalty_hours NUMERIC(12,4) NULL,
      meal_shift_hours NUMERIC(12,4) NULL,
      other_components_json JSONB NULL,
      payable_hours NUMERIC(12,4) NOT NULL,
      line_locked BOOLEAN NOT NULL DEFAULT FALSE,
      work_days NUMERIC(8,2) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived_at TIMESTAMPTZ NULL,
      CONSTRAINT chk_att_timesheet_line_standard_hours_ge0 CHECK (standard_hours >= 0),
      CONSTRAINT chk_att_timesheet_line_ot_hours_ge0 CHECK (ot_hours_weighted >= 0),
      CONSTRAINT chk_att_timesheet_line_paid_leave_ge0 CHECK (paid_leave_hours >= 0),
      CONSTRAINT chk_att_timesheet_line_unpaid_leave_ge0 CHECK (unpaid_leave_hours >= 0),
      CONSTRAINT chk_att_timesheet_line_payable_ge0 CHECK (payable_hours >= 0)
    );
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS att_timesheet_line_header_employee_active_uq
      ON public.att_timesheet_line (header_id, employee_id)
      WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_att_timesheet_line_company_employee
      ON public.att_timesheet_line (company_id, employee_id);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_att_timesheet_line_header
      ON public.att_timesheet_line (header_id);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_att_timesheet_line_company_header_active
      ON public.att_timesheet_line (company_id, header_id)
      WHERE archived_at IS NULL;
  `);
}
