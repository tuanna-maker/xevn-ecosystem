-- @CODE-MEMORY WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01
-- Plane A/B: HRM DB only. No cross-plane FK. tenant_id = TEXT DEFAULT.
-- Soft-delete only (deleted_at). Hard-delete forbidden.

CREATE TABLE IF NOT EXISTS template_clause_override (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  template_code   TEXT NOT NULL,
  clause_id       TEXT NOT NULL,
  override_text   TEXT,
  source          TEXT NOT NULL,
  updated_by      TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, template_code, clause_id)
);

CREATE INDEX IF NOT EXISTS ix_tco_tenant_id ON template_clause_override (tenant_id);
