-- Wave 3 Supabase Zero — attendance request tables (P1-SUPA-BE-03)
-- Apply: node scripts/migrate-apply.mjs hrm

BEGIN;

CREATE TABLE IF NOT EXISTS public.overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  overtime_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours NUMERIC NOT NULL DEFAULT 0,
  overtime_type TEXT NOT NULL DEFAULT 'weekday',
  coefficient NUMERIC DEFAULT 1.5,
  reason TEXT NOT NULL,
  compensation_type TEXT DEFAULT 'salary',
  approver_id UUID,
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  actual_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_overtime_requests_company_status
  ON public.overtime_requests (company_id, status, overtime_date DESC);

CREATE TABLE IF NOT EXISTS public.business_trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL DEFAULT 1,
  purpose TEXT NOT NULL,
  transportation TEXT DEFAULT 'company_car',
  accommodation TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  advance_amount NUMERIC DEFAULT 0,
  companions TEXT,
  contact_info TEXT,
  approver_id UUID,
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  actual_cost NUMERIC,
  expense_report_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_trip_requests_company_status
  ON public.business_trip_requests (company_id, status, start_date DESC);

CREATE TABLE IF NOT EXISTS public.late_early_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  request_date DATE NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'late',
  late_time TIME,
  late_minutes INTEGER DEFAULT 0,
  early_time TIME,
  early_minutes INTEGER DEFAULT 0,
  reason TEXT NOT NULL,
  approver_id UUID,
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_late_early_requests_company_status
  ON public.late_early_requests (company_id, status, request_date DESC);

COMMIT;
