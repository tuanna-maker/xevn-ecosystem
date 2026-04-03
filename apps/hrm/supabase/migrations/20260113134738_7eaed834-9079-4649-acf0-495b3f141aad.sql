-- Add renewed_from_id column to track contract renewal chain
ALTER TABLE public.employee_contracts 
ADD COLUMN renewed_from_id uuid REFERENCES public.employee_contracts(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_employee_contracts_renewed_from ON public.employee_contracts(renewed_from_id);