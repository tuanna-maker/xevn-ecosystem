-- Create recruitment_campaigns table
CREATE TABLE public.recruitment_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  owner_name TEXT,
  follower_name TEXT,
  position TEXT,
  title TEXT,
  department TEXT,
  work_type TEXT,
  location TEXT,
  evaluation_criteria TEXT,
  salary_level TEXT,
  quantity INTEGER DEFAULT 1,
  requirements TEXT,
  degree TEXT,
  major TEXT,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recruitment_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view campaigns in their companies" 
ON public.recruitment_campaigns 
FOR SELECT 
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert campaigns in their companies" 
ON public.recruitment_campaigns 
FOR INSERT 
WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update campaigns in their companies" 
ON public.recruitment_campaigns 
FOR UPDATE 
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete campaigns in their companies" 
ON public.recruitment_campaigns 
FOR DELETE 
USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recruitment_campaigns_updated_at
BEFORE UPDATE ON public.recruitment_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();