-- PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
-- ADD: templates · clauses · template_clauses (DnD order) · print_versions · pack_rules
-- EXPAND: employee_contracts print overlay + archived_at
-- Soft-delete only · NO copyrighted UNICOM body · U65 zero-seed
-- Runtime mirror: ContractLegalPrintService.ensureSchema + ContractsInsuranceService.ensureSchema

-- 1) Templates
CREATE TABLE IF NOT EXISTS public.hrm_contract_templates (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  pack_code TEXT NOT NULL,
  layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  keyword_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  version INT NOT NULL DEFAULT 1,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NULL,
  updated_by TEXT NULL,
  CONSTRAINT chk_hrm_contract_tpl_status CHECK (status IN ('draft', 'active', 'retired')),
  CONSTRAINT chk_hrm_contract_tpl_pack CHECK (pack_code IN ('GENERAL', 'IT_OFFICE', 'DRIVER', 'LOGISTICS'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_contract_templates_company_code_active
  ON public.hrm_contract_templates (company_id, lower(code))
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_hrm_contract_templates_company_status
  ON public.hrm_contract_templates (company_id, status);

CREATE INDEX IF NOT EXISTS ix_hrm_contract_templates_company_pack
  ON public.hrm_contract_templates (company_id, pack_code);

-- 2) Clause library (LEGAL_BASIS = clause_group; versioned)
CREATE TABLE IF NOT EXISTS public.hrm_contract_clauses (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  body_vi TEXT NOT NULL,
  clause_group TEXT NOT NULL,
  apply_to_packs TEXT[] NOT NULL DEFAULT ARRAY['*']::text[],
  sort_order INT NOT NULL DEFAULT 0,
  mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft',
  version INT NOT NULL DEFAULT 1,
  effective_from DATE NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NULL,
  updated_by TEXT NULL,
  CONSTRAINT chk_hrm_contract_cl_status CHECK (status IN ('draft', 'active', 'retired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_contract_clauses_company_code_active
  ON public.hrm_contract_clauses (company_id, lower(code))
  WHERE status = 'active' AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_hrm_contract_clauses_company_group
  ON public.hrm_contract_clauses (company_id, clause_group);

CREATE INDEX IF NOT EXISTS ix_hrm_contract_clauses_company_status
  ON public.hrm_contract_clauses (company_id, status);

-- 3) Template ↔ clauses ordered join (FE DnD)
CREATE TABLE IF NOT EXISTS public.hrm_contract_template_clauses (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL,
  clause_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hrm_contract_tpl_clause UNIQUE (template_id, clause_id)
);

CREATE INDEX IF NOT EXISTS ix_hrm_contract_tpl_clauses_order
  ON public.hrm_contract_template_clauses (template_id, sort_order);

-- 4) Print versions (snapshot spine)
CREATE TABLE IF NOT EXISTS public.hrm_contract_print_versions (
  id UUID PRIMARY KEY,
  contract_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  version_no INT NOT NULL,
  pack_code TEXT NOT NULL,
  template_id UUID NULL,
  template_version INT NULL,
  merged_fields_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  clauses_snapshot_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  compensation_snapshot_json JSONB NULL,
  status TEXT NOT NULL DEFAULT 'draft_preview',
  issued_at TIMESTAMPTZ NULL,
  issued_by TEXT NULL,
  pdf_artifact_ref TEXT NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hrm_contract_pv_status CHECK (status IN ('draft_preview', 'issued', 'superseded')),
  CONSTRAINT uq_hrm_contract_pv_contract_ver UNIQUE (contract_id, version_no)
);

CREATE INDEX IF NOT EXISTS ix_hrm_contract_pv_company_contract
  ON public.hrm_contract_print_versions (company_id, contract_id);

CREATE INDEX IF NOT EXISTS ix_hrm_contract_pv_contract_status
  ON public.hrm_contract_print_versions (contract_id, status);

-- 5) Pack rules (≠ rec_jd_pack_rule)
CREATE TABLE IF NOT EXISTS public.hrm_contract_pack_rules (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  match_type TEXT NOT NULL,
  match_value TEXT NULL,
  pack_code TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hrm_contract_pack_match CHECK (match_type IN ('job_family', 'fallback')),
  CONSTRAINT chk_hrm_contract_pack_status CHECK (status IN ('active', 'retired')),
  CONSTRAINT chk_hrm_contract_pack_code CHECK (pack_code IN ('GENERAL', 'IT_OFFICE', 'DRIVER', 'LOGISTICS'))
);

CREATE INDEX IF NOT EXISTS ix_hrm_contract_pack_rules_company
  ON public.hrm_contract_pack_rules (company_id, match_type, priority);

-- 6) EXPAND employee_contracts (ADD-only)
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS signed_at DATE NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS work_location TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS work_location_scope TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS pack_code TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS template_id UUID NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS term_type TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS job_description_text TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS probation_days INT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS probation_end DATE NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS license_class TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS vehicle_plate TEXT NULL;
ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS route_or_region TEXT NULL;

CREATE INDEX IF NOT EXISTS ix_employee_contracts_employee_status
  ON public.employee_contracts (employee_id, status);

CREATE INDEX IF NOT EXISTS ix_employee_contracts_company_pack
  ON public.employee_contracts (company_id, pack_code)
  WHERE pack_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_contracts_company_code_active
  ON public.employee_contracts (company_id, lower(contract_code))
  WHERE contract_code IS NOT NULL AND archived_at IS NULL;
