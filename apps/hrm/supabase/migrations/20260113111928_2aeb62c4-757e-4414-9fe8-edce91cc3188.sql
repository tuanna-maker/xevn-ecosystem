-- Create a function to handle company creation securely
-- This bypasses RLS using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  p_name TEXT,
  p_industry TEXT DEFAULT NULL,
  p_employee_count INTEGER DEFAULT 0,
  p_phone TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_user_full_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
BEGIN
  -- Use provided user_id or get from auth.uid()
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Create company
  INSERT INTO public.companies (name, industry, employee_count, phone, website, status)
  VALUES (p_name, p_industry, p_employee_count, p_phone, p_website, 'active')
  RETURNING id INTO v_company_id;

  -- Add user as owner
  INSERT INTO public.user_company_memberships (
    user_id, 
    company_id, 
    role, 
    is_primary, 
    email, 
    full_name, 
    status, 
    invited_by
  )
  VALUES (
    v_user_id, 
    v_company_id, 
    'owner', 
    true, 
    p_user_email, 
    p_user_full_name, 
    'active', 
    'Self'
  );

  RETURN v_company_id;
END;
$$;