-- Registry: FE + BE + DB + E2E pass per capability (QC gate source of truth)
CREATE TABLE IF NOT EXISTS public.xevn_ecosystem_capabilities (
  capability_code TEXT PRIMARY KEY,
  module_code TEXT NOT NULL,
  feature_name_vi TEXT NOT NULL,
  route_or_entry TEXT NULL,
  srs_ref TEXT NULL,
  fe_status TEXT NOT NULL DEFAULT 'none'
    CHECK (fe_status IN ('none', 'partial', 'done')),
  be_status TEXT NOT NULL DEFAULT 'none'
    CHECK (be_status IN ('none', 'partial', 'done')),
  db_status TEXT NOT NULL DEFAULT 'none'
    CHECK (db_status IN ('none', 'partial', 'done')),
  e2e_pass BOOLEAN NOT NULL DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ NULL,
  last_verified_by TEXT NULL,
  evidence_path TEXT NULL,
  qa_notes TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xevn_ecosystem_capabilities_module
  ON public.xevn_ecosystem_capabilities (module_code, e2e_pass);
