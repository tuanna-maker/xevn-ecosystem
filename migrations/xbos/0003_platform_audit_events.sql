-- Unified platform audit stream (NFR P1.5)
CREATE TABLE IF NOT EXISTS platform_audit_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor TEXT,
  tenant_id TEXT,
  company_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  request_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_events_tenant ON platform_audit_events (tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_events_request ON platform_audit_events (request_id);
