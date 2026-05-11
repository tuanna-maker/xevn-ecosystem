-- Create recruitment_plans table
CREATE TABLE public.recruitment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_month INTEGER NOT NULL DEFAULT 1,
  end_month INTEGER NOT NULL DEFAULT 12,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  creator_id UUID REFERENCES auth.users(id),
  creator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recruitment_plan_departments table
CREATE TABLE public.recruitment_plan_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.recruitment_plans(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recruitment_plan_positions table
CREATE TABLE public.recruitment_plan_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.recruitment_plan_departments(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  months_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.recruitment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_plan_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_plan_positions ENABLE ROW LEVEL SECURITY;

-- RLS policies for recruitment_plans
CREATE POLICY "Users can view recruitment plans in their companies"
ON public.recruitment_plans FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert recruitment plans in their companies"
ON public.recruitment_plans FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update recruitment plans in their companies"
ON public.recruitment_plans FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete recruitment plans in their companies"
ON public.recruitment_plans FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS policies for recruitment_plan_departments
CREATE POLICY "Users can view plan departments in their companies"
ON public.recruitment_plan_departments FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert plan departments in their companies"
ON public.recruitment_plan_departments FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update plan departments in their companies"
ON public.recruitment_plan_departments FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete plan departments in their companies"
ON public.recruitment_plan_departments FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS policies for recruitment_plan_positions
CREATE POLICY "Users can view plan positions in their companies"
ON public.recruitment_plan_positions FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert plan positions in their companies"
ON public.recruitment_plan_positions FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update plan positions in their companies"
ON public.recruitment_plan_positions FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete plan positions in their companies"
ON public.recruitment_plan_positions FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Add triggers for updated_at
CREATE TRIGGER update_recruitment_plans_updated_at
  BEFORE UPDATE ON public.recruitment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruitment_plan_departments_updated_at
  BEFORE UPDATE ON public.recruitment_plan_departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruitment_plan_positions_updated_at
  BEFORE UPDATE ON public.recruitment_plan_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();