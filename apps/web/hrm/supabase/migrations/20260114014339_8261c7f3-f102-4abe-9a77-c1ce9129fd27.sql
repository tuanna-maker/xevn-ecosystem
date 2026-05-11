-- Create interviews table for scheduling interviews
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  candidate_phone TEXT,
  position TEXT,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  interview_type TEXT DEFAULT 'onsite' CHECK (interview_type IN ('onsite', 'online', 'phone')),
  location TEXT,
  meeting_link TEXT,
  interviewer_name TEXT,
  interviewer_email TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view interviews in their companies"
ON public.interviews
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.user_company_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can create interviews in their companies"
ON public.interviews
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.user_company_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can update interviews in their companies"
ON public.interviews
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.user_company_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can delete interviews in their companies"
ON public.interviews
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.user_company_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();