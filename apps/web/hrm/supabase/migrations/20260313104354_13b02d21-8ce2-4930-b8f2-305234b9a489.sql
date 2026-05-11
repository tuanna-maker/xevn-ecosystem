
-- Create employee_assets table
CREATE TABLE public.employee_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_code TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  specifications TEXT,
  condition TEXT NOT NULL DEFAULT 'good',
  assigned_date DATE,
  return_date DATE,
  value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create employee_kpis table
CREATE TABLE public.employee_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'performance',
  target_value NUMERIC NOT NULL DEFAULT 0,
  actual_value NUMERIC,
  weight NUMERIC NOT NULL DEFAULT 1,
  unit TEXT,
  score NUMERIC,
  status TEXT NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_kpis ENABLE ROW LEVEL SECURITY;

-- RLS for employee_assets
CREATE POLICY "Users can view assets in their companies"
ON public.employee_assets FOR SELECT TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

CREATE POLICY "Management can insert assets"
ON public.employee_assets FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

CREATE POLICY "Management can update assets"
ON public.employee_assets FOR UPDATE TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

CREATE POLICY "Management can delete assets"
ON public.employee_assets FOR DELETE TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

-- RLS for employee_kpis
CREATE POLICY "Users can view KPIs in their companies"
ON public.employee_kpis FOR SELECT TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

CREATE POLICY "Management can insert KPIs"
ON public.employee_kpis FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

CREATE POLICY "Management can update KPIs"
ON public.employee_kpis FOR UPDATE TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

CREATE POLICY "Management can delete KPIs"
ON public.employee_kpis FOR DELETE TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND public.can_view_all_employees(auth.uid(), company_id)
);

-- Add updated_at triggers
CREATE TRIGGER update_employee_assets_updated_at
  BEFORE UPDATE ON public.employee_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_kpis_updated_at
  BEFORE UPDATE ON public.employee_kpis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
