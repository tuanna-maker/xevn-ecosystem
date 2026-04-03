-- Create HR decisions table
CREATE TABLE public.hr_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  decision_code TEXT NOT NULL,
  decision_type TEXT NOT NULL DEFAULT 'appointment',
  title TEXT NOT NULL,
  content TEXT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  department TEXT,
  position TEXT,
  effective_date DATE,
  expiry_date DATE,
  signer_name TEXT,
  signer_position TEXT,
  signing_date DATE,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_decisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view decisions in their companies"
  ON public.hr_decisions FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert decisions in their companies"
  ON public.hr_decisions FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update decisions in their companies"
  ON public.hr_decisions FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete decisions in their companies"
  ON public.hr_decisions FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create index for better performance
CREATE INDEX idx_hr_decisions_company_id ON public.hr_decisions(company_id);
CREATE INDEX idx_hr_decisions_employee_id ON public.hr_decisions(employee_id);
CREATE INDEX idx_hr_decisions_decision_type ON public.hr_decisions(decision_type);
CREATE INDEX idx_hr_decisions_status ON public.hr_decisions(status);