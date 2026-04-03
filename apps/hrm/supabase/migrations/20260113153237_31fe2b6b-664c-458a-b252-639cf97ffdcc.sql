-- Create storage bucket for decision files
INSERT INTO storage.buckets (id, name, public)
VALUES ('decision-files', 'decision-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload decision files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'decision-files');

-- Create policy to allow authenticated users to view files
CREATE POLICY "Anyone can view decision files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'decision-files');

-- Create policy to allow authenticated users to update their files
CREATE POLICY "Authenticated users can update decision files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'decision-files');

-- Create policy to allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete decision files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'decision-files');