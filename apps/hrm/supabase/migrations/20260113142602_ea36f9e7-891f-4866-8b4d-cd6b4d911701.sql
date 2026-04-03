-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts', 
  'contracts', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for contract files storage
CREATE POLICY "Users can upload contract files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contracts' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view contract files"
ON storage.objects FOR SELECT
USING (bucket_id = 'contracts');

CREATE POLICY "Users can update their contract files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contracts' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their contract files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contracts' 
  AND auth.uid() IS NOT NULL
);