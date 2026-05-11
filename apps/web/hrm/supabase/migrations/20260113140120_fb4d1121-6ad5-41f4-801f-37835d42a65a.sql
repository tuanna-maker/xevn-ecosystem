-- Create employee_family_members table
CREATE TABLE public.employee_family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  full_name TEXT NOT NULL,
  birth_year TEXT,
  occupation TEXT,
  phone TEXT,
  address TEXT,
  is_dependant BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_emergency_contacts table
CREATE TABLE public.employee_emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_resume_files table
CREATE TABLE public.employee_resume_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  file_size TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_resume_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_family_members
CREATE POLICY "Users can view family members in their companies"
ON public.employee_family_members FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert family members in their companies"
ON public.employee_family_members FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update family members in their companies"
ON public.employee_family_members FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete family members in their companies"
ON public.employee_family_members FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for employee_emergency_contacts
CREATE POLICY "Users can view emergency contacts in their companies"
ON public.employee_emergency_contacts FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert emergency contacts in their companies"
ON public.employee_emergency_contacts FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update emergency contacts in their companies"
ON public.employee_emergency_contacts FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete emergency contacts in their companies"
ON public.employee_emergency_contacts FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for employee_resume_files
CREATE POLICY "Users can view resume files in their companies"
ON public.employee_resume_files FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert resume files in their companies"
ON public.employee_resume_files FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update resume files in their companies"
ON public.employee_resume_files FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete resume files in their companies"
ON public.employee_resume_files FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create indexes
CREATE INDEX idx_employee_family_members_employee_id ON public.employee_family_members(employee_id);
CREATE INDEX idx_employee_family_members_company_id ON public.employee_family_members(company_id);
CREATE INDEX idx_employee_emergency_contacts_employee_id ON public.employee_emergency_contacts(employee_id);
CREATE INDEX idx_employee_emergency_contacts_company_id ON public.employee_emergency_contacts(company_id);
CREATE INDEX idx_employee_resume_files_employee_id ON public.employee_resume_files(employee_id);
CREATE INDEX idx_employee_resume_files_company_id ON public.employee_resume_files(company_id);

-- Update triggers
CREATE TRIGGER update_employee_family_members_updated_at
BEFORE UPDATE ON public.employee_family_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_emergency_contacts_updated_at
BEFORE UPDATE ON public.employee_emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_resume_files_updated_at
BEFORE UPDATE ON public.employee_resume_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();