-- WI: HRM-MVP-GD1-PAY-09-CLUSTER-01 (dev-be)
-- Contract: docs/program/specs/PO-HRM-MVP-GD1-PAY-09-DATA-01.md §3–§5
-- Table:    pay_payroll_group (batch write-side anchor for PAY-09)
--
-- Idempotent: IF NOT EXISTS on table + every index, so re-running the
-- migration (or ensureSchema) is a safe no-op.
--
-- Plane A/B doctrine (feedback_plane-ab-doctrine.md):
--   * tenant_id / company_id are TEXT DEFAULT ''  -- NOT UUID, NOT FK.
--   * HRM DB has NO FK cross-plane to XBOS. No REFERENCES added here.
--   * Soft-delete only: deleted_at TIMESTAMPTZ NULL. Hard-delete forbidden.
--   * Money columns are BIGINT (VND integer). No float, no NUMERIC(19,2).
--
-- State machine (§5): DRAFT -> ACTIVE -> APPROVED -> EXPORTED (terminal);
-- CANCELLED (terminal). No state returns to DRAFT.

CREATE TABLE IF NOT EXISTS public.pay_payroll_group (
  id                      BIGSERIAL       PRIMARY KEY,
  tenant_id               TEXT            NOT NULL DEFAULT '',
  company_id              TEXT            NOT NULL DEFAULT '',

  code                    TEXT            NOT NULL,
  name                    TEXT            NOT NULL DEFAULT '',
  pay_cycle_code          TEXT            NOT NULL DEFAULT '',
  period_from             DATE            NOT NULL,
  period_to               DATE            NOT NULL,

  status                  TEXT            NOT NULL DEFAULT 'DRAFT',
  locked_at               TIMESTAMPTZ     NULL,
  approved_by             TEXT            NULL,
  approved_at             TIMESTAMPTZ     NULL,
  exported_at             TIMESTAMPTZ     NULL,

  total_employee_count    INTEGER         NOT NULL DEFAULT 0,
  total_gross_vnd         BIGINT          NOT NULL DEFAULT 0,
  total_net_vnd           BIGINT          NOT NULL DEFAULT 0,

  created_by              TEXT            NOT NULL DEFAULT '',
  created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_by              TEXT            NOT NULL DEFAULT '',
  updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
  deleted_at              TIMESTAMPTZ     NULL,

  CONSTRAINT chk_pay_payroll_group_status
    CHECK (status IN ('DRAFT', 'ACTIVE', 'APPROVED', 'EXPORTED', 'CANCELLED')),
  CONSTRAINT chk_pay_payroll_group_period
    CHECK (period_to >= period_from)
);

-- §4 index 1: tenant+company list, newest first, status-filtered.
CREATE INDEX IF NOT EXISTS idx_pay_payroll_group_tenant_company_status
  ON public.pay_payroll_group (tenant_id, company_id, status, created_at DESC);

-- §4 index 2: open-group overlap probe on (tenant, company, period window).
CREATE INDEX IF NOT EXISTS idx_pay_payroll_group_period
  ON public.pay_payroll_group (tenant_id, company_id, period_from, period_to);

-- §4 index 3: active-row-only lookups (partial, excludes soft-deleted).
CREATE INDEX IF NOT EXISTS idx_pay_payroll_group_deleted
  ON public.pay_payroll_group (tenant_id, company_id)
  WHERE deleted_at IS NULL;

-- §3 note: code uniqueness is scoped by (tenant_id, company_id, deleted_at) so a
-- soft-deleted code can be reused. Production form = partial unique index on
-- deleted_at IS NULL (a plain UNIQUE(deleted_at) would block reuse).
CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_payroll_group_tenant_company_code_active
  ON public.pay_payroll_group (tenant_id, company_id, code)
  WHERE deleted_at IS NULL;