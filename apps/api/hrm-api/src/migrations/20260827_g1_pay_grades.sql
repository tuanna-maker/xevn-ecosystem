-- ============================================================
-- G1: Pay Grades (Ngach luong)
-- Migration: 20260827_g1_pay_grades.sql
-- Tables: pay_grades, pay_grade_definitions, pay_grade_steps
-- ============================================================

-- pay_grades: master grade record (e.g. grade code "KS1")
CREATE TABLE IF NOT EXISTS pay_grades (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL,
    code          VARCHAR(50) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ,
    created_by    UUID,
    updated_by    UUID,
    CONSTRAINT uq_pay_grades_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_pay_grades_tenant ON pay_grades(tenant_id) WHERE deleted_at IS NULL;

-- pay_grade_definitions: versioned definitions (one active per grade at a time)
CREATE TABLE IF NOT EXISTS pay_grade_definitions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    grade_id         UUID NOT NULL REFERENCES pay_grades(id),
    decision_number  VARCHAR(100),                -- So quyet dinh
    effective_from   DATE NOT NULL,
    effective_to     DATE,                        -- NULL = still active
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                     CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ,
    created_by       UUID
);

CREATE INDEX IF NOT EXISTS idx_pay_grade_defs_grade ON pay_grade_definitions(grade_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pay_grade_defs_tenant ON pay_grade_definitions(tenant_id) WHERE deleted_at IS NULL;

-- pay_grade_steps: salary steps within a definition (e.g. bac 1, bac 2, ...)
CREATE TABLE IF NOT EXISTS pay_grade_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id   UUID NOT NULL REFERENCES pay_grade_definitions(id) ON DELETE CASCADE,
    step_number     INT NOT NULL CHECK (step_number BETWEEN 1 AND 20),
    monthly_salary  NUMERIC(18,2) NOT NULL CHECK (monthly_salary > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pay_grade_steps_def_step UNIQUE (definition_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_pay_grade_steps_def ON pay_grade_steps(definition_id);

-- Comments
COMMENT ON TABLE pay_grades IS 'G1: Ngach luong master — code + name + active flag';
COMMENT ON TABLE pay_grade_definitions IS 'G1: Phien ban QD ngach luong — versioned by decision_number + effective_from';
COMMENT ON TABLE pay_grade_steps IS 'G1: Bang bac luong — salary per step within a definition';