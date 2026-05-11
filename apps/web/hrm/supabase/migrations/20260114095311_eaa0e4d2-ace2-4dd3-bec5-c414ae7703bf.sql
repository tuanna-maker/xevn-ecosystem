-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view employee template assignments for their company" ON public.employee_salary_templates;
DROP POLICY IF EXISTS "Users can create employee template assignments" ON public.employee_salary_templates;
DROP POLICY IF EXISTS "Users can update employee template assignments" ON public.employee_salary_templates;
DROP POLICY IF EXISTS "Users can delete employee template assignments" ON public.employee_salary_templates;

-- Create proper RLS policies for employee_salary_templates
CREATE POLICY "Users can view employee template assignments in their companies"
  ON public.employee_salary_templates
  FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert employee template assignments in their companies"
  ON public.employee_salary_templates
  FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update employee template assignments in their companies"
  ON public.employee_salary_templates
  FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete employee template assignments in their companies"
  ON public.employee_salary_templates
  FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));