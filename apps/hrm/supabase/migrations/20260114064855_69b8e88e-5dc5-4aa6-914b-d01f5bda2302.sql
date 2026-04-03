-- =============================================
-- 1. LEAVE REQUESTS TABLE (Đơn nghỉ phép)
-- =============================================
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  leave_type TEXT NOT NULL DEFAULT 'annual', -- annual, sick, unpaid, maternity, paternity, marriage, bereavement, other
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL DEFAULT 1,
  reason TEXT,
  handover_to TEXT,
  handover_tasks TEXT,
  approver_id UUID REFERENCES public.employees(id),
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  attachment_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leave requests in their companies" ON public.leave_requests
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can insert leave requests in their companies" ON public.leave_requests
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can update leave requests in their companies" ON public.leave_requests
  FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can delete leave requests in their companies" ON public.leave_requests
  FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- =============================================
-- 2. LATE/EARLY REQUESTS TABLE (Đơn đi muộn/về sớm)
-- =============================================
CREATE TABLE public.late_early_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  request_date DATE NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'late', -- late, early, both
  late_time TIME,
  late_minutes INTEGER DEFAULT 0,
  early_time TIME,
  early_minutes INTEGER DEFAULT 0,
  reason TEXT NOT NULL,
  approver_id UUID REFERENCES public.employees(id),
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.late_early_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view late_early requests in their companies" ON public.late_early_requests
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can insert late_early requests in their companies" ON public.late_early_requests
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can update late_early requests in their companies" ON public.late_early_requests
  FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can delete late_early requests in their companies" ON public.late_early_requests
  FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- =============================================
-- 3. SHIFT CHANGE REQUESTS TABLE (Đơn đổi ca)
-- =============================================
CREATE TABLE public.shift_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  change_date DATE NOT NULL,
  change_type TEXT NOT NULL DEFAULT 'change', -- change, swap
  current_shift TEXT NOT NULL,
  current_shift_time TEXT,
  requested_shift TEXT NOT NULL,
  requested_shift_time TEXT,
  swap_with_employee_id UUID REFERENCES public.employees(id),
  swap_with_employee_name TEXT,
  swap_with_employee_code TEXT,
  reason TEXT NOT NULL,
  approver_id UUID REFERENCES public.employees(id),
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shift_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shift_change requests in their companies" ON public.shift_change_requests
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can insert shift_change requests in their companies" ON public.shift_change_requests
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can update shift_change requests in their companies" ON public.shift_change_requests
  FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can delete shift_change requests in their companies" ON public.shift_change_requests
  FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- =============================================
-- 4. BUSINESS TRIP REQUESTS TABLE (Đơn công tác)
-- =============================================
CREATE TABLE public.business_trip_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL DEFAULT 1,
  purpose TEXT NOT NULL,
  transportation TEXT DEFAULT 'company_car', -- company_car, personal_car, taxi, plane, train, bus, other
  accommodation TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  advance_amount NUMERIC DEFAULT 0,
  companions TEXT, -- JSON array of companion names
  contact_info TEXT,
  approver_id UUID REFERENCES public.employees(id),
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled, completed
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  actual_cost NUMERIC,
  expense_report_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_trip_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view business_trip requests in their companies" ON public.business_trip_requests
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can insert business_trip requests in their companies" ON public.business_trip_requests
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can update business_trip requests in their companies" ON public.business_trip_requests
  FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can delete business_trip requests in their companies" ON public.business_trip_requests
  FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- =============================================
-- 5. OVERTIME REQUESTS TABLE (Đơn làm thêm giờ)
-- =============================================
CREATE TABLE public.overtime_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  overtime_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours NUMERIC NOT NULL DEFAULT 0,
  overtime_type TEXT NOT NULL DEFAULT 'weekday', -- weekday, weekend, holiday
  coefficient NUMERIC DEFAULT 1.5, -- 1.5, 2.0, 3.0
  reason TEXT NOT NULL,
  compensation_type TEXT DEFAULT 'salary', -- salary, compensatory_leave
  approver_id UUID REFERENCES public.employees(id),
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  actual_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view overtime requests in their companies" ON public.overtime_requests
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can insert overtime requests in their companies" ON public.overtime_requests
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can update overtime requests in their companies" ON public.overtime_requests
  FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can delete overtime requests in their companies" ON public.overtime_requests
  FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- =============================================
-- 6. ATTENDANCE UPDATE REQUESTS TABLE (Đơn cập nhật công)
-- =============================================
CREATE TABLE public.attendance_update_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  attendance_date DATE NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'forgot_check', -- check_in, check_out, both, forgot_check
  current_check_in TIME,
  current_check_out TIME,
  requested_check_in TIME,
  requested_check_out TIME,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  approver_id UUID REFERENCES public.employees(id),
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance_update_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendance_update requests in their companies" ON public.attendance_update_requests
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can insert attendance_update requests in their companies" ON public.attendance_update_requests
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can update attendance_update requests in their companies" ON public.attendance_update_requests
  FOR UPDATE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));
CREATE POLICY "Users can delete attendance_update requests in their companies" ON public.attendance_update_requests
  FOR DELETE USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- =============================================
-- CREATE TRIGGERS FOR updated_at
-- =============================================
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_late_early_requests_updated_at
  BEFORE UPDATE ON public.late_early_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_change_requests_updated_at
  BEFORE UPDATE ON public.shift_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_trip_requests_updated_at
  BEFORE UPDATE ON public.business_trip_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_overtime_requests_updated_at
  BEFORE UPDATE ON public.overtime_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_update_requests_updated_at
  BEFORE UPDATE ON public.attendance_update_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX idx_leave_requests_company ON public.leave_requests(company_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

CREATE INDEX idx_late_early_requests_company ON public.late_early_requests(company_id);
CREATE INDEX idx_late_early_requests_employee ON public.late_early_requests(employee_id);
CREATE INDEX idx_late_early_requests_status ON public.late_early_requests(status);

CREATE INDEX idx_shift_change_requests_company ON public.shift_change_requests(company_id);
CREATE INDEX idx_shift_change_requests_employee ON public.shift_change_requests(employee_id);
CREATE INDEX idx_shift_change_requests_status ON public.shift_change_requests(status);

CREATE INDEX idx_business_trip_requests_company ON public.business_trip_requests(company_id);
CREATE INDEX idx_business_trip_requests_employee ON public.business_trip_requests(employee_id);
CREATE INDEX idx_business_trip_requests_status ON public.business_trip_requests(status);

CREATE INDEX idx_overtime_requests_company ON public.overtime_requests(company_id);
CREATE INDEX idx_overtime_requests_employee ON public.overtime_requests(employee_id);
CREATE INDEX idx_overtime_requests_status ON public.overtime_requests(status);

CREATE INDEX idx_attendance_update_requests_company ON public.attendance_update_requests(company_id);
CREATE INDEX idx_attendance_update_requests_employee ON public.attendance_update_requests(employee_id);
CREATE INDEX idx_attendance_update_requests_status ON public.attendance_update_requests(status);