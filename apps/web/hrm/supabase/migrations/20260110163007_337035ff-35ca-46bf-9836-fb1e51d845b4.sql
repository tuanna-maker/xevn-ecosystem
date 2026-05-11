-- Create headcount_proposals table for staffing proposals
CREATE TABLE public.headcount_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  position_name TEXT NOT NULL,
  current_headcount INTEGER NOT NULL DEFAULT 0,
  requested_headcount INTEGER NOT NULL DEFAULT 1,
  proposal_type TEXT NOT NULL DEFAULT 'new', -- 'new', 'replacement', 'expansion'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  justification TEXT,
  expected_start_date DATE,
  salary_budget_min NUMERIC,
  salary_budget_max NUMERIC,
  job_description TEXT,
  requirements TEXT,
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.headcount_proposals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view headcount proposals" 
ON public.headcount_proposals 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert headcount proposals" 
ON public.headcount_proposals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update headcount proposals" 
ON public.headcount_proposals 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete headcount proposals" 
ON public.headcount_proposals 
FOR DELETE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_headcount_proposals_updated_at
BEFORE UPDATE ON public.headcount_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();