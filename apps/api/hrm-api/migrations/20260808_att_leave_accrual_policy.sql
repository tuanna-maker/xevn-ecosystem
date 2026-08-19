-- PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01 / DATA-01
-- Nest Option B: versioned leave accrual / balance RULE schema (bound to sealed att_leave_type).
-- FORBIDDEN: second leave-type table · Settings dual-write SoT · mega-EAV · engine LIVE · seed.
-- Soft FK leave_type_key TEXT — no hard UUID FK GĐ1. Soft-retire only (no product hard-delete).

CREATE TABLE IF NOT EXISTS public.att_leave_accrual_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  leave_type_key TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  accrual_mode TEXT NOT NULL,
  annual_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'day',
  allow_negative BOOLEAN NOT NULL DEFAULT FALSE,
  carry_over_expire_rule TEXT NULL,
  carry_cap_days NUMERIC(6, 2) NULL,
  max_balance_days NUMERIC(6, 2) NULL,
  metadata_json JSONB NULL,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NULL,
  updated_by UUID NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_att_leave_accrual_policy_company_key_version_active
  ON public.att_leave_accrual_policy (company_id, lower(leave_type_key), version)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_att_leave_accrual_policy_company_status
  ON public.att_leave_accrual_policy (company_id, status);

CREATE INDEX IF NOT EXISTS ix_att_leave_accrual_policy_company_key_version
  ON public.att_leave_accrual_policy (company_id, lower(leave_type_key), version DESC);

CREATE INDEX IF NOT EXISTS ix_att_leave_accrual_policy_resolve_effective
  ON public.att_leave_accrual_policy (company_id, lower(leave_type_key), effective_from DESC)
  WHERE archived_at IS NULL AND status = 'active';

DO $$ BEGIN
  ALTER TABLE public.att_leave_accrual_policy
    DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_dates;
  ALTER TABLE public.att_leave_accrual_policy
    ADD CONSTRAINT chk_att_leave_accrual_policy_dates
    CHECK (effective_to IS NULL OR effective_to > effective_from);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.att_leave_accrual_policy
    DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_status;
  ALTER TABLE public.att_leave_accrual_policy
    ADD CONSTRAINT chk_att_leave_accrual_policy_status
    CHECK (status IN ('active', 'retired'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.att_leave_accrual_policy
    DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_unit;
  ALTER TABLE public.att_leave_accrual_policy
    ADD CONSTRAINT chk_att_leave_accrual_policy_unit
    CHECK (unit IN ('day', 'hour'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.att_leave_accrual_policy
    DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_mode_format;
  ALTER TABLE public.att_leave_accrual_policy
    ADD CONSTRAINT chk_att_leave_accrual_policy_mode_format
    CHECK (accrual_mode ~ '^[a-z][a-z0-9_]*$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.att_leave_accrual_policy
    DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_annual_days;
  ALTER TABLE public.att_leave_accrual_policy
    ADD CONSTRAINT chk_att_leave_accrual_policy_annual_days
    CHECK (annual_days >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.att_leave_accrual_policy
    DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_caps;
  ALTER TABLE public.att_leave_accrual_policy
    ADD CONSTRAINT chk_att_leave_accrual_policy_caps
    CHECK (
      (carry_cap_days IS NULL OR carry_cap_days >= 0)
      AND (max_balance_days IS NULL OR max_balance_days >= 0)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE public.att_leave_accrual_policy IS
  'ATT leave accrual/balance RULE SoT (Option B). Bound to att_leave_type via leave_type_key. F-ATT-LEAVE-04 engine LIVE = HOLD.';
COMMENT ON COLUMN public.att_leave_accrual_policy.leave_type_key IS
  'Soft FK text → sealed EFF att_leave_type.leave_type_key — no invent type via policy admin.';
COMMENT ON COLUMN public.att_leave_accrual_policy.metadata_json IS
  'Optional component hints — NOT mega-EAV SoT; accrue evaluator LIVE OUT this wave.';
