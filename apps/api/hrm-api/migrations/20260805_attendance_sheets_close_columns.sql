-- PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01 · F-ATT-SHEET-02 close audit columns
-- Apply manually or via ensureAttendanceSheetSchema on hrm-api boot path.

ALTER TABLE public.attendance_sheets
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ NULL;

ALTER TABLE public.attendance_sheets
  ADD COLUMN IF NOT EXISTS closed_by TEXT NULL;
