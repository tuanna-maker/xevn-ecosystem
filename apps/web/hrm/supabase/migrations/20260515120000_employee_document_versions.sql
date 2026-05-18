-- Document vault versioning (họp Chủ tịch 2026-05)
CREATE TABLE IF NOT EXISTS public.employee_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  folder_path TEXT NOT NULL DEFAULT '/',
  file_url TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (employee_id, folder_path, version)
);

CREATE INDEX IF NOT EXISTS idx_employee_document_versions_employee
  ON public.employee_document_versions (employee_id, uploaded_at DESC);
