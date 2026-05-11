-- 1. Create companies table
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_code TEXT,
    website TEXT,
    industry TEXT,
    employee_count INTEGER DEFAULT 0,
    founded_date DATE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at on companies
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create a default company for existing data
INSERT INTO public.companies (id, name, code, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Company', 'DEFAULT', 'active');

-- 3. Add company_id to candidates table
ALTER TABLE public.candidates 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

UPDATE public.candidates SET company_id = '00000000-0000-0000-0000-000000000001' WHERE company_id IS NULL;

ALTER TABLE public.candidates ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.candidates ALTER COLUMN company_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- 4. Add company_id to contracts table
ALTER TABLE public.contracts 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

UPDATE public.contracts SET company_id = '00000000-0000-0000-0000-000000000001' WHERE company_id IS NULL;

ALTER TABLE public.contracts ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN company_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- 5. Add company_id to headcount_proposals table
ALTER TABLE public.headcount_proposals 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

UPDATE public.headcount_proposals SET company_id = '00000000-0000-0000-0000-000000000001' WHERE company_id IS NULL;

ALTER TABLE public.headcount_proposals ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.headcount_proposals ALTER COLUMN company_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- 6. Add company_id to insurance table
ALTER TABLE public.insurance 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

UPDATE public.insurance SET company_id = '00000000-0000-0000-0000-000000000001' WHERE company_id IS NULL;

ALTER TABLE public.insurance ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.insurance ALTER COLUMN company_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- 7. Drop old RLS policies on candidates
DROP POLICY IF EXISTS "Anyone can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can delete candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can update candidates" ON public.candidates;

-- 8. Drop old RLS policies on contracts
DROP POLICY IF EXISTS "Anyone can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can delete contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON public.contracts;

-- 9. Drop old RLS policies on headcount_proposals
DROP POLICY IF EXISTS "Anyone can view headcount proposals" ON public.headcount_proposals;
DROP POLICY IF EXISTS "Anyone can delete headcount proposals" ON public.headcount_proposals;
DROP POLICY IF EXISTS "Anyone can insert headcount proposals" ON public.headcount_proposals;
DROP POLICY IF EXISTS "Anyone can update headcount proposals" ON public.headcount_proposals;

-- 10. Drop old RLS policies on insurance
DROP POLICY IF EXISTS "Anyone can view insurance" ON public.insurance;
DROP POLICY IF EXISTS "Anyone can delete insurance" ON public.insurance;
DROP POLICY IF EXISTS "Anyone can insert insurance" ON public.insurance;
DROP POLICY IF EXISTS "Anyone can update insurance" ON public.insurance;

-- 11. Create user_company_memberships table to link users to companies
CREATE TABLE public.user_company_memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, company_id)
);

ALTER TABLE public.user_company_memberships ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_user_company_memberships_updated_at
    BEFORE UPDATE ON public.user_company_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Create security definer function to get user's companies
CREATE OR REPLACE FUNCTION public.get_user_company_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id FROM public.user_company_memberships WHERE user_id = _user_id
$$;

-- 13. Create security definer function to check if user belongs to company
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_company_memberships 
        WHERE user_id = _user_id AND company_id = _company_id
    )
$$;

-- 14. RLS policies for companies
CREATE POLICY "Users can view their companies"
ON public.companies FOR SELECT
USING (id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update their companies"
ON public.companies FOR UPDATE
USING (id IN (SELECT public.get_user_company_ids(auth.uid())));

-- 15. RLS policies for user_company_memberships
CREATE POLICY "Users can view their own memberships"
ON public.user_company_memberships FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships"
ON public.user_company_memberships FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 16. New RLS policies for candidates (filtered by company_id)
CREATE POLICY "Users can view candidates in their companies"
ON public.candidates FOR SELECT
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert candidates in their companies"
ON public.candidates FOR INSERT
WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update candidates in their companies"
ON public.candidates FOR UPDATE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete candidates in their companies"
ON public.candidates FOR DELETE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- 17. New RLS policies for contracts (filtered by company_id)
CREATE POLICY "Users can view contracts in their companies"
ON public.contracts FOR SELECT
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert contracts in their companies"
ON public.contracts FOR INSERT
WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update contracts in their companies"
ON public.contracts FOR UPDATE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete contracts in their companies"
ON public.contracts FOR DELETE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- 18. New RLS policies for headcount_proposals (filtered by company_id)
CREATE POLICY "Users can view proposals in their companies"
ON public.headcount_proposals FOR SELECT
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert proposals in their companies"
ON public.headcount_proposals FOR INSERT
WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update proposals in their companies"
ON public.headcount_proposals FOR UPDATE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete proposals in their companies"
ON public.headcount_proposals FOR DELETE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- 19. New RLS policies for insurance (filtered by company_id)
CREATE POLICY "Users can view insurance in their companies"
ON public.insurance FOR SELECT
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert insurance in their companies"
ON public.insurance FOR INSERT
WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update insurance in their companies"
ON public.insurance FOR UPDATE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete insurance in their companies"
ON public.insurance FOR DELETE
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- 20. Create indexes for better performance
CREATE INDEX idx_candidates_company_id ON public.candidates(company_id);
CREATE INDEX idx_contracts_company_id ON public.contracts(company_id);
CREATE INDEX idx_headcount_proposals_company_id ON public.headcount_proposals(company_id);
CREATE INDEX idx_insurance_company_id ON public.insurance(company_id);
CREATE INDEX idx_user_company_memberships_user_id ON public.user_company_memberships(user_id);
CREATE INDEX idx_user_company_memberships_company_id ON public.user_company_memberships(company_id);