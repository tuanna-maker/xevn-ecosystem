-- BE-HRM-EMP-COMPANY-COL-01 — upgrade legacy Khối* labels to legal-entity / ĐVTV SoT
-- Spec: docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md AC-EMP-COL-01..04
-- Interim BR-INT-05 map: holding + org-seed subsidiaries order ↔ GROUP_MEMBER_SLUGS

ALTER TABLE public.company_slug_map
  ADD COLUMN IF NOT EXISTS display_name TEXT;

UPDATE public.company_slug_map SET display_name = 'Tập đoàn XeVN', updated_at = NOW()
WHERE tenant_id = 'xevn' AND company_slug = 'holding'
  AND (NULLIF(TRIM(display_name), '') IS NULL OR display_name ~ '^Khối[[:space:]]');

UPDATE public.company_slug_map SET display_name = 'Công ty Cổ phần Thương mại và Dịch vụ X.E', updated_at = NOW()
WHERE tenant_id = 'xevn' AND company_slug = 'trsport'
  AND (NULLIF(TRIM(display_name), '') IS NULL OR display_name ~ '^Khối[[:space:]]' OR display_name = 'Khối Vận tải X.E');

UPDATE public.company_slug_map SET display_name = 'Công ty TNHH Du lịch Visun', updated_at = NOW()
WHERE tenant_id = 'xevn' AND company_slug = 'logistics'
  AND (NULLIF(TRIM(display_name), '') IS NULL OR display_name ~ '^Khối[[:space:]]' OR display_name = 'Khối Logistics X.E');

UPDATE public.company_slug_map SET display_name = 'Công ty TNHH Du lịch X.E Việt Nam', updated_at = NOW()
WHERE tenant_id = 'xevn' AND company_slug = 'finance'
  AND (NULLIF(TRIM(display_name), '') IS NULL OR display_name ~ '^Khối[[:space:]]' OR display_name = 'Khối Tài chính X.E');

UPDATE public.company_slug_map SET display_name = 'Công ty TNHH X.E Việt Nam', updated_at = NOW()
WHERE tenant_id = 'xevn' AND company_slug = 'services'
  AND (NULLIF(TRIM(display_name), '') IS NULL OR display_name ~ '^Khối[[:space:]]' OR display_name = 'Khối Dịch vụ X.E');

COMMENT ON COLUMN public.company_slug_map.display_name IS
  'Vietnamese company/legal-entity display for GROUP_MEMBER_SLUG (ĐVTV SoT); not Khối* chart fiction (BE-HRM-EMP-COMPANY-COL-01)';
