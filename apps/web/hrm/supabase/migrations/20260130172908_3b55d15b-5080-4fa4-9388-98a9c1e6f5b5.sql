-- Create tax_policy_participants table
CREATE TABLE IF NOT EXISTS public.tax_policy_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  policy_type TEXT NOT NULL DEFAULT 'progressive', -- 'progressive' or 'flat'
  policy_name TEXT NOT NULL,
  flat_rate NUMERIC, -- percentage for flat rate tax
  effective_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'inactive'
  dependents INTEGER DEFAULT 0,
  personal_deduction NUMERIC DEFAULT 11000000, -- 11 million VND
  dependent_deduction NUMERIC DEFAULT 4400000, -- 4.4 million VND per dependent
  notes TEXT,
  created_by TEXT,
  created_by_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tax_policy_participants
ALTER TABLE public.tax_policy_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax_policy_participants
CREATE POLICY "Users can view tax policy participants for their company"
ON public.tax_policy_participants
FOR SELECT
USING (true);

CREATE POLICY "Users can insert tax policy participants for their company"
ON public.tax_policy_participants
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update tax policy participants for their company"
ON public.tax_policy_participants
FOR UPDATE
USING (true);

CREATE POLICY "Users can delete tax policy participants for their company"
ON public.tax_policy_participants
FOR DELETE
USING (true);

-- Add missing columns to insurance table if they don't exist
ALTER TABLE public.insurance ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE public.insurance ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.insurance ADD COLUMN IF NOT EXISTS insurance_type TEXT DEFAULT 'all';
ALTER TABLE public.insurance ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.insurance ADD COLUMN IF NOT EXISTS created_by_position TEXT;

-- Create trigger for updated_at on tax_policy_participants
CREATE TRIGGER update_tax_policy_participants_updated_at
BEFORE UPDATE ON public.tax_policy_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();