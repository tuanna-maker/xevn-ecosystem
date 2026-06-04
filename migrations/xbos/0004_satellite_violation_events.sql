-- UC-XBOS-07 satellite violation ingest (P1-S1-BE-04)
CREATE TABLE IF NOT EXISTS public.xbos_satellite_violations (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NULL,
  module_code TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  entity_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  rule_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  metric_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id TEXT NOT NULL,
  summary TEXT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, correlation_id)
);

CREATE INDEX IF NOT EXISTS idx_xbos_satellite_violations_tenant_time
  ON public.xbos_satellite_violations (tenant_id, occurred_at DESC);
