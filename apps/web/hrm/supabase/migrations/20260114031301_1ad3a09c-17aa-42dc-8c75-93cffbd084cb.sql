-- Create table for candidate resume files
CREATE TABLE public.candidate_resume_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_candidate_resume_files_candidate_id ON public.candidate_resume_files(candidate_id);
CREATE INDEX idx_candidate_resume_files_company_id ON public.candidate_resume_files(company_id);

-- Enable RLS
ALTER TABLE public.candidate_resume_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view candidate files in their companies"
ON public.candidate_resume_files FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert candidate files in their companies"
ON public.candidate_resume_files FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update candidate files in their companies"
ON public.candidate_resume_files FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete candidate files in their companies"
ON public.candidate_resume_files FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create storage bucket for candidate resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-resumes', 'candidate-resumes', true);

-- Storage policies for candidate resumes
CREATE POLICY "Anyone can view candidate resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-resumes');

CREATE POLICY "Authenticated users can upload candidate resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'candidate-resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update candidate resumes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'candidate-resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete candidate resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'candidate-resumes' AND auth.role() = 'authenticated');