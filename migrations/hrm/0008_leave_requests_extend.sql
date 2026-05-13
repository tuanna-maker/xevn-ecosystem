-- Extend leave_requests for HRM API + mobile/web flows (xevn_hrm).

BEGIN;

ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS employee_code TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS total_days NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS handover_to TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS handover_tasks TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS approver_employee_id UUID NULL;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

COMMIT;
