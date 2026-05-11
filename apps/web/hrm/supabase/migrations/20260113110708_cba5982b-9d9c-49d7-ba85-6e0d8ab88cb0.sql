-- Drop and recreate the INSERT policy as PERMISSIVE (default)
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also need to ensure the user_company_memberships INSERT policy allows first membership
-- Check if there's a restrictive policy issue
DROP POLICY IF EXISTS "Admins can insert members" ON public.user_company_memberships;

CREATE POLICY "Users can insert their own membership when creating company"
ON public.user_company_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR is_company_admin(auth.uid(), company_id)
);