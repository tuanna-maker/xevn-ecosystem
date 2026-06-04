-- Wave 1 Supabase Zero pilot tables (P1-SUPA-BE-01)
-- Apply: node scripts/migrate-apply.mjs hrm  (DATABASE_URL_HRM)

BEGIN;

CREATE TABLE IF NOT EXISTS public.hr_decisions (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  decision_code TEXT NOT NULL,
  decision_type TEXT NOT NULL DEFAULT 'appointment',
  title TEXT NOT NULL,
  content TEXT,
  employee_id UUID,
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  department TEXT,
  position TEXT,
  effective_date DATE,
  expiry_date DATE,
  signer_name TEXT,
  signer_position TEXT,
  signing_date DATE,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_decisions_company_id ON public.hr_decisions (company_id);
CREATE INDEX IF NOT EXISTS idx_hr_decisions_decision_type ON public.hr_decisions (decision_type);

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  parent_id UUID REFERENCES public.departments (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  manager_name TEXT,
  manager_email TEXT,
  employee_count INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_company_status
  ON public.departments (company_id, status, sort_order);

CREATE TABLE IF NOT EXISTS public.salary_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_salary_templates_company_code UNIQUE (company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_salary_templates_company_status
  ON public.salary_templates (company_id, status);

CREATE TABLE IF NOT EXISTS public.salary_template_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.salary_templates (id) ON DELETE CASCADE,
  component_code TEXT NOT NULL,
  default_value NUMERIC NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_salary_template_components UNIQUE (template_id, component_code)
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  contract_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_avatar TEXT,
  department TEXT,
  contract_type TEXT NOT NULL DEFAULT 'Hợp đồng 1 năm',
  effective_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_company_status ON public.contracts (company_id, status);

CREATE TABLE IF NOT EXISTS public.insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  employee_id UUID,
  employee_name TEXT,
  policy_number TEXT,
  provider TEXT,
  insurance_type TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_company_status ON public.insurance (company_id, status);

CREATE TABLE IF NOT EXISTS public.employee_insurances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'social',
  provider TEXT NOT NULL,
  policy_number TEXT,
  start_date DATE,
  end_date DATE,
  contribution NUMERIC NOT NULL DEFAULT 0,
  employer_contribution NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_insurances_company_employee
  ON public.employee_insurances (company_id, employee_id);

CREATE TABLE IF NOT EXISTS public.employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'allowance',
  value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'VNĐ',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (LOWER(email));

CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON public.platform_admins (LOWER(email));

CREATE TABLE IF NOT EXISTS public.user_company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  employee_id UUID,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_company_memberships_user_company
  ON public.user_company_memberships (user_id, company_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_company_memberships_company
  ON public.user_company_memberships (company_id);

COMMIT;
