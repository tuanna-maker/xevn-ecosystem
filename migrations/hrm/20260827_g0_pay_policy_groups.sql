-- Migration G0: pay_policy_groups table + add group_id to pay_policies
-- Idempotent: safe to re-run
-- ref_srs: SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md

CREATE TABLE IF NOT EXISTS public.pay_policy_groups (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  code            TEXT          NOT NULL,
  name_vi         TEXT          NOT NULL,
  icon            TEXT          NULL,
  color_hex       TEXT          NULL,
  sort_order      SMALLINT      NOT NULL DEFAULT 100,
  is_platform     BOOLEAN       NOT NULL DEFAULT false,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  description     TEXT          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_by      TEXT          NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT uq_pay_policy_groups_code UNIQUE (code, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_pay_policy_groups_tenant
  ON public.pay_policy_groups (tenant_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pay_policy_groups_platform
  ON public.pay_policy_groups (sort_order)
  WHERE deleted_at IS NULL AND is_platform = true;

ALTER TABLE public.pay_policies
  ADD COLUMN IF NOT EXISTS group_id BIGINT NULL;

CREATE INDEX IF NOT EXISTS idx_pay_policies_group_id
  ON public.pay_policies (group_id)
  WHERE deleted_at IS NULL AND group_id IS NOT NULL;

-- Seed platform groups (idempotent, BR-G0-04: tenant_id='' for platform)
INSERT INTO public.pay_policy_groups (tenant_id, code, name_vi, icon, color_hex, sort_order, is_platform, is_active, created_by)
VALUES
  ('', 'LUONG',  'Luong',   '', '#10B981', 10, true, true, 'SYSTEM'),
  ('', 'THUONG', 'Thuong',  '', '#F59E0B', 20, true, true, 'SYSTEM'),
  ('', 'GIA',    'Phu cap', '', '#3B82F6', 30, true, true, 'SYSTEM'),
  ('', 'PHAT',   'Phat',    '', '#EF4444', 40, true, true, 'SYSTEM'),
  ('', 'BHXH',   'BHXH',    '', '#8B5CF6', 50, true, true, 'SYSTEM'),
  ('', 'THUE',   'Thue',    '', '#6B7280', 60, true, true, 'SYSTEM')
ON CONFLICT (code, tenant_id) DO NOTHING;