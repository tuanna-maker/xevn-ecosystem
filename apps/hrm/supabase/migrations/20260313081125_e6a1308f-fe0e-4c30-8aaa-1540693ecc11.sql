-- Allow platform admins to insert companies
CREATE POLICY "Platform admins can insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));
