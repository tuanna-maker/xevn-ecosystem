-- @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-CATALOG-BIND-01
-- Open insurance_type to SI catalog keys + notes (ghi_chu Excel).
-- Idempotent: safe if constraint already dropped / column already widened.

ALTER TABLE hrm_insurance_rate
  DROP CONSTRAINT IF EXISTS hrm_insurance_rate_insurance_type_check;

ALTER TABLE hrm_insurance_rate
  ALTER COLUMN insurance_type TYPE varchar(64);

ALTER TABLE hrm_insurance_rate
  ADD COLUMN IF NOT EXISTS notes text;
