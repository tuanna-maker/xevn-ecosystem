-- Create a security definer function to check if user is any company admin
CREATE OR REPLACE FUNCTION public.is_any_company_admin(_user_id uuid)
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
      AND sr.code IN ('owner', 'admin')
  )
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Admins can insert role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can delete role permissions" ON public.role_permissions;

-- Recreate with security definer function
CREATE POLICY "Admins can insert role permissions"
ON public.role_permissions
FOR INSERT
TO authenticated
WITH CHECK (public.is_any_company_admin(auth.uid()));

CREATE POLICY "Admins can delete role permissions"
ON public.role_permissions
FOR DELETE
TO authenticated
USING (public.is_any_company_admin(auth.uid()));