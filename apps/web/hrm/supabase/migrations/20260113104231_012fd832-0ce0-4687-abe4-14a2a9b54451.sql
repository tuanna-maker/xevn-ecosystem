-- Create departments table with hierarchical structure
CREATE TABLE public.departments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    manager_name TEXT,
    manager_email TEXT,
    employee_count INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view departments in their companies"
ON public.departments FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert departments in their companies"
ON public.departments FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update departments in their companies"
ON public.departments FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete departments in their companies"
ON public.departments FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create trigger for updated_at
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_departments_company_id ON public.departments(company_id);
CREATE INDEX idx_departments_parent_id ON public.departments(parent_id);