
-- Function to check if user can view all employees (has management role)
CREATE OR REPLACE FUNCTION public.can_view_all_employees(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_user_roles cur
    JOIN public.system_roles sr ON sr.id = cur.role_id
    WHERE cur.user_id = _user_id
      AND cur.company_id = _company_id
      AND sr.code IN ('owner', 'admin', 'hr_manager', 'manager', 'accountant')
  )
$$;

-- Function to get employee_id linked to current user in a company
CREATE OR REPLACE FUNCTION public.get_user_employee_id(_user_id uuid, _company_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT employee_id::uuid
  FROM public.user_company_memberships
  WHERE user_id = _user_id
    AND company_id = _company_id
    AND status = 'active'
  LIMIT 1
$$;

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view employees in their companies" ON public.employees;

-- New SELECT policy: management roles see all, employees see only themselves
CREATE POLICY "Users can view employees in their companies"
ON public.employees
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    -- Management roles can see all employees
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    -- Regular employees can only see their own record
    id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Restrict INSERT/UPDATE/DELETE to management roles only
DROP POLICY IF EXISTS "Users can insert employees in their companies" ON public.employees;
CREATE POLICY "Users can insert employees in their companies"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

DROP POLICY IF EXISTS "Users can update employees in their companies" ON public.employees;
CREATE POLICY "Users can update employees in their companies"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

DROP POLICY IF EXISTS "Users can delete employees in their companies" ON public.employees;
CREATE POLICY "Users can delete employees in their companies"
ON public.employees
FOR DELETE
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);
