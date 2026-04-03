-- Create employee_contracts table for managing contracts per employee
CREATE TABLE public.employee_contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    contract_code TEXT NOT NULL,
    contract_type TEXT NOT NULL DEFAULT 'Hợp đồng 1 năm',
    effective_date DATE,
    expiry_date DATE,
    salary NUMERIC,
    position TEXT,
    department TEXT,
    work_location TEXT,
    probation_period INTEGER, -- in days
    probation_end_date DATE,
    signing_date DATE,
    signer_name TEXT,
    signer_position TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    file_url TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_employee_contracts_employee_id ON public.employee_contracts(employee_id);
CREATE INDEX idx_employee_contracts_company_id ON public.employee_contracts(company_id);
CREATE INDEX idx_employee_contracts_status ON public.employee_contracts(status);

-- Enable RLS
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view contracts in their companies"
    ON public.employee_contracts FOR SELECT
    USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert contracts in their companies"
    ON public.employee_contracts FOR INSERT
    WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update contracts in their companies"
    ON public.employee_contracts FOR UPDATE
    USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete contracts in their companies"
    ON public.employee_contracts FOR DELETE
    USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Add trigger for updated_at
CREATE TRIGGER update_employee_contracts_updated_at
    BEFORE UPDATE ON public.employee_contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();