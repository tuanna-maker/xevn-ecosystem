-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', true)
ON CONFLICT (id) DO NOTHING;

-- Add file_url column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Create RLS policies for contract-files bucket
CREATE POLICY "Anyone can view contract files"
ON storage.objects FOR SELECT
USING (bucket_id = 'contract-files');

CREATE POLICY "Anyone can upload contract files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contract-files');

CREATE POLICY "Anyone can update contract files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contract-files');

CREATE POLICY "Anyone can delete contract files"
ON storage.objects FOR DELETE
USING (bucket_id = 'contract-files');