-- Create table for salary component categories
CREATE TABLE public.salary_component_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for salary components (definitions)
CREATE TABLE public.salary_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.salary_component_categories(id) ON DELETE SET NULL,
  component_type TEXT NOT NULL DEFAULT 'custom', -- system, custom
  nature TEXT NOT NULL DEFAULT 'income', -- income, deduction, other
  value_type TEXT NOT NULL DEFAULT 'currency', -- currency, number, percentage
  is_taxable BOOLEAN DEFAULT true,
  is_insurance_base BOOLEAN DEFAULT false,
  formula TEXT, -- Excel-like formula for calculation
  default_value NUMERIC DEFAULT 0,
  min_value NUMERIC,
  max_value NUMERIC,
  description TEXT,
  applied_to TEXT DEFAULT 'all', -- all, specific_positions, specific_departments
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create table for employee salary assignments (specific component values per employee)
CREATE TABLE public.employee_salary_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  component_id UUID NOT NULL REFERENCES public.salary_components(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL DEFAULT 0,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salary_component_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for salary_component_categories
CREATE POLICY "Users can view salary categories in their companies"
  ON public.salary_component_categories FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert salary categories in their companies"
  ON public.salary_component_categories FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update salary categories in their companies"
  ON public.salary_component_categories FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete salary categories in their companies"
  ON public.salary_component_categories FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for salary_components
CREATE POLICY "Users can view salary components in their companies"
  ON public.salary_components FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert salary components in their companies"
  ON public.salary_components FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update salary components in their companies"
  ON public.salary_components FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete salary components in their companies"
  ON public.salary_components FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for employee_salary_components
CREATE POLICY "Users can view employee salary components in their companies"
  ON public.employee_salary_components FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert employee salary components in their companies"
  ON public.employee_salary_components FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update employee salary components in their companies"
  ON public.employee_salary_components FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete employee salary components in their companies"
  ON public.employee_salary_components FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create indexes for better performance
CREATE INDEX idx_salary_components_company ON public.salary_components(company_id);
CREATE INDEX idx_salary_components_category ON public.salary_components(category_id);
CREATE INDEX idx_salary_components_nature ON public.salary_components(nature);
CREATE INDEX idx_employee_salary_components_employee ON public.employee_salary_components(employee_id);
CREATE INDEX idx_employee_salary_components_component ON public.employee_salary_components(component_id);

-- Update trigger for updated_at
CREATE TRIGGER update_salary_component_categories_updated_at
  BEFORE UPDATE ON public.salary_component_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_components_updated_at
  BEFORE UPDATE ON public.salary_components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_salary_components_updated_at
  BEFORE UPDATE ON public.employee_salary_components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();