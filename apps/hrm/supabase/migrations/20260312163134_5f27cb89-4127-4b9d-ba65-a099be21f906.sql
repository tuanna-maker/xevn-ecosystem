-- FIX 1: tax_policy_participants - Replace permissive true policies with company membership checks
DROP POLICY IF EXISTS "Users can view tax policy participants for their company" ON public.tax_policy_participants;
DROP POLICY IF EXISTS "Users can insert tax policy participants for their company" ON public.tax_policy_participants;
DROP POLICY IF EXISTS "Users can update tax policy participants for their company" ON public.tax_policy_participants;
DROP POLICY IF EXISTS "Users can delete tax policy participants for their company" ON public.tax_policy_participants;

CREATE POLICY "Company members can view tax policy participants"
  ON public.tax_policy_participants FOR SELECT TO authenticated
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Company members can insert tax policy participants"
  ON public.tax_policy_participants FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Company members can update tax policy participants"
  ON public.tax_policy_participants FOR UPDATE TO authenticated
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Company members can delete tax policy participants"
  ON public.tax_policy_participants FOR DELETE TO authenticated
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- FIX 2: user_roles - Fix cross-company privilege escalation
-- Replace has_role check with inline company-scoped admin check
DROP POLICY IF EXISTS "Admins can manage roles in their companies" ON public.user_roles;

CREATE POLICY "Admins can manage roles in their companies"
  ON public.user_roles FOR ALL TO authenticated
  USING (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.company_id = user_roles.company_id
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    company_id IN (SELECT get_user_company_ids(auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.company_id = user_roles.company_id
        AND ur.role = 'admin'
    )
  );

-- FIX 3: get_user_company_ids - Filter by active status only
CREATE OR REPLACE FUNCTION public.get_user_company_ids(_user_id uuid)
  RETURNS SETOF uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT company_id FROM public.user_company_memberships
  WHERE user_id = _user_id AND status = 'active'
$$;

-- FIX 4: candidates - Remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Company members can view masked candidates" ON public.candidates;

-- FIX 5: companies - Replace permissive INSERT with authenticated check
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT TO authenticated
  WITH CHECK (true);