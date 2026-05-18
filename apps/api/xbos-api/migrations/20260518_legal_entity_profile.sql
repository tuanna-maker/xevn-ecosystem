-- Command Center P0: shareholders, legal documents, permission matrix cells

CREATE TABLE IF NOT EXISTS public.xbos_legal_entity_shareholder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  legal_entity_id UUID NOT NULL REFERENCES public.xbos_legal_entity(id) ON DELETE CASCADE,
  holder_name TEXT NOT NULL,
  identity_code TEXT,
  ratio_percent NUMERIC(5, 2) DEFAULT 0,
  contributed_value NUMERIC(18, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xbos_les_entity
  ON public.xbos_legal_entity_shareholder (legal_entity_id, status);

CREATE TABLE IF NOT EXISTS public.xbos_legal_entity_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  legal_entity_id UUID NOT NULL REFERENCES public.xbos_legal_entity(id) ON DELETE CASCADE,
  document_code TEXT,
  document_name TEXT NOT NULL,
  issued_date DATE,
  expired_date DATE,
  file_url TEXT,
  storage_path TEXT,
  mime_type TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xbos_led_entity
  ON public.xbos_legal_entity_document (legal_entity_id, status);

CREATE TABLE IF NOT EXISTS public.xbos_cc_permission_matrix_cell (
  tenant_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  row_id TEXT NOT NULL,
  view BOOLEAN NOT NULL DEFAULT FALSE,
  write BOOLEAN NOT NULL DEFAULT FALSE,
  delete BOOLEAN NOT NULL DEFAULT FALSE,
  approve BOOLEAN NOT NULL DEFAULT FALSE,
  data_scope TEXT NOT NULL DEFAULT 'personal',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, role_id, row_id)
);
