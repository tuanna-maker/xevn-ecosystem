-- @CODE-MEMORY
-- UC: FR-HRM-CI-01 / G-CI-01
-- Purpose: Allow NULL end_date for open-ended contract types (indefinite / HDLD_KTH).
-- WorkItem: BE-HRM-G-CI-01
-- Rollback:
--   UPDATE public.employee_contracts SET end_date = start_date WHERE end_date IS NULL;
--   ALTER TABLE public.employee_contracts ALTER COLUMN end_date SET NOT NULL;
--   ALTER TABLE public.employee_contracts DROP CONSTRAINT IF EXISTS chk_contract_date_range;
--   ALTER TABLE public.employee_contracts
--     ADD CONSTRAINT chk_contract_date_range CHECK (start_date <= end_date);

ALTER TABLE public.employee_contracts
  ALTER COLUMN end_date DROP NOT NULL;

ALTER TABLE public.employee_contracts
  DROP CONSTRAINT IF EXISTS chk_contract_date_range;

ALTER TABLE public.employee_contracts
  ADD CONSTRAINT chk_contract_date_range
  CHECK (end_date IS NULL OR start_date <= end_date);
