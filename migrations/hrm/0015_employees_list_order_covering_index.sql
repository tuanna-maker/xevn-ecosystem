-- P1-HRM-SCALE-BE-W1 / ADR-HRM-SCALE-1000-USERS-20260717 §5.4
-- Covering indexes for GET /employees list + directory:
--   list:      ORDER BY created_at DESC, id DESC
--   directory: ORDER BY full_name, employee_code, id
-- Replaces idx_employees_company_archived (3-col; no id tie-breaker).

BEGIN;

CREATE INDEX IF NOT EXISTS idx_employees_company_archived_created_id
  ON public.employees (company_id, archived_at, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_employees_company_archived_name_code_id
  ON public.employees (company_id, archived_at, full_name ASC, employee_code ASC, id ASC);

DROP INDEX IF EXISTS public.idx_employees_company_archived;
-- Probe leftover (unused by planner for rollup ANY + tenant JSON filter)
DROP INDEX IF EXISTS public.idx_employees_active_created_id;

ANALYZE public.employees;

COMMIT;
