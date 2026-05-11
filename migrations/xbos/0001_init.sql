-- XBOS baseline migration
-- Target database: xevn_xbos

BEGIN;

CREATE TABLE IF NOT EXISTS public.config_catalogs (
  id BIGSERIAL PRIMARY KEY,
  catalog_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  assigned_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  checksum TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.config_catalog_items (
  id BIGSERIAL PRIMARY KEY,
  catalog_key TEXT NOT NULL REFERENCES public.config_catalogs(catalog_key) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  unit TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE (catalog_key, code)
);

CREATE INDEX IF NOT EXISTS idx_config_catalog_items_catalog_key
  ON public.config_catalog_items (catalog_key);

CREATE TABLE IF NOT EXISTS public.catalog_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  catalog_key TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  before_payload JSONB NULL,
  after_payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_audit_logs_catalog_key
  ON public.catalog_audit_logs (catalog_key);

COMMIT;
