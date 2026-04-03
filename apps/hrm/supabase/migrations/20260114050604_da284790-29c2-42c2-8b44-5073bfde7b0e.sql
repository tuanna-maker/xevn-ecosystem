-- Create table for evaluation criteria templates
CREATE TABLE public.evaluation_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  weight NUMERIC(5,2) NOT NULL DEFAULT 10,
  default_required_score INTEGER NOT NULL DEFAULT 3 CHECK (default_required_score >= 1 AND default_required_score <= 5),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for candidate evaluations
CREATE TABLE public.candidate_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  interview_id UUID REFERENCES public.interviews(id) ON DELETE SET NULL,
  evaluator_name TEXT,
  evaluator_email TEXT,
  total_score NUMERIC(5,2),
  weighted_score NUMERIC(5,2),
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'pass', 'fail', 'hold')),
  overall_feedback TEXT,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual evaluation scores
CREATE TABLE public.candidate_evaluation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.candidate_evaluations(id) ON DELETE CASCADE,
  criterion_id UUID REFERENCES public.evaluation_criteria(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  criterion_name TEXT NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  required_score INTEGER NOT NULL CHECK (required_score >= 1 AND required_score <= 5),
  actual_score INTEGER CHECK (actual_score >= 1 AND actual_score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_evaluation_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for evaluation_criteria
CREATE POLICY "Users can view evaluation criteria of their companies"
  ON public.evaluation_criteria FOR SELECT
  USING (public.user_belongs_to_company(company_id, auth.uid()));

CREATE POLICY "Users can insert evaluation criteria for their companies"
  ON public.evaluation_criteria FOR INSERT
  WITH CHECK (public.user_belongs_to_company(company_id, auth.uid()));

CREATE POLICY "Users can update evaluation criteria of their companies"
  ON public.evaluation_criteria FOR UPDATE
  USING (public.user_belongs_to_company(company_id, auth.uid()));

CREATE POLICY "Users can delete evaluation criteria of their companies"
  ON public.evaluation_criteria FOR DELETE
  USING (public.user_belongs_to_company(company_id, auth.uid()));

-- RLS policies for candidate_evaluations
CREATE POLICY "Users can view candidate evaluations of their companies"
  ON public.candidate_evaluations FOR SELECT
  USING (public.user_belongs_to_company(company_id, auth.uid()));

CREATE POLICY "Users can insert candidate evaluations for their companies"
  ON public.candidate_evaluations FOR INSERT
  WITH CHECK (public.user_belongs_to_company(company_id, auth.uid()));

CREATE POLICY "Users can update candidate evaluations of their companies"
  ON public.candidate_evaluations FOR UPDATE
  USING (public.user_belongs_to_company(company_id, auth.uid()));

CREATE POLICY "Users can delete candidate evaluations of their companies"
  ON public.candidate_evaluations FOR DELETE
  USING (public.user_belongs_to_company(company_id, auth.uid()));

-- RLS policies for candidate_evaluation_scores (via evaluation_id join)
CREATE POLICY "Users can view evaluation scores via evaluations"
  ON public.candidate_evaluation_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.candidate_evaluations ce 
    WHERE ce.id = evaluation_id 
    AND public.user_belongs_to_company(ce.company_id, auth.uid())
  ));

CREATE POLICY "Users can insert evaluation scores via evaluations"
  ON public.candidate_evaluation_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.candidate_evaluations ce 
    WHERE ce.id = evaluation_id 
    AND public.user_belongs_to_company(ce.company_id, auth.uid())
  ));

CREATE POLICY "Users can update evaluation scores via evaluations"
  ON public.candidate_evaluation_scores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.candidate_evaluations ce 
    WHERE ce.id = evaluation_id 
    AND public.user_belongs_to_company(ce.company_id, auth.uid())
  ));

CREATE POLICY "Users can delete evaluation scores via evaluations"
  ON public.candidate_evaluation_scores FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.candidate_evaluations ce 
    WHERE ce.id = evaluation_id 
    AND public.user_belongs_to_company(ce.company_id, auth.uid())
  ));

-- Create indexes
CREATE INDEX idx_evaluation_criteria_company ON public.evaluation_criteria(company_id);
CREATE INDEX idx_candidate_evaluations_company ON public.candidate_evaluations(company_id);
CREATE INDEX idx_candidate_evaluations_candidate ON public.candidate_evaluations(candidate_id);
CREATE INDEX idx_candidate_evaluations_interview ON public.candidate_evaluations(interview_id);
CREATE INDEX idx_candidate_evaluation_scores_evaluation ON public.candidate_evaluation_scores(evaluation_id);

-- Create updated_at triggers
CREATE TRIGGER update_evaluation_criteria_updated_at
  BEFORE UPDATE ON public.evaluation_criteria
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_evaluations_updated_at
  BEFORE UPDATE ON public.candidate_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();