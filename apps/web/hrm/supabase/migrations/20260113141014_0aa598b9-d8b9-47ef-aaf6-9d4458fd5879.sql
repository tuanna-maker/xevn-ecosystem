-- Create employee_skills table
CREATE TABLE public.employee_skills (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    company_id UUID NOT NULL,
    category TEXT NOT NULL, -- 'technical', 'soft', 'language', 'tools'
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 50, -- 0-100
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_work_history table
CREATE TABLE public.employee_work_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    company_id UUID NOT NULL,
    event_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'position', -- 'promotion', 'transfer', 'contract', 'position'
    status TEXT NOT NULL DEFAULT 'current', -- 'completed', 'current', 'pending'
    contract_code TEXT,
    department TEXT,
    position TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employee_skills
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_skills
CREATE POLICY "Users can view skills in their companies"
ON public.employee_skills
FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert skills in their companies"
ON public.employee_skills
FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update skills in their companies"
ON public.employee_skills
FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete skills in their companies"
ON public.employee_skills
FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Enable RLS on employee_work_history
ALTER TABLE public.employee_work_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_work_history
CREATE POLICY "Users can view work history in their companies"
ON public.employee_work_history
FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert work history in their companies"
ON public.employee_work_history
FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update work history in their companies"
ON public.employee_work_history
FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete work history in their companies"
ON public.employee_work_history
FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create indexes
CREATE INDEX idx_employee_skills_employee_id ON public.employee_skills(employee_id);
CREATE INDEX idx_employee_skills_company_id ON public.employee_skills(company_id);
CREATE INDEX idx_employee_skills_category ON public.employee_skills(category);
CREATE INDEX idx_employee_work_history_employee_id ON public.employee_work_history(employee_id);
CREATE INDEX idx_employee_work_history_company_id ON public.employee_work_history(company_id);

-- Create triggers for updated_at
CREATE TRIGGER update_employee_skills_updated_at
    BEFORE UPDATE ON public.employee_skills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_work_history_updated_at
    BEFORE UPDATE ON public.employee_work_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();