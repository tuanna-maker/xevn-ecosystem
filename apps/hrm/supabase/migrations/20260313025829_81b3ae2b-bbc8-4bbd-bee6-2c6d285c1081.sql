
-- Update create_company_with_owner to also assign new permission role
CREATE OR REPLACE FUNCTION public.create_company_with_owner(p_name text, p_industry text DEFAULT NULL::text, p_employee_count integer DEFAULT 0, p_phone text DEFAULT NULL::text, p_website text DEFAULT NULL::text, p_user_id uuid DEFAULT NULL::uuid, p_user_email text DEFAULT NULL::text, p_user_full_name text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
  v_owner_role_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Get owner role id
  SELECT id INTO v_owner_role_id FROM public.system_roles WHERE code = 'owner';

  -- Create company
  INSERT INTO public.companies (name, industry, employee_count, phone, website, status)
  VALUES (p_name, p_industry, p_employee_count, p_phone, p_website, 'active')
  RETURNING id INTO v_company_id;

  -- Add user as owner in memberships
  INSERT INTO public.user_company_memberships (
    user_id, company_id, role, is_primary, email, full_name, status, invited_by
  )
  VALUES (
    v_user_id, v_company_id, 'owner', true, p_user_email, p_user_full_name, 'active', 'Self'
  );

  -- Assign owner role in new permission system
  IF v_owner_role_id IS NOT NULL THEN
    INSERT INTO public.company_user_roles (user_id, company_id, role_id)
    VALUES (v_user_id, v_company_id, v_owner_role_id)
    ON CONFLICT (user_id, company_id, role_id) DO NOTHING;
  END IF;

  RETURN v_company_id;
END;
$function$;
