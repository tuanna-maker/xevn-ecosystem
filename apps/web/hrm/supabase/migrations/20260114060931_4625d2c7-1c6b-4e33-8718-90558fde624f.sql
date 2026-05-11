-- Create table to store employee face descriptors for facial recognition
CREATE TABLE public.employee_face_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  face_descriptor JSONB NOT NULL,
  face_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Enable Row Level Security
ALTER TABLE public.employee_face_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view face data from their companies"
ON public.employee_face_data
FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert face data for their companies"
ON public.employee_face_data
FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update face data for their companies"
ON public.employee_face_data
FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete face data for their companies"
ON public.employee_face_data
FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create index for faster lookups
CREATE INDEX idx_employee_face_data_company_id ON public.employee_face_data(company_id);
CREATE INDEX idx_employee_face_data_employee_id ON public.employee_face_data(employee_id);

-- Add trigger for updated_at
CREATE TRIGGER update_employee_face_data_updated_at
BEFORE UPDATE ON public.employee_face_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();