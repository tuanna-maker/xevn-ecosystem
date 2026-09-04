-- ============================================================
-- Migration 006: E3 — Input Data Hub
-- WorkItem: HRM-POLICY-E3-01
-- Tables: pay_input_imports, pay_input_rows
-- Idempotent: IF NOT EXISTS on table + every index.
-- Plane A/B doctrine: no FK cross-plane. Soft-delete only.
-- ============================================================

-- §1: Import batch (one per period+type+version)
CREATE TABLE IF NOT EXISTS pay_input_imports (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  period_month    DATE          NOT NULL,         -- First day of month
  input_type      TEXT          NOT NULL,
  version         SMALLINT      NOT NULL DEFAULT 1,
  status          TEXT          NOT NULL DEFAULT 'PENDING',
  file_url        TEXT          NULL,
  file_name       TEXT          NULL,
  total_rows      INTEGER       NOT NULL DEFAULT 0,
  error_rows      INTEGER       NOT NULL DEFAULT 0,
  uploaded_by     TEXT          NOT NULL DEFAULT '',
  validated_at    TIMESTAMPTZ   NULL,
  approved_by     TEXT          NULL,
  approved_at     TIMESTAMPTZ   NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_import_status CHECK (
    status IN ('PENDING','VALIDATED','APPROVED','ERROR','SUPERSEDED')
  ),
  CONSTRAINT chk_import_type CHECK (
    input_type IN (
      'TRIP_LOG', 'REVENUE_CLDV', 'MAINTENANCE_COST',
      'FREIGHT_REVENUE', 'DPHH_REVENUE', 'HOTLINE_STATS', 'BRANCH_STATS'
    )
  )
);

-- Active import lookup per period+type (for payroll batch pre-check)
CREATE INDEX IF NOT EXISTS idx_pay_input_import_period_type
  ON pay_input_imports (tenant_id, period_month, input_type, status)
  WHERE deleted_at IS NULL;

-- Version deduplication: latest version per period+type
CREATE INDEX IF NOT EXISTS idx_pay_input_import_version
  ON pay_input_imports (tenant_id, period_month, input_type, version DESC)
  WHERE deleted_at IS NULL;

-- §2: Import rows (raw data, per employee per import)
CREATE TABLE IF NOT EXISTS pay_input_rows (
  id                BIGSERIAL     PRIMARY KEY,
  import_id         BIGINT        NOT NULL,
  employee_id       TEXT          NULL,           -- Resolved after validate
  raw_employee_ref  TEXT          NOT NULL,       -- Raw name/code from Excel
  row_number        INTEGER       NOT NULL,       -- Row in uploaded Excel (for UX)
  data              JSONB         NOT NULL DEFAULT '{}',
  row_status        TEXT          NOT NULL DEFAULT 'OK',
  error_message     TEXT          NULL,
  overridden_by     TEXT          NULL,
  overridden_at     TIMESTAMPTZ   NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_row_status CHECK (
    row_status IN ('OK','ERROR','WARNING','OVERRIDDEN')
  )
);

-- Batch lookup for payroll: all OK rows for period + type
CREATE INDEX IF NOT EXISTS idx_pay_input_rows_import_status
  ON pay_input_rows (import_id, row_status);

-- Employee data lookup: find all input for specific employee in period
CREATE INDEX IF NOT EXISTS idx_pay_input_rows_employee
  ON pay_input_rows (employee_id, import_id)
  WHERE employee_id IS NOT NULL AND row_status IN ('OK','OVERRIDDEN');
