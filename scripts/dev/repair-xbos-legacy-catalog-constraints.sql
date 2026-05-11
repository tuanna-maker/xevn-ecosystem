-- Repair legacy XBOS catalog constraints for multi-tenant scope.
-- Safe to rerun in local/dev environments.

BEGIN;

ALTER TABLE IF EXISTS public.config_catalogs
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'xevn';
ALTER TABLE IF EXISTS public.config_catalogs
  ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT 'holding';

ALTER TABLE IF EXISTS public.config_catalog_items
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'xevn';
ALTER TABLE IF EXISTS public.config_catalog_items
  ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT 'holding';

DO $$
DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN (
      SELECT kcu.constraint_name, array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
      FROM information_schema.key_column_usage kcu
      WHERE kcu.table_schema = 'public' AND kcu.table_name = 'config_catalogs'
      GROUP BY kcu.constraint_name
    ) cols ON cols.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'config_catalogs'
      AND tc.constraint_type = 'UNIQUE'
      AND cols.columns = ARRAY['catalog_key']
  LOOP
    EXECUTE format('ALTER TABLE public.config_catalogs DROP CONSTRAINT IF EXISTS %I', rec.constraint_name);
  END LOOP;
END
$$;

DO $$
DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN (
      SELECT kcu.constraint_name, array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
      FROM information_schema.key_column_usage kcu
      WHERE kcu.table_schema = 'public' AND kcu.table_name = 'config_catalog_items'
      GROUP BY kcu.constraint_name
    ) cols ON cols.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'config_catalog_items'
      AND tc.constraint_type = 'UNIQUE'
      AND cols.columns = ARRAY['catalog_key', 'code']
  LOOP
    EXECUTE format('ALTER TABLE public.config_catalog_items DROP CONSTRAINT IF EXISTS %I', rec.constraint_name);
  END LOOP;
END
$$;

DROP INDEX IF EXISTS public.config_catalogs_catalog_key_key;
DROP INDEX IF EXISTS public.config_catalog_items_catalog_key_code_key;

UPDATE public.config_catalogs
SET
  tenant_id = LOWER(BTRIM(COALESCE(NULLIF(tenant_id, ''), 'xevn'))),
  company_id = LOWER(BTRIM(COALESCE(NULLIF(company_id, ''), 'holding'))),
  catalog_key = LOWER(BTRIM(catalog_key)),
  assigned_systems = COALESCE(assigned_systems, '[]'::jsonb)
WHERE TRUE;

UPDATE public.config_catalog_items
SET
  tenant_id = LOWER(BTRIM(COALESCE(NULLIF(tenant_id, ''), 'xevn'))),
  company_id = LOWER(BTRIM(COALESCE(NULLIF(company_id, ''), 'holding'))),
  catalog_key = LOWER(BTRIM(catalog_key)),
  code = BTRIM(code),
  label = BTRIM(label)
WHERE TRUE;

WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_id, company_id, catalog_key
      ORDER BY version DESC, updated_at DESC, id DESC
    ) AS rn
  FROM public.config_catalogs
)
DELETE FROM public.config_catalogs c
USING ranked r
WHERE c.id = r.id AND r.rn > 1;

WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_id, company_id, catalog_key, code
      ORDER BY id DESC
    ) AS rn
  FROM public.config_catalog_items
)
DELETE FROM public.config_catalog_items i
USING ranked r
WHERE i.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_config_catalogs_scope_key
ON public.config_catalogs (tenant_id, company_id, catalog_key);

CREATE UNIQUE INDEX IF NOT EXISTS uq_config_catalog_items_scope_key_code
ON public.config_catalog_items (tenant_id, company_id, catalog_key, code);

COMMIT;
