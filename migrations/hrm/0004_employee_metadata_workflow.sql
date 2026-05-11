BEGIN;

CREATE TABLE IF NOT EXISTS public.employee_metadata_values (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  legal_entity_id UUID NULL,
  field_key TEXT NOT NULL,
  field_value JSONB NOT NULL,
  source_catalog_key TEXT NULL,
  workflow_code TEXT NULL,
  updated_by TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_metadata_values_scope
  ON public.employee_metadata_values (company_id, employee_id, field_key);

CREATE TABLE IF NOT EXISTS public.employee_metadata_change_requests (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  legal_entity_id UUID NULL,
  field_key TEXT NOT NULL,
  current_value JSONB NULL,
  requested_value JSONB NOT NULL,
  reason TEXT NULL,
  actor_user_id TEXT NULL,
  actor_name TEXT NULL,
  workflow_code TEXT NULL,
  source_catalog_key TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  decided_by TEXT NULL,
  decided_note TEXT NULL,
  decided_at TIMESTAMPTZ NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_employee_metadata_change_requests_status
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_employee_metadata_change_requests_scope
  ON public.employee_metadata_change_requests (company_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_employee_metadata_change_requests_employee
  ON public.employee_metadata_change_requests (employee_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.employee_metadata_audit_logs (
  id UUID PRIMARY KEY,
  change_request_id UUID NULL REFERENCES public.employee_metadata_change_requests(id) ON DELETE SET NULL,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  field_key TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_user_id TEXT NULL,
  actor_name TEXT NULL,
  payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_metadata_audit_logs_scope
  ON public.employee_metadata_audit_logs (company_id, employee_id, created_at DESC);

COMMIT;
