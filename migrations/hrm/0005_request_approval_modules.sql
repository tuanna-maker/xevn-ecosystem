BEGIN;

CREATE TABLE IF NOT EXISTS public.attendance_update_requests (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NULL,
  position TEXT NULL,
  attendance_date DATE NOT NULL,
  update_type TEXT NOT NULL,
  current_check_in TIMESTAMPTZ NULL,
  current_check_out TIMESTAMPTZ NULL,
  requested_check_in TIMESTAMPTZ NULL,
  requested_check_out TIMESTAMPTZ NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT NULL,
  approver_name TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ NULL,
  rejected_reason TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_attendance_update_request_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_update_requests_company_status
  ON public.attendance_update_requests (company_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  employee_id UUID NULL,
  employee_name TEXT NOT NULL,
  employee_code TEXT NULL,
  department TEXT NULL,
  request_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  meal_type TEXT NULL,
  meal_date DATE NULL,
  meal_quantity INT NULL,
  vehicle_purpose TEXT NULL,
  vehicle_destination TEXT NULL,
  vehicle_date DATE NULL,
  vehicle_time_start TEXT NULL,
  vehicle_time_end TEXT NULL,
  vehicle_passengers INT NULL,
  supply_items JSONB NULL,
  supply_urgency TEXT NULL,
  approved_by TEXT NULL,
  approved_at TIMESTAMPTZ NULL,
  rejected_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_company_status
  ON public.service_requests (company_id, status, created_at DESC);

COMMIT;
