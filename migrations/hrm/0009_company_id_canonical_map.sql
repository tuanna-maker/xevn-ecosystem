-- Canonical company slug map for mixed TEXT/UUID company_id columns (NFR P0.6)
CREATE TABLE IF NOT EXISTS company_slug_map (
  tenant_id TEXT NOT NULL,
  company_slug TEXT NOT NULL,
  company_uuid UUID NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, company_slug)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_slug_map_uuid ON company_slug_map (tenant_id, company_uuid);

COMMENT ON TABLE company_slug_map IS 'Maps x-company-id header slugs to UUID for tables using UUID company_id';
