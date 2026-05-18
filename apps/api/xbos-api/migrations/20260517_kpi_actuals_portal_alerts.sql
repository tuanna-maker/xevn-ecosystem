-- P2b: KPI time-series rollup + portal alerts (optional aggregation layer)

CREATE TABLE IF NOT EXISTS public.xbos_kpi_actuals (
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  metric_code TEXT NOT NULL,
  period_date DATE NOT NULL,
  actual_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, company_id, metric_code, period_date)
);

CREATE INDEX IF NOT EXISTS idx_xbos_kpi_actuals_scope
  ON public.xbos_kpi_actuals (tenant_id, company_id, period_date DESC);

CREATE TABLE IF NOT EXISTS public.xbos_portal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  company_id TEXT NULL,
  module_code TEXT NOT NULL DEFAULT 'system',
  level TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  detail TEXT NULL,
  source_system TEXT NOT NULL DEFAULT 'xbos',
  source_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_xbos_portal_alerts_tenant
  ON public.xbos_portal_alerts (tenant_id, created_at DESC);
