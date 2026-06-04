-- Wave 2 Supabase Zero — Nest CRUD tables (P1-SUPA-BE-02)
-- Apply: node scripts/migrate-apply.mjs hrm

BEGIN;

CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  work_location TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  is_salary_visible BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  headcount INTEGER NOT NULL DEFAULT 1,
  applied_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  campaign_id UUID,
  source_proposal_id UUID,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_company_status ON public.job_postings (company_id, status);

CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  stage TEXT NOT NULL DEFAULT 'applied',
  source TEXT,
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_company_stage ON public.candidates (company_id, stage);

CREATE TABLE IF NOT EXISTS public.candidate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings (id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  applied_date DATE DEFAULT CURRENT_DATE,
  stage TEXT NOT NULL DEFAULT 'applied',
  rating INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  interview_date TIMESTAMPTZ,
  interviewer TEXT,
  salary_expectation NUMERIC,
  campaign_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_candidate_applications UNIQUE (candidate_id, job_posting_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_applications_company ON public.candidate_applications (company_id);

CREATE TABLE IF NOT EXISTS public.recruitment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_month INTEGER NOT NULL DEFAULT 1,
  end_month INTEGER NOT NULL DEFAULT 12,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  creator_id TEXT,
  creator_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recruitment_plan_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.recruitment_plans (id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recruitment_plan_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.recruitment_plan_departments (id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  months_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruitment_plans_company ON public.recruitment_plans (company_id);

CREATE TABLE IF NOT EXISTS public.employee_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'internal',
  category TEXT NOT NULL DEFAULT 'other',
  provider TEXT,
  instructor TEXT,
  start_date DATE,
  end_date DATE,
  duration INTEGER NOT NULL DEFAULT 0,
  duration_unit TEXT NOT NULL DEFAULT 'hours',
  location TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  progress INTEGER NOT NULL DEFAULT 0,
  score NUMERIC,
  certificate_number TEXT,
  certificate_file_url TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  paid_by TEXT NOT NULL DEFAULT 'company',
  description TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_trainings_scope ON public.employee_trainings (employee_id, company_id);

CREATE TABLE IF NOT EXISTS public.employee_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  asset_code TEXT,
  asset_name TEXT NOT NULL,
  category TEXT,
  serial_number TEXT,
  assigned_date DATE,
  return_date DATE,
  status TEXT NOT NULL DEFAULT 'assigned',
  condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_assets_scope ON public.employee_assets (employee_id, company_id);

CREATE TABLE IF NOT EXISTS public.employee_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  kpi_type TEXT,
  target_value NUMERIC,
  actual_value NUMERIC,
  unit TEXT,
  weight NUMERIC,
  period_start DATE,
  period_end DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_kpis_scope ON public.employee_kpis (employee_id, company_id);

COMMIT;
