-- ============================================================
-- Migration 010: E2 — Policy Engine Core Tables
-- WorkItem: HRM-POLICY-E2-01
-- Tables: pay_policies, pay_income_components, pay_policy_assignments
-- Idempotent: IF NOT EXISTS. Soft-delete. BIGINT money. TEXT tenant_id.
-- ============================================================

-- §1: Policy definitions (versioned per QĐ)
CREATE TABLE IF NOT EXISTS public.pay_policies (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  name            TEXT          NOT NULL,
  pay_group_code  TEXT          NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'DRAFT',
  version         SMALLINT      NOT NULL DEFAULT 1,
  effective_from  DATE          NOT NULL,
  effective_to    DATE          NULL,
  description     TEXT          NULL,
  cloned_from_id  BIGINT        NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_by      TEXT          NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_policy_status CHECK (
    status IN ('DRAFT','ACTIVE','ARCHIVED','SUPERSEDED')
  ),
  CONSTRAINT chk_policy_period
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_pay_policies_tenant_group
  ON public.pay_policies (tenant_id, pay_group_code, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pay_policies_tenant_active
  ON public.pay_policies (tenant_id, effective_from DESC)
  WHERE deleted_at IS NULL AND status = 'ACTIVE';

-- §2: Income components (per policy)
CREATE TABLE IF NOT EXISTS public.pay_income_components (
  id              BIGSERIAL     PRIMARY KEY,
  policy_id       BIGINT        NOT NULL,
  component_type  TEXT          NOT NULL,
  name            TEXT          NOT NULL,
  sort_order      SMALLINT      NOT NULL DEFAULT 100,
  is_deduction    BOOLEAN       NOT NULL DEFAULT false,
  input_source    TEXT          NOT NULL DEFAULT 'system',
  effective_from  DATE          NULL,
  effective_to    DATE          NULL,
  params          JSONB         NOT NULL DEFAULT '{}',
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL
);

CREATE INDEX IF NOT EXISTS idx_income_comp_policy
  ON public.pay_income_components (policy_id, sort_order)
  WHERE deleted_at IS NULL;

-- §3: Employee → Policy assignments
CREATE TABLE IF NOT EXISTS public.pay_policy_assignments (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  employee_id     TEXT          NOT NULL,
  policy_id       BIGINT        NOT NULL,
  effective_from  DATE          NOT NULL,
  effective_to    DATE          NULL,
  reason          TEXT          NULL,
  assigned_by     TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL
);

CREATE INDEX IF NOT EXISTS idx_policy_assign_lookup
  ON public.pay_policy_assignments (tenant_id, employee_id, effective_from DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- Migration 011: E4 — Payroll Batch Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payroll_batches (
  id              TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  period_month    DATE          NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'PENDING',
  employee_count  INTEGER       NOT NULL DEFAULT 0,
  total_gross_vnd BIGINT        NULL,
  total_net_vnd   BIGINT        NULL,
  started_at      TIMESTAMPTZ   NULL,
  completed_at    TIMESTAMPTZ   NULL,
  run_by          TEXT          NOT NULL DEFAULT '',
  approved_by     TEXT          NULL,
  approved_at     TIMESTAMPTZ   NULL,
  locked_at       TIMESTAMPTZ   NULL,
  error_log       JSONB         NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_batch_status CHECK (
    status IN ('PENDING','RUNNING','COMPLETED','APPROVED','LOCKED','FAILED')
  )
);

CREATE INDEX IF NOT EXISTS idx_payroll_batch_period
  ON public.payroll_batches (tenant_id, period_month, status)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.payroll_records (
  id              BIGSERIAL     PRIMARY KEY,
  batch_id        TEXT          NOT NULL,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  employee_id     TEXT          NOT NULL,
  period_month    DATE          NOT NULL,
  policy_id       BIGINT        NULL,
  policy_snapshot JSONB         NULL,
  components      JSONB         NOT NULL DEFAULT '[]',
  gross_vnd       BIGINT        NOT NULL DEFAULT 0,
  net_vnd         BIGINT        NOT NULL DEFAULT 0,
  status          TEXT          NOT NULL DEFAULT 'DRAFT',
  warnings        JSONB         NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_record_status CHECK (
    status IN ('DRAFT','APPROVED','LOCKED','ERROR')
  )
);

CREATE INDEX IF NOT EXISTS idx_payroll_record_batch
  ON public.payroll_records (batch_id, employee_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payroll_record_employee_period
  ON public.payroll_records (tenant_id, employee_id, period_month DESC)
  WHERE deleted_at IS NULL;
