-- Create storage bucket for employee avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-avatars', 'employee-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to view avatars (public bucket)
CREATE POLICY "Anyone can view employee avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-avatars');

-- Allow authenticated users to upload avatars for their company employees
CREATE POLICY "Users can upload employee avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'employee-avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their uploaded avatars
CREATE POLICY "Users can update employee avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'employee-avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete avatars
CREATE POLICY "Users can delete employee avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'employee-avatars' 
  AND auth.role() = 'authenticated'
);