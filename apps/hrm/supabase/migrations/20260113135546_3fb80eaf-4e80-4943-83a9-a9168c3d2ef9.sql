-- Create employee_certificates table
CREATE TABLE public.employee_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  issuing_org TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  certificate_id TEXT,
  score TEXT,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_degrees table
CREATE TABLE public.employee_degrees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year TEXT,
  grade TEXT,
  degree_number TEXT,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_degrees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_certificates
CREATE POLICY "Users can view certificates in their companies"
ON public.employee_certificates FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert certificates in their companies"
ON public.employee_certificates FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update certificates in their companies"
ON public.employee_certificates FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete certificates in their companies"
ON public.employee_certificates FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for employee_degrees
CREATE POLICY "Users can view degrees in their companies"
ON public.employee_degrees FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert degrees in their companies"
ON public.employee_degrees FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update degrees in their companies"
ON public.employee_degrees FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete degrees in their companies"
ON public.employee_degrees FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create indexes
CREATE INDEX idx_employee_certificates_employee_id ON public.employee_certificates(employee_id);
CREATE INDEX idx_employee_certificates_company_id ON public.employee_certificates(company_id);
CREATE INDEX idx_employee_degrees_employee_id ON public.employee_degrees(employee_id);
CREATE INDEX idx_employee_degrees_company_id ON public.employee_degrees(company_id);

-- Create storage bucket for certificate and degree files
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', true);

-- Storage policies for employee-documents bucket
CREATE POLICY "Users can view employee documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can upload employee documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update employee documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete employee documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'employee-documents' AND auth.role() = 'authenticated');

-- Update triggers
CREATE TRIGGER update_employee_certificates_updated_at
BEFORE UPDATE ON public.employee_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_degrees_updated_at
BEFORE UPDATE ON public.employee_degrees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();