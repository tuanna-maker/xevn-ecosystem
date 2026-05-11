-- Bảng chính sách thưởng
CREATE TABLE public.bonus_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly, kpi, sales, holiday, excellence, other
  description TEXT,
  calculation_method TEXT NOT NULL DEFAULT 'fixed', -- fixed, percentage, formula, tier
  base_value NUMERIC DEFAULT 0,
  percentage_base TEXT, -- base_salary, gross_salary, net_salary, kpi_score, sales_amount
  formula TEXT,
  tiers JSONB, -- [{ from: number, to: number, value: number, type: 'fixed' | 'percentage' }]
  conditions TEXT[],
  effective_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- active, inactive, draft
  applied_departments TEXT[],
  applied_positions TEXT[],
  participant_count INTEGER DEFAULT 0,
  total_paid_amount NUMERIC DEFAULT 0,
  last_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Bảng người tham gia chính sách thưởng
CREATE TABLE public.bonus_policy_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.bonus_policies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_bonus_amount NUMERIC,
  last_bonus_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, suspended, pending
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(policy_id, employee_id)
);

-- Bảng tạm ứng
CREATE TABLE public.advance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  salary_period TEXT NOT NULL,
  department TEXT,
  position TEXT,
  employee_count INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, paid, rejected
  current_approval_level INTEGER DEFAULT 1,
  approval_steps JSONB, -- [{ level, title, approverName, approverPosition, status, approvedAt, note }]
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng chi tiết tạm ứng nhân viên
CREATE TABLE public.advance_request_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.advance_requests(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  advance_amount NUMERIC NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng bảng lương (payroll batches)
CREATE TABLE public.payroll_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  salary_period TEXT NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  department TEXT,
  position TEXT,
  template_id UUID REFERENCES public.salary_templates(id),
  employee_count INTEGER DEFAULT 0,
  total_gross NUMERIC DEFAULT 0,
  total_deduction NUMERIC DEFAULT 0,
  total_net NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending, approved, locked, paid
  current_approval_level INTEGER DEFAULT 1,
  approval_steps JSONB,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng chi tiết lương nhân viên trong batch
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.payroll_batches(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  base_salary NUMERIC DEFAULT 0,
  allowances NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  overtime NUMERIC DEFAULT 0,
  insurance_deduction NUMERIC DEFAULT 0,
  tax_deduction NUMERIC DEFAULT 0,
  other_deduction NUMERIC DEFAULT 0,
  gross_salary NUMERIC DEFAULT 0,
  net_salary NUMERIC DEFAULT 0,
  work_days NUMERIC DEFAULT 0,
  actual_work_days NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  late_days INTEGER DEFAULT 0,
  leave_days INTEGER DEFAULT 0,
  component_values JSONB, -- Lưu giá trị từng thành phần lương
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng chi trả lương
CREATE TABLE public.payment_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payroll_batch_id UUID REFERENCES public.payroll_batches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  salary_period TEXT NOT NULL,
  department TEXT,
  position TEXT,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer', -- bank_transfer, cash, check
  bank_name TEXT,
  employee_count INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  paid_count INTEGER DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled
  payment_date DATE,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng chi tiết chi trả cho từng nhân viên
CREATE TABLE public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payment_batch_id UUID NOT NULL REFERENCES public.payment_batches(id) ON DELETE CASCADE,
  payroll_record_id UUID REFERENCES public.payroll_records(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  bank_name TEXT,
  bank_account TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
  paid_at TIMESTAMP WITH TIME ZONE,
  transaction_ref TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bonus_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_policy_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_request_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bonus_policies
CREATE POLICY "Users can view bonus policies in their companies"
ON public.bonus_policies FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert bonus policies in their companies"
ON public.bonus_policies FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update bonus policies in their companies"
ON public.bonus_policies FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete bonus policies in their companies"
ON public.bonus_policies FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for bonus_policy_participants
CREATE POLICY "Users can view bonus participants in their companies"
ON public.bonus_policy_participants FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert bonus participants in their companies"
ON public.bonus_policy_participants FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update bonus participants in their companies"
ON public.bonus_policy_participants FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete bonus participants in their companies"
ON public.bonus_policy_participants FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for advance_requests
CREATE POLICY "Users can view advance requests in their companies"
ON public.advance_requests FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert advance requests in their companies"
ON public.advance_requests FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update advance requests in their companies"
ON public.advance_requests FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete advance requests in their companies"
ON public.advance_requests FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for advance_request_employees
CREATE POLICY "Users can view advance employees in their companies"
ON public.advance_request_employees FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert advance employees in their companies"
ON public.advance_request_employees FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update advance employees in their companies"
ON public.advance_request_employees FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete advance employees in their companies"
ON public.advance_request_employees FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for payroll_batches
CREATE POLICY "Users can view payroll batches in their companies"
ON public.payroll_batches FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert payroll batches in their companies"
ON public.payroll_batches FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update payroll batches in their companies"
ON public.payroll_batches FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete payroll batches in their companies"
ON public.payroll_batches FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for payroll_records
CREATE POLICY "Users can view payroll records in their companies"
ON public.payroll_records FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert payroll records in their companies"
ON public.payroll_records FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update payroll records in their companies"
ON public.payroll_records FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete payroll records in their companies"
ON public.payroll_records FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for payment_batches
CREATE POLICY "Users can view payment batches in their companies"
ON public.payment_batches FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert payment batches in their companies"
ON public.payment_batches FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update payment batches in their companies"
ON public.payment_batches FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete payment batches in their companies"
ON public.payment_batches FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS Policies for payment_records
CREATE POLICY "Users can view payment records in their companies"
ON public.payment_records FOR SELECT
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert payment records in their companies"
ON public.payment_records FOR INSERT
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update payment records in their companies"
ON public.payment_records FOR UPDATE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete payment records in their companies"
ON public.payment_records FOR DELETE
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Indexes for better performance
CREATE INDEX idx_bonus_policies_company ON public.bonus_policies(company_id);
CREATE INDEX idx_bonus_participants_policy ON public.bonus_policy_participants(policy_id);
CREATE INDEX idx_advance_requests_company ON public.advance_requests(company_id);
CREATE INDEX idx_advance_employees_request ON public.advance_request_employees(request_id);
CREATE INDEX idx_payroll_batches_company ON public.payroll_batches(company_id);
CREATE INDEX idx_payroll_batches_period ON public.payroll_batches(period_month, period_year);
CREATE INDEX idx_payroll_records_batch ON public.payroll_records(batch_id);
CREATE INDEX idx_payment_batches_company ON public.payment_batches(company_id);
CREATE INDEX idx_payment_records_batch ON public.payment_records(payment_batch_id);

-- Update trigger for updated_at
CREATE TRIGGER update_bonus_policies_updated_at
  BEFORE UPDATE ON public.bonus_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bonus_policy_participants_updated_at
  BEFORE UPDATE ON public.bonus_policy_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advance_requests_updated_at
  BEFORE UPDATE ON public.advance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advance_request_employees_updated_at
  BEFORE UPDATE ON public.advance_request_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_batches_updated_at
  BEFORE UPDATE ON public.payroll_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_records_updated_at
  BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_batches_updated_at
  BEFORE UPDATE ON public.payment_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();