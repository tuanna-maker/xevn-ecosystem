-- @CODE-MEMORY
-- Screen: N/A (BE) — HRM labor contract compensation package (F5)
-- UC: UC-HRM-CI-08..11 · UC-HRM-25
-- BR: BR-CD-F5-01..07
-- SRS: docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5 · docs/hrm/SRS.md §13 UC-HRM-25 · §14 UC-HRM-28
-- TechSpec: docs/api/openapi/hrm-api.yaml ContractsInsurance compensation-*
-- Purpose: Separate compensation (base / probation / allowance) from employee_contracts body;
--          versioned packages + append-only history for salary/allowance changes.
-- WorkItem: CD-FB-08-CONTRACT
-- BE-Chain: employee_compensation_packages → employee_compensation_lines → employee_compensation_history;
--           employee_contracts.compensation_package_id FK (optional)
-- Impact: Payroll must read active package lines (BR-CD-F5-07), not contracts.salary legacy
-- LastVerified: apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.spec.ts
--
-- Rollback:
--   ALTER TABLE public.employee_contracts DROP COLUMN IF EXISTS compensation_package_id;
--   DROP TABLE IF EXISTS public.employee_compensation_history;
--   DROP TABLE IF EXISTS public.employee_compensation_lines;
--   DROP TABLE IF EXISTS public.employee_compensation_packages;

BEGIN;

CREATE TABLE IF NOT EXISTS public.employee_compensation_packages (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  contract_id UUID NULL REFERENCES public.employee_contracts (id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  supersedes_package_id UUID NULL REFERENCES public.employee_compensation_packages (id) ON DELETE SET NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  change_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_comp_package_date_range CHECK (
    effective_to IS NULL OR effective_from <= effective_to
  ),
  CONSTRAINT chk_comp_package_version CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS public.employee_compensation_lines (
  id UUID PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.employee_compensation_packages (id) ON DELETE CASCADE,
  line_type TEXT NOT NULL,
  amount NUMERIC(18, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  allowance_code TEXT NULL,
  taxable BOOLEAN NOT NULL DEFAULT TRUE,
  note TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_comp_line_type CHECK (line_type IN ('base', 'probation', 'allowance')),
  CONSTRAINT chk_comp_line_amount CHECK (amount >= 0),
  CONSTRAINT chk_comp_line_allowance_code CHECK (
    (line_type = 'allowance' AND allowance_code IS NOT NULL AND length(trim(allowance_code)) > 0)
    OR (line_type <> 'allowance' AND allowance_code IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.employee_compensation_history (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  employee_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.employee_compensation_packages (id) ON DELETE CASCADE,
  previous_package_id UUID NULL,
  version INTEGER NOT NULL,
  change_reason TEXT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS compensation_package_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employee_contracts_compensation_package'
  ) THEN
    ALTER TABLE public.employee_contracts
      ADD CONSTRAINT fk_employee_contracts_compensation_package
      FOREIGN KEY (compensation_package_id)
      REFERENCES public.employee_compensation_packages (id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comp_packages_employee_effective
  ON public.employee_compensation_packages (company_id, employee_id, effective_from DESC);

CREATE INDEX IF NOT EXISTS idx_comp_packages_contract
  ON public.employee_compensation_packages (contract_id)
  WHERE contract_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comp_lines_package
  ON public.employee_compensation_lines (package_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_comp_history_employee
  ON public.employee_compensation_history (company_id, employee_id, created_at DESC);

COMMIT;
