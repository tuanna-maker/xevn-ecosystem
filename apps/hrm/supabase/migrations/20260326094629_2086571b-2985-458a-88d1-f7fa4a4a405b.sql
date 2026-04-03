
-- =============================================
-- 1. PROCESSES & POLICIES TABLE
-- =============================================
CREATE TABLE public.company_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'process', -- 'process' or 'policy'
  name TEXT NOT NULL,
  code TEXT,
  category TEXT,
  department TEXT,
  description TEXT,
  content TEXT, -- Rich text content
  steps JSONB, -- For process steps
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, archived, review
  effective_date DATE,
  expiry_date DATE,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view processes of their company"
  ON public.company_processes FOR SELECT TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users with permission can insert processes"
  ON public.company_processes FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users with permission can update processes"
  ON public.company_processes FOR UPDATE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users with permission can delete processes"
  ON public.company_processes FOR DELETE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- =============================================
-- 2. INTERNAL SERVICE REQUESTS TABLE
-- =============================================
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'meal', 'vehicle', 'supply'
  employee_id UUID REFERENCES public.employees(id),
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  department TEXT,
  
  -- Common fields
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed, cancelled
  notes TEXT,
  
  -- Meal specific
  meal_type TEXT, -- 'lunch', 'dinner', 'breakfast'
  meal_date DATE,
  meal_quantity INTEGER DEFAULT 1,
  
  -- Vehicle specific
  vehicle_purpose TEXT,
  vehicle_destination TEXT,
  vehicle_date DATE,
  vehicle_time_start TEXT,
  vehicle_time_end TEXT,
  vehicle_passengers INTEGER,
  
  -- Supply specific
  supply_items JSONB, -- [{name, quantity, unit, note}]
  supply_urgency TEXT, -- 'normal', 'urgent'
  
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service requests of their company"
  ON public.service_requests FOR SELECT TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert service requests"
  ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update service requests of their company"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete service requests of their company"
  ON public.service_requests FOR DELETE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- =============================================
-- 3. TOOLS & EQUIPMENT TABLE
-- =============================================
CREATE TABLE public.tools_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- 'tool', 'equipment', 'device', 'furniture'
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  specifications TEXT,
  unit TEXT DEFAULT 'cái', -- đơn vị tính
  quantity INTEGER DEFAULT 1,
  available_quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good', -- good, fair, poor, damaged
  location TEXT, -- storage location
  purchase_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  warranty_expiry DATE,
  status TEXT NOT NULL DEFAULT 'available', -- available, in_use, maintenance, disposed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tools_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tools of their company"
  ON public.tools_equipment FOR SELECT TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert tools"
  ON public.tools_equipment FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update tools"
  ON public.tools_equipment FOR UPDATE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete tools"
  ON public.tools_equipment FOR DELETE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- =============================================
-- 4. TOOL ASSIGNMENTS TABLE (cấp phát / thu hồi)
-- =============================================
CREATE TABLE public.tool_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools_equipment(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id),
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  department TEXT,
  assignment_type TEXT NOT NULL DEFAULT 'assign', -- 'assign' or 'return'
  quantity INTEGER DEFAULT 1,
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  condition_on_assign TEXT,
  condition_on_return TEXT,
  notes TEXT,
  approved_by UUID,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, completed, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tool assignments of their company"
  ON public.tool_assignments FOR SELECT TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert tool assignments"
  ON public.tool_assignments FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update tool assignments"
  ON public.tool_assignments FOR UPDATE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete tool assignments"
  ON public.tool_assignments FOR DELETE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- Triggers for updated_at
CREATE TRIGGER update_company_processes_updated_at BEFORE UPDATE ON public.company_processes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_equipment_updated_at BEFORE UPDATE ON public.tools_equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tool_assignments_updated_at BEFORE UPDATE ON public.tool_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
