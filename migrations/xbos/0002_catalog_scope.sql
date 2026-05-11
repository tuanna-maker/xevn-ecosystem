-- XBOS catalog scope migration
-- Add tenant/company scoping for multi-company isolation.

BEGIN;

ALTER TABLE public.config_catalogs
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'xevn';

ALTER TABLE public.config_catalogs
  ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT 'holding';

ALTER TABLE public.config_catalogs
  DROP CONSTRAINT IF EXISTS config_catalogs_catalog_key_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_config_catalogs_scope_key
  ON public.config_catalogs (tenant_id, company_id, catalog_key);

COMMIT;
