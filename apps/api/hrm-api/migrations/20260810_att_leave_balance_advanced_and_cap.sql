-- PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01 / DATA-01 §4.1–4.2
-- ADD advanced_days on employee_leave_balances · advance cap cols on att_leave_accrual_policy
-- DENY att_leave_hold · must_keep pending_days · no wipe ATT-04 spine

ALTER TABLE public.employee_leave_balances
  ADD COLUMN IF NOT EXISTS advanced_days NUMERIC(5, 1) NOT NULL DEFAULT 0;

UPDATE public.employee_leave_balances
SET advanced_days = 0
WHERE advanced_days IS NULL;

ALTER TABLE public.att_leave_accrual_policy
  ADD COLUMN IF NOT EXISTS advance_max_days NUMERIC(6, 2) NULL;

ALTER TABLE public.att_leave_accrual_policy
  ADD COLUMN IF NOT EXISTS advance_cap_percent NUMERIC(5, 2) NULL;
