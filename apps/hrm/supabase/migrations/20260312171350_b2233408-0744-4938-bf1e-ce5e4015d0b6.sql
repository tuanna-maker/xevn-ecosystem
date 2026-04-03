
-- =====================================================
-- PERFORMANCE INDEXES FOR 1000-COMPANY SCALE
-- =====================================================

-- 1. Critical: Composite index for get_user_company_ids() RLS function
-- This function is called on EVERY query via RLS policies
CREATE INDEX IF NOT EXISTS idx_ucm_user_status 
  ON public.user_company_memberships (user_id, status);

-- 2. Missing company_id indexes (14 tables)
CREATE INDEX IF NOT EXISTS idx_advance_request_employees_company 
  ON public.advance_request_employees (company_id);

CREATE INDEX IF NOT EXISTS idx_bonus_policy_participants_company 
  ON public.bonus_policy_participants (company_id);

CREATE INDEX IF NOT EXISTS idx_employee_benefits_company 
  ON public.employee_benefits (company_id);

CREATE INDEX IF NOT EXISTS idx_employee_history_company 
  ON public.employee_history (company_id);

CREATE INDEX IF NOT EXISTS idx_employee_insurances_company 
  ON public.employee_insurances (company_id);

CREATE INDEX IF NOT EXISTS idx_employee_salary_components_company 
  ON public.employee_salary_components (company_id);

CREATE INDEX IF NOT EXISTS idx_employee_trainings_company 
  ON public.employee_trainings (company_id);

CREATE INDEX IF NOT EXISTS idx_interviews_company 
  ON public.interviews (company_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_company 
  ON public.payment_records (company_id);

CREATE INDEX IF NOT EXISTS idx_payroll_records_company 
  ON public.payroll_records (company_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_campaigns_company 
  ON public.recruitment_campaigns (company_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_plan_departments_company 
  ON public.recruitment_plan_departments (company_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_plan_positions_company 
  ON public.recruitment_plan_positions (company_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_plans_company 
  ON public.recruitment_plans (company_id);

CREATE INDEX IF NOT EXISTS idx_salary_component_categories_company 
  ON public.salary_component_categories (company_id);

CREATE INDEX IF NOT EXISTS idx_tax_policy_participants_company 
  ON public.tax_policy_participants (company_id);

-- 3. Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_employees_company_deleted 
  ON public.employees (company_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_employees_company_status 
  ON public.employees (company_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status 
  ON public.leave_requests (company_id, status);

CREATE INDEX IF NOT EXISTS idx_employee_contracts_company_status 
  ON public.employee_contracts (company_id, status);

CREATE INDEX IF NOT EXISTS idx_contracts_company_status 
  ON public.contracts (company_id, status);

CREATE INDEX IF NOT EXISTS idx_payroll_batches_company_period 
  ON public.payroll_batches (company_id, period_year, period_month);

CREATE INDEX IF NOT EXISTS idx_payroll_records_batch 
  ON public.payroll_records (batch_id);

CREATE INDEX IF NOT EXISTS idx_employee_history_employee 
  ON public.employee_history (employee_id);
