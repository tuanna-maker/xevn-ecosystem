-- Create a security definer function for platform admin to create companies
CREATE OR REPLACE FUNCTION public.platform_admin_create_company(
  p_name text,
  p_industry text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_tax_code text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Only platform admins
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: not a platform admin';
  END IF;

  INSERT INTO public.companies (name, industry, phone, email, website, address, tax_code, status)
  VALUES (p_name, p_industry, p_phone, p_email, p_website, p_address, p_tax_code, 'active')
  RETURNING id INTO v_company_id;

  -- Log audit
  PERFORM public.log_platform_audit(
    'company_created', 'company', v_company_id::text, p_name
  );

  RETURN json_build_object('id', v_company_id, 'name', p_name);
END;
$$;