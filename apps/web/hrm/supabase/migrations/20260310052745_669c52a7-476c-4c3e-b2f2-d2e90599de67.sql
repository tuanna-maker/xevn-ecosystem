
-- Fix security definer views by recreating as security invoker
DROP VIEW IF EXISTS public.platform_companies_view;
DROP VIEW IF EXISTS public.platform_users_view;

CREATE VIEW public.platform_companies_view
WITH (security_invoker = true)
AS
SELECT 
  c.*,
  (SELECT COUNT(*) FROM public.user_company_memberships ucm WHERE ucm.company_id = c.id) as member_count,
  (SELECT COUNT(*) FROM public.employees e WHERE e.company_id = c.id AND e.status = 'working') as active_employee_count
FROM public.companies c;

CREATE VIEW public.platform_users_view
WITH (security_invoker = true)
AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.phone,
  p.job_title,
  p.onboarding_completed,
  p.created_at,
  (SELECT COUNT(*) FROM public.user_company_memberships ucm WHERE ucm.user_id = p.user_id) as company_count,
  (SELECT string_agg(c.name, ', ') FROM public.user_company_memberships ucm JOIN public.companies c ON c.id = ucm.company_id WHERE ucm.user_id = p.user_id) as company_names
FROM public.profiles p;

GRANT SELECT ON public.platform_companies_view TO authenticated;
GRANT SELECT ON public.platform_users_view TO authenticated;
