-- Allow company admins (owner/admin) to insert role_permissions
CREATE POLICY "Admins can insert role permissions"
ON public.role_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_user_roles cur
    JOIN public.system_roles sr ON sr.id = cur.role_id
    WHERE cur.user_id = auth.uid()
      AND sr.code IN ('owner', 'admin')
  )
);

-- Allow company admins (owner/admin) to delete role_permissions
CREATE POLICY "Admins can delete role permissions"
ON public.role_permissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_user_roles cur
    JOIN public.system_roles sr ON sr.id = cur.role_id
    WHERE cur.user_id = auth.uid()
      AND sr.code IN ('owner', 'admin')
  )
);