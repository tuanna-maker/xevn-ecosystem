
-- 1. Drop and recreate views with access control
DROP VIEW IF EXISTS public.platform_users_view;
CREATE VIEW public.platform_users_view
WITH (security_invoker = true)
AS
SELECT 
  p.id AS profile_id, p.user_id, p.email, p.full_name, p.avatar_url, p.phone,
  p.job_title, p.onboarding_completed, p.created_at,
  (SELECT count(*) FROM public.user_company_memberships ucm WHERE ucm.user_id = p.user_id) AS company_count,
  (SELECT string_agg(c.name, ', ') FROM public.user_company_memberships ucm JOIN public.companies c ON c.id = ucm.company_id WHERE ucm.user_id = p.user_id) AS company_names
FROM public.profiles p
WHERE public.is_platform_admin(auth.uid());

DROP VIEW IF EXISTS public.platform_companies_view;
CREATE VIEW public.platform_companies_view
WITH (security_invoker = true)
AS
SELECT 
  c.id, c.name, c.code, c.logo_url, c.address, c.phone, c.email, c.tax_code,
  c.website, c.industry, c.employee_count, c.founded_date, c.description,
  c.status, c.created_at, c.updated_at,
  (SELECT count(*) FROM public.user_company_memberships ucm WHERE ucm.company_id = c.id) AS member_count,
  (SELECT count(*) FROM public.employees e WHERE e.company_id = c.id AND e.status = 'working') AS active_employee_count
FROM public.companies c
WHERE public.is_platform_admin(auth.uid());

DROP VIEW IF EXISTS public.candidates_secure;
CREATE VIEW public.candidates_secure
WITH (security_invoker = true)
AS
SELECT 
  id, company_id, full_name, position, stage, source, notes, avatar_url,
  nationality, height, weight, ethnicity, military_service, religion,
  marital_status, hometown, rating, applied_date, expected_start_date,
  created_at, updated_at,
  CASE WHEN public.has_recruitment_access(auth.uid(), company_id) THEN email ELSE '***@***.***' END AS email,
  CASE WHEN public.has_recruitment_access(auth.uid(), company_id) THEN phone ELSE '***-***-****' END AS phone
FROM public.candidates
WHERE company_id IN (SELECT public.get_user_company_ids(auth.uid()));

-- 2. Fix swapped arguments in evaluation tables RLS
DROP POLICY IF EXISTS "Users can view evaluation criteria of their companies" ON public.evaluation_criteria;
DROP POLICY IF EXISTS "Users can insert evaluation criteria for their companies" ON public.evaluation_criteria;
DROP POLICY IF EXISTS "Users can update evaluation criteria of their companies" ON public.evaluation_criteria;
DROP POLICY IF EXISTS "Users can delete evaluation criteria of their companies" ON public.evaluation_criteria;

CREATE POLICY "Users can view evaluation criteria of their companies" ON public.evaluation_criteria FOR SELECT TO authenticated USING (public.user_belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Users can insert evaluation criteria for their companies" ON public.evaluation_criteria FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Users can update evaluation criteria of their companies" ON public.evaluation_criteria FOR UPDATE TO authenticated USING (public.user_belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Users can delete evaluation criteria of their companies" ON public.evaluation_criteria FOR DELETE TO authenticated USING (public.user_belongs_to_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users can view candidate evaluations of their companies" ON public.candidate_evaluations;
DROP POLICY IF EXISTS "Users can insert candidate evaluations for their companies" ON public.candidate_evaluations;
DROP POLICY IF EXISTS "Users can update candidate evaluations of their companies" ON public.candidate_evaluations;
DROP POLICY IF EXISTS "Users can delete candidate evaluations of their companies" ON public.candidate_evaluations;

CREATE POLICY "Users can view candidate evaluations of their companies" ON public.candidate_evaluations FOR SELECT TO authenticated USING (public.user_belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Users can insert candidate evaluations for their companies" ON public.candidate_evaluations FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Users can update candidate evaluations of their companies" ON public.candidate_evaluations FOR UPDATE TO authenticated USING (public.user_belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Users can delete candidate evaluations of their companies" ON public.candidate_evaluations FOR DELETE TO authenticated USING (public.user_belongs_to_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users can view evaluation scores via evaluations" ON public.candidate_evaluation_scores;
DROP POLICY IF EXISTS "Users can insert evaluation scores via evaluations" ON public.candidate_evaluation_scores;
DROP POLICY IF EXISTS "Users can update evaluation scores via evaluations" ON public.candidate_evaluation_scores;
DROP POLICY IF EXISTS "Users can delete evaluation scores via evaluations" ON public.candidate_evaluation_scores;

CREATE POLICY "Users can view evaluation scores via evaluations" ON public.candidate_evaluation_scores FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.candidate_evaluations ce WHERE ce.id = evaluation_id AND public.user_belongs_to_company(auth.uid(), ce.company_id)));
CREATE POLICY "Users can insert evaluation scores via evaluations" ON public.candidate_evaluation_scores FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.candidate_evaluations ce WHERE ce.id = evaluation_id AND public.user_belongs_to_company(auth.uid(), ce.company_id)));
CREATE POLICY "Users can update evaluation scores via evaluations" ON public.candidate_evaluation_scores FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.candidate_evaluations ce WHERE ce.id = evaluation_id AND public.user_belongs_to_company(auth.uid(), ce.company_id)));
CREATE POLICY "Users can delete evaluation scores via evaluations" ON public.candidate_evaluation_scores FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.candidate_evaluations ce WHERE ce.id = evaluation_id AND public.user_belongs_to_company(auth.uid(), ce.company_id)));

-- 3. Update user_belongs_to_company to check active status
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(_user_id uuid, _company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_company_memberships 
        WHERE user_id = _user_id AND company_id = _company_id AND status = 'active'
    )
$$;
