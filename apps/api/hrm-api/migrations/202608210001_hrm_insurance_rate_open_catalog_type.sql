-- @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-CATALOG-BIND-01
-- Mirror of migrations/hrm/202608210001 — keep in sync for package-local docs.
ALTER TABLE hrm_insurance_rate
  DROP CONSTRAINT IF EXISTS hrm_insurance_rate_insurance_type_check;

ALTER TABLE hrm_insurance_rate
  ALTER COLUMN insurance_type TYPE varchar(64);

ALTER TABLE hrm_insurance_rate
  ADD COLUMN IF NOT EXISTS notes text;
