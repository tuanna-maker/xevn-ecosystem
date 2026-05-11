-- Add department assignment and additional configuration fields to salary_templates
ALTER TABLE public.salary_templates
ADD COLUMN IF NOT EXISTS applicable_departments text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS applicable_positions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS applicable_employment_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS effective_from date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS effective_to date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_template_id uuid REFERENCES public.salary_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_income_formula text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_deduction_formula text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS net_salary_formula text DEFAULT NULL;

-- Add formula and condition fields to salary_template_components
ALTER TABLE public.salary_template_components
ADD COLUMN IF NOT EXISTS formula text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS condition_formula text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_value numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_value numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS apply_tax boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS apply_insurance boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS description text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_editable boolean DEFAULT true;

-- Create table for template assignments to specific employees
CREATE TABLE IF NOT EXISTS public.employee_salary_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.salary_templates(id) ON DELETE CASCADE,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date DEFAULT NULL,
  is_active boolean DEFAULT true,
  assigned_by uuid DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employee_id, template_id, effective_from)
);

-- Enable RLS on employee_salary_templates
ALTER TABLE public.employee_salary_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_salary_templates
CREATE POLICY "Users can view employee template assignments for their company"
  ON public.employee_salary_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create employee template assignments"
  ON public.employee_salary_templates
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update employee template assignments"
  ON public.employee_salary_templates
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete employee template assignments"
  ON public.employee_salary_templates
  FOR DELETE
  USING (true);

-- Add updated_at trigger for employee_salary_templates
CREATE TRIGGER update_employee_salary_templates_updated_at
  BEFORE UPDATE ON public.employee_salary_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_salary_templates_employee_id ON public.employee_salary_templates(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_salary_templates_template_id ON public.employee_salary_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_employee_salary_templates_company_id ON public.employee_salary_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_salary_templates_applicable_departments ON public.salary_templates USING GIN(applicable_departments);
CREATE INDEX IF NOT EXISTS idx_salary_templates_status ON public.salary_templates(status);