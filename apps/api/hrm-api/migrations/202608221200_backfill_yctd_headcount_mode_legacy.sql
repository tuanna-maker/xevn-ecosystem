-- PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01 §7 — O4 legacy YCTD classification uplift.
-- Idempotent: only rows with headcount_mode IS NULL are updated.
-- One in_plan winner per (company_id, headcount_cell_id); remaining NULL → out_of_plan.

WITH winners AS (
  SELECT DISTINCT ON (company_id, headcount_cell_id) id
  FROM public.job_requisitions
  WHERE headcount_mode IS NULL
    AND headcount_cell_id IS NOT NULL
  ORDER BY company_id, headcount_cell_id, created_at ASC NULLS LAST, id ASC
)
UPDATE public.job_requisitions r
SET
  headcount_mode = 'in_plan',
  hire_reason = COALESCE(r.hire_reason, 'new'),
  approval_matrix_key = COALESCE(
    NULLIF(TRIM(r.approval_matrix_key), ''),
    'hrm_requisition_short'
  ),
  updated_at = NOW()
FROM winners w
WHERE r.id = w.id;

UPDATE public.job_requisitions
SET
  headcount_mode = 'out_of_plan',
  hire_reason = COALESCE(hire_reason, 'new'),
  out_of_plan_reason = COALESCE(
    NULLIF(TRIM(out_of_plan_reason), ''),
    'YCTD legacy — phân loại ngoài định biên (nâng cấp Wave-2)'
  ),
  approval_matrix_key = COALESCE(
    NULLIF(TRIM(approval_matrix_key), ''),
    'hrm_requisition_long_bod'
  ),
  updated_at = NOW()
WHERE headcount_mode IS NULL;
