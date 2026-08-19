-- PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01
-- Platform PAY catalog: default_formula_definition_id FK + soft-delete archived_at.
-- salary_components.formula TEXT remains legacy hint — NOT engine SoT (G-PAY-F-07).

ALTER TABLE IF EXISTS public.salary_components
  ADD COLUMN IF NOT EXISTS default_formula_definition_id UUID NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS ix_salary_components_default_formula
  ON public.salary_components (default_formula_definition_id)
  WHERE default_formula_definition_id IS NOT NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_salary_components_company_archived
  ON public.salary_components (company_id, archived_at);

COMMENT ON COLUMN public.salary_components.default_formula_definition_id IS
  'FK soft-assert to pay_formula_definitions (status=active published). Platform catalog default formula bind.';
COMMENT ON COLUMN public.salary_components.formula IS
  'Legacy hint only — deprecated as runtime SoT; use default_formula_definition_id + pay_formula_definitions.';
COMMENT ON COLUMN public.salary_components.archived_at IS
  'Soft-delete — no hard DELETE of catalog rows (Platform L6).';
