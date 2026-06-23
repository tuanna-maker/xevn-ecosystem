-- G-INT-03 / PCOMP-W3-BE-04 — display_name bridge for operating slug charts (BA-D-01 §5)
ALTER TABLE public.company_slug_map
  ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN public.company_slug_map.display_name IS
  'Vietnamese chart label for GROUP_MEMBER_SLUG (Plane B); SoT per BA-D-01 §5';
