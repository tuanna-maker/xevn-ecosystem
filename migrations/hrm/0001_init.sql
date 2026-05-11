-- HRM baseline migration
-- Target database: xevn_hrm

BEGIN;

CREATE TABLE IF NOT EXISTS public.synced_catalogs (
  id BIGSERIAL PRIMARY KEY,
  catalog_key TEXT NOT NULL UNIQUE,
  source_system TEXT NOT NULL,
  payload JSONB NOT NULL,
  version INT NOT NULL DEFAULT 1,
  checksum TEXT NOT NULL DEFAULT '',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_synced_catalogs_synced_at
  ON public.synced_catalogs (synced_at DESC);

CREATE TABLE IF NOT EXISTS public.sync_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  catalog_key TEXT NOT NULL,
  source_system TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_audit_logs_catalog_key
  ON public.sync_audit_logs (catalog_key);

COMMIT;
