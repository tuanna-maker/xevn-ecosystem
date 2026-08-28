-- ============================================================
-- G1: Pay Grades & Pay Steps (Ngach luong & Bac luong)
-- Migration: 20260827_g1_pay_grades.sql (Simplified)
-- Tables: pay_grades, pay_steps
-- ============================================================

-- pay_grades: master grade record (e.g. grade code "KS1")
CREATE TABLE IF NOT EXISTS pay_grades (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     VARCHAR(50) NOT NULL,
    code          VARCHAR(50) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ,
    created_by    VARCHAR(50),
    updated_by    VARCHAR(50),
    CONSTRAINT uq_pay_grades_tenant_code UNIQUE (tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_pay_grades_tenant ON pay_grades(tenant_id) WHERE deleted_at IS NULL;

-- pay_steps: master step record (e.g. step code "B1")
CREATE TABLE IF NOT EXISTS pay_steps (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     VARCHAR(50) NOT NULL,
    code          VARCHAR(50) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ,
    created_by    VARCHAR(50),
    updated_by    VARCHAR(50),
    CONSTRAINT uq_pay_steps_tenant_code UNIQUE (tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_pay_steps_tenant ON pay_steps(tenant_id) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pay_grades IS 'G1: Ngach luong danh muc don gian';
COMMENT ON TABLE pay_steps IS 'G1: Bac luong danh muc don gian';

-- Drop old tables if they exist
DROP TABLE IF EXISTS pay_grade_steps CASCADE;
DROP TABLE IF EXISTS pay_grade_definitions CASCADE;