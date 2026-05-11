
-- Platform admins table - stores super admin user IDs
CREATE TABLE public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by TEXT,
  UNIQUE(user_id)
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Only platform admins can read this table
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
  )
$$;

-- RLS: only platform admins can select
CREATE POLICY "Platform admins can read"
ON public.platform_admins
FOR SELECT
TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- View for platform admin: all companies with member counts
CREATE OR REPLACE VIEW public.platform_companies_view AS
SELECT 
  c.*,
  (SELECT COUNT(*) FROM public.user_company_memberships ucm WHERE ucm.company_id = c.id) as member_count,
  (SELECT COUNT(*) FROM public.employees e WHERE e.company_id = c.id AND e.status = 'working') as active_employee_count
FROM public.companies c;

-- View for platform admin: all users with their profiles
CREATE OR REPLACE VIEW public.platform_users_view AS
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

-- RLS on views via underlying table policies (views inherit)
-- Grant select on views to authenticated
GRANT SELECT ON public.platform_companies_view TO authenticated;
GRANT SELECT ON public.platform_users_view TO authenticated;
