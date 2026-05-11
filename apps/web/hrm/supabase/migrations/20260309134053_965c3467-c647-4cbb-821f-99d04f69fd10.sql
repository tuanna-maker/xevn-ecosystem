
ALTER TABLE public.user_company_memberships 
ADD COLUMN employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_ucm_employee_id ON public.user_company_memberships(employee_id);
