-- Create attendance_records table for storing actual employee attendance data
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  
  -- Attendance date and time
  attendance_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  
  -- Work hours calculation
  scheduled_hours NUMERIC DEFAULT 8,
  actual_hours NUMERIC,
  overtime_hours NUMERIC DEFAULT 0,
  
  -- Status and type
  status TEXT NOT NULL DEFAULT 'present', -- present, absent, late, early_leave, on_leave, business_trip, holiday, weekend
  attendance_type TEXT DEFAULT 'normal', -- normal, remote, field_work
  
  -- Late/Early tracking
  late_minutes INTEGER DEFAULT 0,
  early_leave_minutes INTEGER DEFAULT 0,
  
  -- Leave/Request references
  leave_type TEXT, -- annual, sick, personal, maternity, etc.
  leave_request_id UUID,
  
  -- Location and device info
  check_in_location TEXT,
  check_out_location TEXT,
  check_in_device TEXT,
  check_out_device TEXT,
  
  -- Notes and approval
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one record per employee per day
  UNIQUE(employee_id, attendance_date)
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view attendance in their companies"
ON public.attendance_records
FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert attendance in their companies"
ON public.attendance_records
FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update attendance in their companies"
ON public.attendance_records
FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete attendance in their companies"
ON public.attendance_records
FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create indexes for better query performance
CREATE INDEX idx_attendance_records_company_id ON public.attendance_records(company_id);
CREATE INDEX idx_attendance_records_employee_id ON public.attendance_records(employee_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_records_status ON public.attendance_records(status);
CREATE INDEX idx_attendance_records_company_date ON public.attendance_records(company_id, attendance_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();