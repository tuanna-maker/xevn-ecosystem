-- Migration: 202608280001_create_policy_assignments.sql
-- Purpose: Tạo bảng policy_assignments cho Policy Hub v2
-- UC: UC-POL-05 (SmartTargetPicker gắn đối tượng áp dụng)
-- Ref spec: implementation_plan.md §DB Design

CREATE TABLE IF NOT EXISTS public.policy_assignments (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  policy_id      BIGINT NOT NULL REFERENCES public.pay_policies(id),
  -- target_type: job_title|department|employee|contract|pay_group|all
  target_type    TEXT NOT NULL,
  -- target_key: job_title_key|department_key|pay_group_code (cho key-based targets)
  target_key     TEXT,
  -- target_id: employee_id|employee_contracts.id (cho UUID-based targets)
  target_id      UUID,
  -- priority: nhỏ hơn = ưu tiên cao hơn khi tính lương
  -- contract=10, employee=20, job_title=30, department=40, pay_group=50, all=99
  priority       INT NOT NULL DEFAULT 50,
  effective_from DATE NOT NULL,
  effective_to   DATE,
  created_by     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ,

  CONSTRAINT chk_policy_asgn_target_type CHECK (
    target_type IN ('job_title','department','employee','contract','pay_group','all')
  ),
  -- Đảm bảo target_key/target_id nhất quán với target_type
  CONSTRAINT chk_policy_asgn_target_consistency CHECK (
    (target_type IN ('job_title','department','pay_group') AND target_key IS NOT NULL AND target_id IS NULL)
    OR (target_type IN ('employee','contract') AND target_id IS NOT NULL AND target_key IS NULL)
    OR (target_type = 'all' AND target_key IS NULL AND target_id IS NULL)
  )
);

-- Index for policy-level queries
CREATE INDEX IF NOT EXISTS idx_policy_asgn_policy
  ON public.policy_assignments(policy_id)
  WHERE deleted_at IS NULL;

-- Index for tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_policy_asgn_tenant_type
  ON public.policy_assignments(tenant_id, target_type)
  WHERE deleted_at IS NULL;

-- Index for key-based target lookup (job_title, department, pay_group)
CREATE INDEX IF NOT EXISTS idx_policy_asgn_target_key
  ON public.policy_assignments(tenant_id, target_key)
  WHERE deleted_at IS NULL AND target_key IS NOT NULL;

-- Index for UUID-based target lookup (employee, contract)
CREATE INDEX IF NOT EXISTS idx_policy_asgn_target_id
  ON public.policy_assignments(tenant_id, target_id)
  WHERE deleted_at IS NULL AND target_id IS NOT NULL;

COMMENT ON TABLE public.policy_assignments IS
  'Gắn policy vào đối tượng áp dụng: chức danh/phòng ban/cá nhân/hợp đồng/nhóm/tất cả';
COMMENT ON COLUMN public.policy_assignments.priority IS
  'Priority khi resolve: contract=10, employee=20, job_title=30, dept=40, pay_group=50, all=99';
