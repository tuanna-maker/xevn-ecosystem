-- FIX 6: user_company_memberships INSERT - Only allow admin to invite, or self-insert only as 'member' role during onboarding
DROP POLICY IF EXISTS "Users can insert their own membership when creating company" ON public.user_company_memberships;

-- Allow company admins to insert memberships (invitations)
-- Allow self-insert ONLY via the create_company_with_owner function (which is SECURITY DEFINER)
-- Regular users cannot self-join companies
CREATE POLICY "Admins can invite members to their companies"
  ON public.user_company_memberships FOR INSERT TO authenticated
  WITH CHECK (is_company_admin(auth.uid(), company_id));

-- FIX 7: Recreate views with SECURITY INVOKER to respect RLS

-- platform_users_view - Only platform admins should access
DROP VIEW IF EXISTS public.platform_users_view;
CREATE VIEW public.platform_users_view WITH (security_invoker = true) AS
SELECT 
  id AS profile_id,
  user_id,
  email,
  full_name,
  avatar_url,
  phone,
  job_title,
  onboarding_completed,
  created_at,
  (SELECT count(*) FROM user_company_memberships ucm WHERE ucm.user_id = p.user_id) AS company_count,
  (SELECT string_agg(c.name, ', ') FROM user_company_memberships ucm JOIN companies c ON c.id = ucm.company_id WHERE ucm.user_id = p.user_id) AS company_names
FROM profiles p;

-- platform_companies_view - Only platform admins should access
DROP VIEW IF EXISTS public.platform_companies_view;
CREATE VIEW public.platform_companies_view WITH (security_invoker = true) AS
SELECT 
  id, name, code, logo_url, address, phone, email, tax_code, website,
  industry, employee_count, founded_date, description, status, created_at, updated_at,
  (SELECT count(*) FROM user_company_memberships ucm WHERE ucm.company_id = c.id) AS member_count,
  (SELECT count(*) FROM employees e WHERE e.company_id = c.id AND e.status = 'working') AS active_employee_count
FROM companies c;

-- candidates_secure - Respect RLS from candidates table
DROP VIEW IF EXISTS public.candidates_secure;
CREATE VIEW public.candidates_secure WITH (security_invoker = true) AS
SELECT 
  id, company_id, full_name, position, stage, source, notes, avatar_url,
  nationality, height, weight, ethnicity, military_service, religion, marital_status,
  hometown, rating, applied_date, expected_start_date, created_at, updated_at,
  CASE WHEN has_recruitment_access(auth.uid(), company_id) THEN email ELSE '***@***.***' END AS email,
  CASE WHEN has_recruitment_access(auth.uid(), company_id) THEN phone ELSE '***-***-****' END AS phone
FROM candidates;