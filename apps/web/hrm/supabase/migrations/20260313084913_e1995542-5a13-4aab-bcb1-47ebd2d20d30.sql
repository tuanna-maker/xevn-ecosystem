
CREATE OR REPLACE FUNCTION public.get_all_company_admins()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  company_id uuid,
  role text,
  email text,
  full_name text,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only platform admins can call this
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    ucm.id,
    ucm.user_id,
    ucm.company_id,
    ucm.role,
    ucm.email,
    ucm.full_name,
    ucm.status,
    ucm.created_at
  FROM public.user_company_memberships ucm
  WHERE ucm.role IN ('owner', 'admin', 'hr_manager')
    AND ucm.status = 'active'
  ORDER BY ucm.created_at DESC;
END;
$$;
