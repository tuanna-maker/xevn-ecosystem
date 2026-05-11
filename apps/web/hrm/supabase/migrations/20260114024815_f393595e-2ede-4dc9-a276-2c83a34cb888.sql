-- Add campaign_id column to candidate_applications table to link applications to campaigns
ALTER TABLE public.candidate_applications 
ADD COLUMN campaign_id UUID REFERENCES public.recruitment_campaigns(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_candidate_applications_campaign_id ON public.candidate_applications(campaign_id);