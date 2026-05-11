
-- Add new columns to company_processes
ALTER TABLE public.company_processes 
  ADD COLUMN IF NOT EXISTS issuing_authority text,
  ADD COLUMN IF NOT EXISTS file_urls jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for process files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('process-files', 'process-files', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for process-files bucket
CREATE POLICY "Authenticated users can upload process files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'process-files');

CREATE POLICY "Authenticated users can read process files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'process-files');

CREATE POLICY "Authenticated users can delete process files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'process-files');
