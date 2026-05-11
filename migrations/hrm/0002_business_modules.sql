-- HRM business modules: employees + payroll periods
-- Target database: xevn_hrm

BEGIN;

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  job_title_key TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  hired_at DATE NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_employees_status CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_code
  ON public.employees (company_id, employee_code);

CREATE INDEX IF NOT EXISTS idx_employees_company_archived
  ON public.employees (company_id, archived_at, created_at DESC);

CREATE TABLE IF NOT EXISTS public.payroll_periods (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  period_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT NULL,
  processed_at TIMESTAMPTZ NULL,
  closed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_payroll_status CHECK (status IN ('draft', 'processed', 'closed')),
  CONSTRAINT chk_payroll_date_range CHECK (start_date <= end_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_period_company_date_range
  ON public.payroll_periods (company_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_payroll_periods_company_status_start
  ON public.payroll_periods (company_id, status, start_date DESC);

COMMIT;
