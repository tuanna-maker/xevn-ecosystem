-- P1-HRM-SCALE-BE-W2 / ADR-HRM-SCALE-1000-USERS-20260717 §5.4–§6 W2
-- Expression index aligned to master-tenant partition predicate used by
-- pushEmployeeListScopeFilters (group CEO rollup + company_id ANY):
--   COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
-- Complements W1 indexes (company_id, archived_at, created_at, id).
--
-- Rollback:
--   DROP INDEX IF EXISTS public.idx_employees_tenant_co_arch_created_id;

BEGIN;

CREATE INDEX IF NOT EXISTS idx_employees_tenant_co_arch_created_id
  ON public.employees (
    (COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn')),
    company_id,
    archived_at,
    created_at DESC,
    id DESC
  );

ANALYZE public.employees;

COMMIT;
