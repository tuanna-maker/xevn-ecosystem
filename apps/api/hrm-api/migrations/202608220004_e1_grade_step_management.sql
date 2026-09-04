-- ============================================================
-- Migration 004: E1 — Grade-Step Management
-- WorkItem: HRM-POLICY-E1-01
-- Tables: pay_grade_definitions, pay_grade_steps,
--         employee_grade_assignments
-- Idempotent: IF NOT EXISTS on table + every index.
-- Plane A/B doctrine: tenant_id TEXT, no FK cross-plane.
-- Soft-delete: deleted_at TIMESTAMPTZ NULL.
-- Money: BIGINT (VND integer).
-- ============================================================

-- §1: Grade definition table (versioned per QD)
CREATE TABLE IF NOT EXISTS pay_grade_definitions (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  grade_code      TEXT          NOT NULL,
  grade_name      TEXT          NOT NULL DEFAULT '',
  effective_from  DATE          NOT NULL,
  effective_to    DATE          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_by      TEXT          NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_grade_def_period
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_grade_def_tenant_code
  ON pay_grade_definitions (tenant_id, grade_code)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_grade_def_tenant_active_date
  ON pay_grade_definitions (tenant_id, grade_code, effective_from DESC)
  WHERE deleted_at IS NULL AND effective_to IS NULL;

-- §2: Step table — bac luong trong ngach
CREATE TABLE IF NOT EXISTS pay_grade_steps (
  id              BIGSERIAL     PRIMARY KEY,
  grade_def_id    BIGINT        NOT NULL,
  step_number     SMALLINT      NOT NULL,
  monthly_salary  BIGINT        NOT NULL,
  CONSTRAINT chk_grade_step_number   CHECK (step_number BETWEEN 1 AND 9),
  CONSTRAINT chk_grade_salary_pos    CHECK (monthly_salary > 0),
  CONSTRAINT uq_grade_step           UNIQUE (grade_def_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_grade_steps_def
  ON pay_grade_steps (grade_def_id, step_number);

-- §3: Employee grade assignment history
CREATE TABLE IF NOT EXISTS employee_grade_assignments (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  employee_id     TEXT          NOT NULL,
  grade_def_id    BIGINT        NOT NULL,
  step_number     SMALLINT      NOT NULL CHECK (step_number BETWEEN 1 AND 9),
  effective_from  DATE          NOT NULL,
  reason          TEXT          NULL,
  approved_by     TEXT          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
  -- No deleted_at: assignment history is immutable; superseded by newer record
);

-- Most recent assignment lookup (used by payroll batch)
CREATE INDEX IF NOT EXISTS idx_emp_grade_assign_lookup
  ON employee_grade_assignments (tenant_id, employee_id, effective_from DESC);

-- §4: Grade promotion requests (workflow integration)
CREATE TABLE IF NOT EXISTS grade_promotion_requests (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  employee_id     TEXT          NOT NULL,
  current_grade_def_id  BIGINT  NOT NULL,
  current_step    SMALLINT      NOT NULL,
  proposed_step   SMALLINT      NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'DRAFT',
  workflow_instance_id  TEXT    NULL,
  requested_by    TEXT          NOT NULL DEFAULT '',
  approved_by     TEXT          NULL,
  approved_at     TIMESTAMPTZ   NULL,
  reject_reason   TEXT          NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_promo_status CHECK (
    status IN ('DRAFT','PENDING_L1','PENDING_L2','APPROVED','REJECTED','CANCELLED')
  ),
  CONSTRAINT chk_promo_step CHECK (proposed_step = current_step + 1)
);

CREATE INDEX IF NOT EXISTS idx_grade_promo_employee
  ON grade_promotion_requests (tenant_id, employee_id, status)
  WHERE deleted_at IS NULL;
