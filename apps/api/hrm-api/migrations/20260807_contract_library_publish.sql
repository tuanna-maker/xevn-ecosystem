-- PO-HRM-CONTRACT-LEGAL-PRINT-BE-03 (SoT)
-- Alias: PM DATA-02 next_dispatch labeled BE-02 for this slice — PDF binary remains separate BE-02 evidence
-- ADD: hrm_contract_library_publishes · hrm_contract_library_pull_audits
-- EXPAND: lineage on templates · clauses · pack_rules
-- Runtime mirror: ContractLegalPrintService.ensureSchema
-- must_keep: print_versions · DATA-01 spine · no synced_catalogs dual-write

-- 1) Publish registry (immutable payload per version)
CREATE TABLE IF NOT EXISTS public.hrm_contract_library_publishes (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_company_id TEXT NOT NULL DEFAULT 'holding',
  publish_version INT NOT NULL,
  checksum TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  label_vi TEXT NULL,
  template_count INT NOT NULL DEFAULT 0,
  clause_count INT NOT NULL DEFAULT 0,
  pack_rule_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by TEXT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hrm_ctr_lib_pub_status CHECK (status IN ('published', 'retired')),
  CONSTRAINT uq_hrm_ctr_lib_pub_tenant_version UNIQUE (tenant_id, publish_version)
);

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pub_tenant_status_ver
  ON public.hrm_contract_library_publishes (tenant_id, status, publish_version DESC);

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pub_tenant_active
  ON public.hrm_contract_library_publishes (tenant_id, archived_at)
  WHERE archived_at IS NULL;

-- 2) Pull audit (append-only preferred)
CREATE TABLE IF NOT EXISTS public.hrm_contract_library_pull_audits (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  publish_version INT NOT NULL,
  publish_id UUID NULL,
  force BOOLEAN NOT NULL DEFAULT FALSE,
  pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pulled_by TEXT NULL,
  result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  archived_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pull_company_at
  ON public.hrm_contract_library_pull_audits (company_id, pulled_at DESC);

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pull_company_ver
  ON public.hrm_contract_library_pull_audits (company_id, publish_version);

-- 3) Lineage EXPAND (templates / clauses / pack_rules)
ALTER TABLE public.hrm_contract_templates
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS origin_company_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS origin_publish_version INT NULL,
  ADD COLUMN IF NOT EXISTS lineage_code TEXT NULL;

ALTER TABLE public.hrm_contract_clauses
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS origin_company_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS origin_publish_version INT NULL,
  ADD COLUMN IF NOT EXISTS lineage_code TEXT NULL;

ALTER TABLE public.hrm_contract_pack_rules
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS origin_company_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS origin_publish_version INT NULL,
  ADD COLUMN IF NOT EXISTS lineage_code TEXT NULL;

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_tpl_lineage
  ON public.hrm_contract_templates (company_id, lineage_code)
  WHERE lineage_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_tpl_origin_ver
  ON public.hrm_contract_templates (company_id, origin, origin_publish_version);

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_cl_lineage
  ON public.hrm_contract_clauses (company_id, lineage_code)
  WHERE lineage_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_cl_origin_ver
  ON public.hrm_contract_clauses (company_id, origin, origin_publish_version);

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_pr_lineage
  ON public.hrm_contract_pack_rules (company_id, lineage_code)
  WHERE lineage_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_hrm_ctr_pr_origin_ver
  ON public.hrm_contract_pack_rules (company_id, origin, origin_publish_version);
