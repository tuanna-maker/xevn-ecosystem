-- Create table for employee insurance records
CREATE TABLE public.employee_insurances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'social', -- social, health, unemployment, accident, life
  provider TEXT NOT NULL,
  policy_number TEXT,
  start_date DATE,
  end_date DATE,
  contribution NUMERIC DEFAULT 0, -- Employee contribution
  employer_contribution NUMERIC DEFAULT 0, -- Employer contribution
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, pending
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for employee benefits
CREATE TABLE public.employee_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'allowance', -- allowance, bonus, leave, health, education, other
  value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'VNĐ',
  frequency TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly, one-time
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for employee trainings
CREATE TABLE public.employee_trainings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'internal', -- internal, external, online, certification
  category TEXT NOT NULL DEFAULT 'technical', -- technical, soft-skill, management, compliance, language, other
  provider TEXT,
  instructor TEXT,
  start_date DATE,
  end_date DATE,
  duration NUMERIC DEFAULT 0,
  duration_unit TEXT DEFAULT 'hours', -- hours, days, weeks, months
  location TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in-progress, completed, cancelled
  progress INTEGER DEFAULT 0,
  score NUMERIC,
  certificate_number TEXT,
  certificate_file_url TEXT,
  cost NUMERIC DEFAULT 0,
  paid_by TEXT DEFAULT 'company', -- company, employee, shared
  description TEXT,
  skills TEXT[], -- Array of skill names
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_trainings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_insurances
CREATE POLICY "Users can view insurances in their companies"
  ON public.employee_insurances FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert insurances in their companies"
  ON public.employee_insurances FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update insurances in their companies"
  ON public.employee_insurances FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete insurances in their companies"
  ON public.employee_insurances FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for employee_benefits
CREATE POLICY "Users can view benefits in their companies"
  ON public.employee_benefits FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert benefits in their companies"
  ON public.employee_benefits FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update benefits in their companies"
  ON public.employee_benefits FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete benefits in their companies"
  ON public.employee_benefits FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for employee_trainings
CREATE POLICY "Users can view trainings in their companies"
  ON public.employee_trainings FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert trainings in their companies"
  ON public.employee_trainings FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update trainings in their companies"
  ON public.employee_trainings FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete trainings in their companies"
  ON public.employee_trainings FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create triggers for updated_at
CREATE TRIGGER update_employee_insurances_updated_at
  BEFORE UPDATE ON public.employee_insurances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_benefits_updated_at
  BEFORE UPDATE ON public.employee_benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_trainings_updated_at
  BEFORE UPDATE ON public.employee_trainings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();