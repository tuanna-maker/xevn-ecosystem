-- Create job_postings table for recruitment job listings
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  work_location TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  is_salary_visible BOOLEAN DEFAULT true,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  headcount INTEGER NOT NULL DEFAULT 1,
  applied_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  deadline DATE,
  priority TEXT DEFAULT 'medium',
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view job postings in their companies"
  ON public.job_postings
  FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert job postings in their companies"
  ON public.job_postings
  FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update job postings in their companies"
  ON public.job_postings
  FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete job postings in their companies"
  ON public.job_postings
  FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create trigger for updated_at
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_job_postings_company_id ON public.job_postings(company_id);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_deadline ON public.job_postings(deadline);