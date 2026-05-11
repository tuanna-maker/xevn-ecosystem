-- Add interview_round column to track multiple interview rounds
ALTER TABLE public.interviews 
ADD COLUMN IF NOT EXISTS interview_round INTEGER DEFAULT 1;

-- Add result column for pass/fail/pending decision
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'pass', 'fail', 'hold'));

-- Add next_steps column for follow-up actions
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS next_steps TEXT;

-- Update status CHECK constraint to include 'confirmed' status
-- First drop the old constraint
ALTER TABLE public.interviews DROP CONSTRAINT IF EXISTS interviews_status_check;

-- Add new constraint with all statuses
ALTER TABLE public.interviews ADD CONSTRAINT interviews_status_check 
  CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'));

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_interview_date ON public.interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_posting_id ON public.interviews(job_posting_id);

-- Add updated_at trigger
CREATE OR REPLACE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();