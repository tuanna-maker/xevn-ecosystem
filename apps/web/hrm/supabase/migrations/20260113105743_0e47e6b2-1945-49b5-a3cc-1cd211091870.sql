-- Allow authenticated users to create companies
CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete their companies (admins only)
CREATE POLICY "Admins can delete their companies"
ON public.companies
FOR DELETE
USING (is_company_admin(auth.uid(), id));