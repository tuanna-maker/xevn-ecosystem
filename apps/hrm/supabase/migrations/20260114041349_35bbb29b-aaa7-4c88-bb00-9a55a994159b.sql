-- Add source_proposal_id column to job_postings to track which proposal it came from
ALTER TABLE public.job_postings 
ADD COLUMN IF NOT EXISTS source_proposal_id uuid REFERENCES public.headcount_proposals(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_postings_source_proposal_id ON public.job_postings(source_proposal_id);

-- Add comment for documentation
COMMENT ON COLUMN public.job_postings.source_proposal_id IS 'Reference to the headcount proposal this job posting was created from';