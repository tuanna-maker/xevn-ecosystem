-- PO-HRM-JD-DYNAMIC-BE-01 — JD field catalog + layout + group/pack/rules
-- Runtime also applies via JdDynamicService.ensureSchema (dev bootstrap).
-- U65: system skeleton rows = config bootstrap ≠ UAT seed evidence.

CREATE TABLE IF NOT EXISTS public.rec_jd_field_def (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  section_hint TEXT NULL,
  applies_to_company_ids JSONB NULL,
  validation_json JSONB NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NULL,
  updated_by TEXT NULL
);
CREATE INDEX IF NOT EXISTS ix_rec_jd_field_def_company ON public.rec_jd_field_def (company_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_field_def_company_key_active
  ON public.rec_jd_field_def (company_id, field_key)
  WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.rec_jd_form_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_form_layout_default
  ON public.rec_jd_form_layout (company_id)
  WHERE is_default = TRUE AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.rec_jd_form_layout_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID NOT NULL REFERENCES public.rec_jd_form_layout (id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.rec_jd_field_def (id),
  section TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  company_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_rec_jd_form_layout_item_layout ON public.rec_jd_form_layout_item (layout_id, section, sort_order);
CREATE INDEX IF NOT EXISTS ix_rec_jd_form_layout_item_company ON public.rec_jd_form_layout_item (company_id);

CREATE TABLE IF NOT EXISTS public.rec_jd_group_def (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL,
  usage TEXT NOT NULL,
  view_style TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NULL,
  updated_by TEXT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_group_def_company_code_active
  ON public.rec_jd_group_def (company_id, code)
  WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.rec_jd_group_field (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.rec_jd_group_def (id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.rec_jd_field_def (id),
  company_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required_in_group BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_group_field_pair
  ON public.rec_jd_group_field (group_id, field_id);

CREATE TABLE IF NOT EXISTS public.rec_jd_default_pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NULL,
  is_company_fallback BOOLEAN NOT NULL DEFAULT FALSE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NULL,
  updated_by TEXT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_default_pack_company_code_active
  ON public.rec_jd_default_pack (company_id, code)
  WHERE archived_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_default_pack_fallback
  ON public.rec_jd_default_pack (company_id)
  WHERE is_company_fallback = TRUE AND archived_at IS NULL AND is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.rec_jd_pack_group (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.rec_jd_default_pack (id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.rec_jd_group_def (id),
  company_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  always_on BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_pack_group_pair
  ON public.rec_jd_pack_group (pack_id, group_id);

CREATE TABLE IF NOT EXISTS public.rec_jd_pack_rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  match_type TEXT NOT NULL,
  match_value TEXT NULL,
  pack_id UUID NOT NULL REFERENCES public.rec_jd_default_pack (id),
  condition_json JSONB NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_rec_jd_pack_rule_company_priority
  ON public.rec_jd_pack_rule (company_id, priority)
  WHERE archived_at IS NULL AND is_active = TRUE;

ALTER TABLE public.job_description_templates
  ADD COLUMN IF NOT EXISTS values_json JSONB NULL;
ALTER TABLE public.job_description_templates
  ADD COLUMN IF NOT EXISTS layout_snapshot_json JSONB NULL;
ALTER TABLE public.job_description_templates
  ADD COLUMN IF NOT EXISTS layout_version INTEGER NOT NULL DEFAULT 1;
