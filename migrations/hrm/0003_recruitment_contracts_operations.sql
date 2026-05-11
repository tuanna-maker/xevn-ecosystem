CREATE TABLE IF NOT EXISTS public.job_requisitions (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_job_requisitions_status CHECK (status IN ('open', 'closed', 'on_hold'))
);

CREATE TABLE IF NOT EXISTS public.recruitment_candidates (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_recruitment_candidates_status CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected'))
);

CREATE TABLE IF NOT EXISTS public.recruitment_interviews (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.recruitment_candidates(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  interviewer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_recruitment_interviews_status CHECK (status IN ('scheduled', 'passed', 'failed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.employee_contracts (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  contract_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_employee_contract_status CHECK (status IN ('active', 'expired', 'terminated')),
  CONSTRAINT chk_contract_date_range CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS public.employee_insurance_records (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_employee_insurance_status CHECK (status IN ('active', 'expired', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.hrm_tasks (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  due_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hrm_task_priority CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT chk_hrm_task_status CHECK (status IN ('todo', 'in_progress', 'done', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_job_requisitions_company_created
  ON public.job_requisitions (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_company_created
  ON public.recruitment_candidates (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_interviews_company_scheduled
  ON public.recruitment_interviews (company_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_employee_contracts_company_end_date
  ON public.employee_contracts (company_id, end_date);

CREATE INDEX IF NOT EXISTS idx_employee_insurance_company_expiry_date
  ON public.employee_insurance_records (company_id, expiry_date);
