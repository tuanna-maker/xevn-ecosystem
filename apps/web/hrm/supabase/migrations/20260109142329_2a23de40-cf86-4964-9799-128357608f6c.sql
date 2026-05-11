-- Create insurance table
CREATE TABLE public.insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_avatar TEXT,
  department TEXT,
  social_insurance_number TEXT,
  health_insurance_number TEXT,
  unemployment_insurance_number TEXT,
  social_insurance_rate DECIMAL(5,2) DEFAULT 8.0,
  health_insurance_rate DECIMAL(5,2) DEFAULT 1.5,
  unemployment_insurance_rate DECIMAL(5,2) DEFAULT 1.0,
  base_salary DECIMAL(15,2),
  effective_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.insurance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view insurance" 
ON public.insurance 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert insurance" 
ON public.insurance 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update insurance" 
ON public.insurance 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete insurance" 
ON public.insurance 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_insurance_updated_at
BEFORE UPDATE ON public.insurance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();