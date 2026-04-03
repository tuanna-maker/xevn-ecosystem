-- Add RLS policies for existing employee_work_history table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employee_work_history' AND policyname = 'Users can view work history in their companies'
  ) THEN
    CREATE POLICY "Users can view work history in their companies" ON public.employee_work_history
      FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employee_work_history' AND policyname = 'Users can insert work history in their companies'
  ) THEN
    CREATE POLICY "Users can insert work history in their companies" ON public.employee_work_history
      FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employee_work_history' AND policyname = 'Users can update work history in their companies'
  ) THEN
    CREATE POLICY "Users can update work history in their companies" ON public.employee_work_history
      FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employee_work_history' AND policyname = 'Users can delete work history in their companies'
  ) THEN
    CREATE POLICY "Users can delete work history in their companies" ON public.employee_work_history
      FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
  END IF;
END $$;