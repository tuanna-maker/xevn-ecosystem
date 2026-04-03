-- Create candidate_applications table to link candidates with job postings
CREATE TABLE public.candidate_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  applied_date DATE DEFAULT CURRENT_DATE,
  stage TEXT DEFAULT 'applied',
  rating INTEGER DEFAULT 0,
  notes TEXT,
  interview_date TIMESTAMP WITH TIME ZONE,
  interviewer TEXT,
  salary_expectation NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_posting_id)
);

-- Enable RLS
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view applications in their companies"
  ON public.candidate_applications
  FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert applications in their companies"
  ON public.candidate_applications
  FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update applications in their companies"
  ON public.candidate_applications
  FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete applications in their companies"
  ON public.candidate_applications
  FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create index for better query performance
CREATE INDEX idx_candidate_applications_job_posting ON public.candidate_applications(job_posting_id);
CREATE INDEX idx_candidate_applications_candidate ON public.candidate_applications(candidate_id);
CREATE INDEX idx_candidate_applications_company ON public.candidate_applications(company_id);