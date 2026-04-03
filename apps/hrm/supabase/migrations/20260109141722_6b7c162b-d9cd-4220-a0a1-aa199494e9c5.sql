-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_code TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_avatar TEXT,
  department TEXT,
  contract_type TEXT NOT NULL DEFAULT 'Hợp đồng 1 năm',
  effective_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view contracts" 
ON public.contracts 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage contracts
CREATE POLICY "Authenticated users can insert contracts" 
ON public.contracts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts" 
ON public.contracts 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete contracts" 
ON public.contracts 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();