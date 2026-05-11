
-- Create a materialized-like stats function for platform admin
-- Uses count estimation for large tables, exact for filtered queries
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
  v_total_companies bigint;
  v_active_companies bigint;
  v_new_companies_month bigint;
  v_total_users bigint;
  v_new_users_month bigint;
  v_total_employees bigint;
  v_active_employees bigint;
  v_month_start date;
BEGIN
  -- Only platform admins can call this
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RETURN json_build_object('error', 'unauthorized');
  END IF;

  v_month_start := date_trunc('month', current_date)::date;

  SELECT count(*), count(*) FILTER (WHERE status = 'active')
    INTO v_total_companies, v_active_companies
    FROM public.companies;

  SELECT count(*) INTO v_new_companies_month
    FROM public.companies WHERE created_at >= v_month_start;

  SELECT count(*) INTO v_total_users FROM public.profiles;

  SELECT count(*) INTO v_new_users_month
    FROM public.profiles WHERE created_at >= v_month_start;

  SELECT count(*), count(*) FILTER (WHERE status = 'working' OR status = 'active')
    INTO v_total_employees, v_active_employees
    FROM public.employees WHERE deleted_at IS NULL;

  RETURN json_build_object(
    'totalCompanies', v_total_companies,
    'activeCompanies', v_active_companies,
    'newCompaniesThisMonth', v_new_companies_month,
    'totalUsers', v_total_users,
    'newUsersThisMonth', v_new_users_month,
    'totalEmployees', v_total_employees,
    'activeEmployees', v_active_employees
  );
END;
$$;
