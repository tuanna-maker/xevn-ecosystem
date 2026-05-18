-- RACI governance: activity catalog, ecosystem capabilities, per-company matrix
-- Idempotent reference; runtime bootstrap in RaciGovernanceSchemaService

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.raci_catalog_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  version_label TEXT NOT NULL,
  source_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, version_label)
);

CREATE TABLE IF NOT EXISTS public.raci_activity_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  catalog_version_id UUID NOT NULL REFERENCES public.raci_catalog_version(id) ON DELETE CASCADE,
  activity_code TEXT NOT NULL,
  domain_code TEXT NOT NULL,
  domain_label TEXT NOT NULL,
  seq_no INT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  default_matrix JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, catalog_version_id, activity_code)
);

CREATE INDEX IF NOT EXISTS idx_raci_activity_domain
  ON public.raci_activity_catalog (tenant_id, domain_code);

CREATE TABLE IF NOT EXISTS public.raci_ecosystem_capability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.raci_activity_catalog(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  feature_code TEXT NOT NULL,
  permission_code TEXT,
  workflow_id TEXT,
  api_route TEXT,
  raci_letter_required TEXT NOT NULL DEFAULT '*',
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, activity_id, module_code, feature_code)
);

CREATE TABLE IF NOT EXISTS public.company_raci_matrix_cell (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.raci_activity_catalog(id) ON DELETE CASCADE,
  org_column_id TEXT NOT NULL,
  raci_letters TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'company_override',
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, company_id, activity_id, org_column_id)
);

CREATE INDEX IF NOT EXISTS idx_company_raci_matrix_company
  ON public.company_raci_matrix_cell (tenant_id, company_id);

CREATE TABLE IF NOT EXISTS public.company_raci_column_binding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  org_column_id TEXT NOT NULL,
  position_template_id UUID,
  org_unit_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, company_id, org_column_id)
);

CREATE TABLE IF NOT EXISTS public.raci_matrix_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  activity_id UUID NOT NULL,
  org_column_id TEXT NOT NULL,
  old_letters TEXT,
  new_letters TEXT,
  actor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
