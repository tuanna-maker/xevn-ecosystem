
-- Company subscriptions table
CREATE TABLE public.company_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_code text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'trial',
  trial_start_date timestamptz NOT NULL DEFAULT now(),
  trial_end_date timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  max_employees integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- Company members can view their subscription
CREATE POLICY "Company members can view subscription"
  ON public.company_subscriptions FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- Platform admins can manage all subscriptions
CREATE POLICY "Platform admins can manage subscriptions"
  ON public.company_subscriptions FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Company owners can update their subscription (for plan changes)
CREATE POLICY "Company owners can update subscription"
  ON public.company_subscriptions FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())))
  WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- Function to create subscription on company creation
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan_id uuid;
BEGIN
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE code = 'starter' AND is_active = true LIMIT 1;
  
  INSERT INTO public.company_subscriptions (company_id, plan_id, plan_code, status, max_employees)
  VALUES (NEW.id, v_plan_id, 'starter', 'trial', 30)
  ON CONFLICT (company_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created_subscription
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();

-- Function to check if subscription is active (trial or paid)
CREATE OR REPLACE FUNCTION public.is_subscription_active(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_subscriptions
    WHERE company_id = _company_id
    AND (
      (status = 'trial' AND trial_end_date > now())
      OR status = 'active'
    )
  )
$$;

-- Function to get company subscription info
CREATE OR REPLACE FUNCTION public.get_company_subscription(_company_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', cs.id,
    'company_id', cs.company_id,
    'plan_code', cs.plan_code,
    'status', cs.status,
    'trial_start_date', cs.trial_start_date,
    'trial_end_date', cs.trial_end_date,
    'subscription_start_date', cs.subscription_start_date,
    'subscription_end_date', cs.subscription_end_date,
    'max_employees', cs.max_employees,
    'plan_name_vi', sp.name_vi,
    'plan_name_en', sp.name_en,
    'plan_price_monthly', sp.price_monthly,
    'plan_price_yearly', sp.price_yearly,
    'plan_features_vi', sp.features_vi,
    'plan_features_en', sp.features_en,
    'is_active', (cs.status = 'active' OR (cs.status = 'trial' AND cs.trial_end_date > now())),
    'trial_days_remaining', GREATEST(0, EXTRACT(DAY FROM cs.trial_end_date - now())::int)
  ) INTO result
  FROM public.company_subscriptions cs
  LEFT JOIN public.subscription_plans sp ON sp.id = cs.plan_id
  WHERE cs.company_id = _company_id;
  
  RETURN result;
END;
$$;

-- Create subscriptions for existing companies that don't have one
INSERT INTO public.company_subscriptions (company_id, plan_code, status, max_employees, trial_end_date)
SELECT c.id, 'starter', 'trial', 30, now() + interval '14 days'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.company_subscriptions cs WHERE cs.company_id = c.id);
