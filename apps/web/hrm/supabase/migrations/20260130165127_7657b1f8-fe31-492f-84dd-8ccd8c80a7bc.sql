-- Create attendance_sheets table (Bảng chấm công)
CREATE TABLE public.attendance_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  attendance_type TEXT NOT NULL DEFAULT 'daily', -- 'daily' or 'hourly'
  standard_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'monthly'
  department TEXT,
  positions TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on attendance_sheets
ALTER TABLE public.attendance_sheets ENABLE ROW LEVEL SECURITY;

-- RLS policies for attendance_sheets
CREATE POLICY "Users can view attendance_sheets in their companies"
ON public.attendance_sheets FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert attendance_sheets in their companies"
ON public.attendance_sheets FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update attendance_sheets in their companies"
ON public.attendance_sheets FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete attendance_sheets in their companies"
ON public.attendance_sheets FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create work_shifts table (Ca làm việc)
CREATE TABLE public.work_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  break_start TIME,
  break_end TIME,
  work_hours NUMERIC DEFAULT 8,
  coefficient NUMERIC DEFAULT 1,
  is_night_shift BOOLEAN DEFAULT false,
  is_overtime_shift BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#3b82f6',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_shifts
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_shifts
CREATE POLICY "Users can view work_shifts in their companies"
ON public.work_shifts FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert work_shifts in their companies"
ON public.work_shifts FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update work_shifts in their companies"
ON public.work_shifts FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete work_shifts in their companies"
ON public.work_shifts FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create attendance_rules table (Quy định chấm công)
CREATE TABLE public.attendance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE, -- One rule per company
  
  -- Time settings
  work_start_day INTEGER DEFAULT 1, -- 1-28
  work_end_day INTEGER DEFAULT 31, -- 1-31
  work_days TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri'],
  
  -- Rounding settings
  round_in_minutes INTEGER DEFAULT 0, -- 0, 5, 10, 15
  round_out_minutes INTEGER DEFAULT 0,
  
  -- Standard workdays settings
  standard_type TEXT DEFAULT 'fixed', -- 'fixed' or 'monthly'
  standard_days_per_month INTEGER DEFAULT 26,
  hours_per_day INTEGER DEFAULT 8,
  
  -- Options
  allow_multiple_checkin BOOLEAN DEFAULT true,
  auto_checkout BOOLEAN DEFAULT false,
  notify_late BOOLEAN DEFAULT true,
  
  -- App settings
  gps_enabled BOOLEAN DEFAULT true,
  wifi_enabled BOOLEAN DEFAULT true,
  qr_enabled BOOLEAN DEFAULT false,
  faceid_enabled BOOLEAN DEFAULT false,
  
  -- GPS locations (JSON array)
  gps_locations JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on attendance_rules
ALTER TABLE public.attendance_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for attendance_rules
CREATE POLICY "Users can view attendance_rules in their companies"
ON public.attendance_rules FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert attendance_rules in their companies"
ON public.attendance_rules FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update attendance_rules in their companies"
ON public.attendance_rules FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete attendance_rules in their companies"
ON public.attendance_rules FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create employee_shift_assignments table (Phân ca cho nhân viên)
CREATE TABLE public.employee_shift_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  shift_id UUID NOT NULL REFERENCES public.work_shifts(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'absent'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employee_shift_assignments
ALTER TABLE public.employee_shift_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_shift_assignments
CREATE POLICY "Users can view shift_assignments in their companies"
ON public.employee_shift_assignments FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert shift_assignments in their companies"
ON public.employee_shift_assignments FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update shift_assignments in their companies"
ON public.employee_shift_assignments FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete shift_assignments in their companies"
ON public.employee_shift_assignments FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Add index for better query performance
CREATE INDEX idx_attendance_sheets_company_date ON public.attendance_sheets(company_id, start_date, end_date);
CREATE INDEX idx_work_shifts_company ON public.work_shifts(company_id, status);
CREATE INDEX idx_employee_shift_assignments_date ON public.employee_shift_assignments(company_id, assignment_date);
CREATE INDEX idx_employee_shift_assignments_employee ON public.employee_shift_assignments(employee_id, assignment_date);