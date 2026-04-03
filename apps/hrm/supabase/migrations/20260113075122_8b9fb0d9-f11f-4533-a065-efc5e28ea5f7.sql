-- Add more fields to user_company_memberships for better member management
ALTER TABLE public.user_company_memberships 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS invited_by TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_company_memberships_email ON public.user_company_memberships(email);

-- Update RLS policies to allow company admins to manage members
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_company_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.user_company_memberships;

-- Create function to check if user is company admin
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_company_memberships 
        WHERE user_id = _user_id 
        AND company_id = _company_id 
        AND role IN ('admin', 'owner')
    )
$$;

-- RLS policies for user_company_memberships
CREATE POLICY "Users can view members in their companies"
ON public.user_company_memberships FOR SELECT
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Admins can insert members"
ON public.user_company_memberships FOR INSERT
WITH CHECK (
    public.is_company_admin(auth.uid(), company_id) 
    OR NOT EXISTS (SELECT 1 FROM public.user_company_memberships WHERE company_id = user_company_memberships.company_id)
);

CREATE POLICY "Admins can update members"
ON public.user_company_memberships FOR UPDATE
USING (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Admins can delete members"
ON public.user_company_memberships FOR DELETE
USING (public.is_company_admin(auth.uid(), company_id) AND user_id != auth.uid());