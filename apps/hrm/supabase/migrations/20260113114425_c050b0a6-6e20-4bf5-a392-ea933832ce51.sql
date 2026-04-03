-- Create employees table with soft delete support
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  salary NUMERIC,
  manager_id UUID REFERENCES public.employees(id),
  
  -- Personal info
  gender TEXT,
  birth_date DATE,
  id_number TEXT,
  id_issue_date DATE,
  id_issue_place TEXT,
  permanent_address TEXT,
  temporary_address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  
  -- Work info
  employment_type TEXT DEFAULT 'full-time',
  work_location TEXT,
  
  -- Banking & Tax
  bank_name TEXT,
  bank_account TEXT,
  tax_code TEXT,
  social_insurance_number TEXT,
  health_insurance_number TEXT,
  
  -- Soft delete fields
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,
  delete_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(company_id, employee_code)
);

-- Create employee_history table for tracking changes
CREATE TABLE public.employee_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'restore'
  changes JSONB, -- stores old and new values
  performed_by UUID,
  performed_by_name TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS policies for employees
CREATE POLICY "Users can view employees in their companies"
ON public.employees FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert employees in their companies"
ON public.employees FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update employees in their companies"
ON public.employees FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete employees in their companies"
ON public.employees FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Enable RLS on employee_history
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_history
CREATE POLICY "Users can view history in their companies"
ON public.employee_history FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert history in their companies"
ON public.employee_history FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create trigger for auto-update updated_at
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_employees_company_id ON public.employees(company_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_deleted_at ON public.employees(deleted_at);
CREATE INDEX idx_employee_history_employee_id ON public.employee_history(employee_id);
CREATE INDEX idx_employee_history_action ON public.employee_history(action);