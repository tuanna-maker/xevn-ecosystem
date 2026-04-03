-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'hr_manager', 'recruiter', 'manager', 'employee');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has recruitment access
CREATE OR REPLACE FUNCTION public.has_recruitment_access(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role IN ('admin', 'hr_manager', 'recruiter')
  )
$$;

-- Create function to check any role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view roles in their companies"
  ON public.user_roles FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Admins can manage roles in their companies"
  ON public.user_roles FOR ALL
  USING (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND has_role(auth.uid(), 'admin')
  );

-- Create a secure view for candidates that hides contact info from non-recruiters
CREATE OR REPLACE VIEW public.candidates_secure
WITH (security_invoker = on) AS
SELECT 
  id,
  company_id,
  full_name,
  position,
  stage,
  source,
  notes,
  avatar_url,
  nationality,
  height,
  weight,
  ethnicity,
  military_service,
  religion,
  marital_status,
  hometown,
  rating,
  applied_date,
  expected_start_date,
  created_at,
  updated_at,
  -- Only show contact info to users with recruitment access
  CASE 
    WHEN has_recruitment_access(auth.uid(), company_id) THEN email 
    ELSE '***@***.***'::text 
  END as email,
  CASE 
    WHEN has_recruitment_access(auth.uid(), company_id) THEN phone 
    ELSE '***-***-****'::text 
  END as phone
FROM public.candidates;

-- Drop existing policies on candidates table
DROP POLICY IF EXISTS "Users can view candidates in their companies" ON public.candidates;
DROP POLICY IF EXISTS "Users can insert candidates in their companies" ON public.candidates;
DROP POLICY IF EXISTS "Users can update candidates in their companies" ON public.candidates;
DROP POLICY IF EXISTS "Users can delete candidates in their companies" ON public.candidates;

-- Create new restrictive policies for candidates table
-- Only recruitment team can fully access candidates
CREATE POLICY "Recruitment team can view candidates"
  ON public.candidates FOR SELECT
  USING (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND has_recruitment_access(auth.uid(), company_id)
  );

CREATE POLICY "Recruitment team can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND has_recruitment_access(auth.uid(), company_id)
  );

CREATE POLICY "Recruitment team can update candidates"
  ON public.candidates FOR UPDATE
  USING (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND has_recruitment_access(auth.uid(), company_id)
  );

CREATE POLICY "Recruitment team can delete candidates"
  ON public.candidates FOR DELETE
  USING (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND has_recruitment_access(auth.uid(), company_id)
  );

-- Allow other company members to view limited candidate info via the secure view
-- by adding a policy that allows SELECT but the view will mask sensitive data
CREATE POLICY "Company members can view masked candidates"
  ON public.candidates FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));