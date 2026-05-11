-- Add INSERT policy for platform admins
CREATE POLICY "Platform admins can insert"
  ON public.platform_admins FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Add DELETE policy for platform admins
CREATE POLICY "Platform admins can delete"
  ON public.platform_admins FOR DELETE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- Add UPDATE policy for platform admins
CREATE POLICY "Platform admins can update"
  ON public.platform_admins FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));