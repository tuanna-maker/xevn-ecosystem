-- HRM attendance baseline migration
-- Target database: xevn_hrm

BEGIN;

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_at TIMESTAMPTZ NULL,
  check_out_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_attendance_status CHECK (status IN ('pending', 'present', 'absent', 'leave'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_company_employee_date
  ON public.attendance_records (company_id, employee_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_attendance_company_date
  ON public.attendance_records (company_id, attendance_date DESC);

CREATE TABLE IF NOT EXISTS public.attendance_events (
  id UUID PRIMARY KEY,
  attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NULL,
  payload JSONB NULL,
  CONSTRAINT chk_attendance_event_type CHECK (event_type IN ('check_in', 'check_out', 'status_change'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_events_record
  ON public.attendance_events (attendance_record_id, event_at DESC);

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ NULL,
  reviewed_by TEXT NULL,
  CONSTRAINT chk_leave_date_range CHECK (start_date <= end_date),
  CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status
  ON public.leave_requests (company_id, status, requested_at DESC);

COMMIT;
