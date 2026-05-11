-- HRM synced catalog scope migration
-- Add tenant/company scoping for per-company catalog isolation.

BEGIN;

ALTER TABLE public.synced_catalogs
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'xevn';

ALTER TABLE public.synced_catalogs
  ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT 'holding';

ALTER TABLE public.synced_catalogs
  DROP CONSTRAINT IF EXISTS synced_catalogs_catalog_key_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_synced_catalogs_scope_key
  ON public.synced_catalogs (tenant_id, company_id, catalog_key);

COMMIT;
