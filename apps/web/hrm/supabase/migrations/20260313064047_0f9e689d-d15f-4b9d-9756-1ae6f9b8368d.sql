
-- View for platform admin to see all company subscriptions with company info
CREATE OR REPLACE VIEW public.platform_subscriptions_view
WITH (security_invoker = true)
AS
SELECT 
  cs.id,
  cs.company_id,
  c.name as company_name,
  c.industry,
  c.status as company_status,
  c.created_at as company_created_at,
  cs.plan_id,
  cs.plan_code,
  cs.status as subscription_status,
  cs.max_employees,
  cs.trial_start_date,
  cs.trial_end_date,
  cs.subscription_start_date,
  cs.subscription_end_date,
  cs.created_at,
  cs.updated_at,
  sp.name_vi as plan_name_vi,
  sp.name_en as plan_name_en,
  sp.price_monthly,
  CASE 
    WHEN cs.status = 'active' THEN true
    WHEN cs.status = 'trial' AND cs.trial_end_date > now() THEN true
    ELSE false
  END as is_active,
  CASE 
    WHEN cs.status = 'trial' THEN GREATEST(0, EXTRACT(DAY FROM cs.trial_end_date - now())::int)
    ELSE null
  END as trial_days_remaining
FROM public.company_subscriptions cs
JOIN public.companies c ON c.id = cs.company_id
LEFT JOIN public.subscription_plans sp ON sp.id = cs.plan_id;

-- RLS policy: only platform admins can see this view
CREATE POLICY "Platform admins can view all subscriptions"
ON public.company_subscriptions
FOR SELECT
TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- Allow platform admins to update subscriptions
CREATE POLICY "Platform admins can update subscriptions"
ON public.company_subscriptions
FOR UPDATE
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
