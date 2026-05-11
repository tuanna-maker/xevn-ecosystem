-- Master Asset Registry wave 1 foundation
-- Target database: xevn_xbos

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.asset_registry (
  id BIGSERIAL PRIMARY KEY,
  asset_id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  asset_code TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  vin TEXT NULL,
  chassis_no TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  owner_module TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL DEFAULT 'system',
  updated_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id),
  UNIQUE (tenant_id, company_id, asset_code)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_registry_tenant_company_vin
  ON public.asset_registry (tenant_id, company_id, vin)
  WHERE vin IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_registry_tenant_company_chassis
  ON public.asset_registry (tenant_id, company_id, chassis_no)
  WHERE chassis_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_asset_registry_scope
  ON public.asset_registry (tenant_id, company_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.asset_ownership_map (
  id BIGSERIAL PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.asset_registry(asset_id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  owner_module TEXT NOT NULL,
  mutable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_asset_ownership_map_asset
  ON public.asset_ownership_map (asset_id, owner_module);

CREATE TABLE IF NOT EXISTS public.asset_financial_profile (
  id BIGSERIAL PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.asset_registry(asset_id) ON DELETE CASCADE,
  depreciation_method TEXT NOT NULL DEFAULT 'straight_line',
  useful_life_months INT NULL,
  acquisition_cost NUMERIC(18, 2) NULL,
  residual_value NUMERIC(18, 2) NULL,
  monthly_loan_interest NUMERIC(18, 2) NULL,
  monthly_principal_payment NUMERIC(18, 2) NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'VND',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id)
);

CREATE TABLE IF NOT EXISTS public.asset_lifecycle_audit (
  id BIGSERIAL PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.asset_registry(asset_id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_module TEXT NOT NULL,
  actor_id TEXT NOT NULL DEFAULT 'system',
  request_id TEXT NULL,
  before_payload JSONB NULL,
  after_payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_audit_asset
  ON public.asset_lifecycle_audit (asset_id, created_at DESC);

COMMIT;
