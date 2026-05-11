-- Create sales_data table for storing employee sales information
CREATE TABLE public.sales_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  
  -- Sales period
  period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  period_year INTEGER NOT NULL CHECK (period_year >= 2000),
  
  -- Sales metrics
  sales_target NUMERIC(18,2) DEFAULT 0,
  actual_sales NUMERIC(18,2) DEFAULT 0,
  achievement_rate NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN sales_target > 0 THEN ROUND((actual_sales / sales_target) * 100, 2) ELSE 0 END
  ) STORED,
  
  -- Commission calculation
  commission_rate NUMERIC(5,2) DEFAULT 0,
  commission_amount NUMERIC(18,2) DEFAULT 0,
  bonus_amount NUMERIC(18,2) DEFAULT 0,
  total_earnings NUMERIC(18,2) GENERATED ALWAYS AS (commission_amount + bonus_amount) STORED,
  
  -- Additional metrics
  order_count INTEGER DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  new_customer_count INTEGER DEFAULT 0,
  
  -- Sync info
  sync_source TEXT, -- 'manual', 'import', 'api'
  synced_at TIMESTAMPTZ,
  external_id TEXT, -- ID from external system if synced
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint per employee per period per company
  UNIQUE(company_id, employee_code, period_month, period_year)
);

-- Enable RLS
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view sales data in their companies"
  ON public.sales_data FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert sales data in their companies"
  ON public.sales_data FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update sales data in their companies"
  ON public.sales_data FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete sales data in their companies"
  ON public.sales_data FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create indexes for performance
CREATE INDEX idx_sales_data_company_id ON public.sales_data(company_id);
CREATE INDEX idx_sales_data_employee_id ON public.sales_data(employee_id);
CREATE INDEX idx_sales_data_period ON public.sales_data(period_year, period_month);
CREATE INDEX idx_sales_data_employee_code ON public.sales_data(employee_code);

-- Create trigger for updated_at
CREATE TRIGGER update_sales_data_updated_at
  BEFORE UPDATE ON public.sales_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();