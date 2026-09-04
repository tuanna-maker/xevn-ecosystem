-- ============================================================
-- Migration 002: E0 — Employee Extension
-- WorkItem: HRM-POLICY-E0-02
-- Adds: grade_code, step_number, pay_group_code, province_code,
--       vehicle_type_code, hotline_code, is_probation, probation_end_date
-- Idempotent: ADD COLUMN IF NOT EXISTS
-- Plane A/B: tenant_id is TEXT. No FK cross-plane. Soft-delete only.
-- Money: BIGINT (VND). No float/NUMERIC.
-- ============================================================

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS grade_code          TEXT     NULL,
  ADD COLUMN IF NOT EXISTS step_number         SMALLINT NULL
    CONSTRAINT chk_emp_step_number CHECK (step_number IS NULL OR step_number BETWEEN 1 AND 9),
  ADD COLUMN IF NOT EXISTS pay_group_code      TEXT     NULL,
  ADD COLUMN IF NOT EXISTS province_code       TEXT     NULL,
  ADD COLUMN IF NOT EXISTS vehicle_type_code   TEXT     NULL,
  ADD COLUMN IF NOT EXISTS hotline_code        TEXT     NULL,
  ADD COLUMN IF NOT EXISTS is_probation        BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS probation_end_date  DATE     NULL;

CREATE INDEX IF NOT EXISTS idx_employees_pay_group
  ON employees (tenant_id, pay_group_code)
  WHERE deleted_at IS NULL AND pay_group_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employees_province
  ON employees (tenant_id, province_code)
  WHERE deleted_at IS NULL AND province_code IS NOT NULL;

-- ============================================================
-- Migration 003: E0 — Attendance Extension
-- WorkItem: HRM-POLICY-E0-03
-- Adds: shift_type_code, is_sunday, is_weekend
-- ============================================================

ALTER TABLE attendance_records
  ADD COLUMN IF NOT EXISTS shift_type_code  TEXT    NULL,
  ADD COLUMN IF NOT EXISTS is_sunday        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_weekend       BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_att_emp_sunday
  ON attendance_records (tenant_id, employee_id, is_sunday)
  WHERE deleted_at IS NULL AND is_sunday = true;

CREATE INDEX IF NOT EXISTS idx_att_emp_shift
  ON attendance_records (tenant_id, employee_id, shift_type_code)
  WHERE deleted_at IS NULL;
