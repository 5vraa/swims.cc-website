-- Set Up Storage Policies via SQL
-- NOTE: You must create the buckets manually in Supabase Dashboard first!
-- Go to: Storage → Create bucket for each: avatars, music, backgrounds, uploads

-- 1. First, verify your buckets exist
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 2. Set up storage policies for public access
-- Allow public read access to all buckets
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
  ));

-- Allow authenticated users to upload to all buckets
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

-- Allow users to update their own files
CREATE POLICY "User Update Own Files" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1] AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

-- Allow users to delete their own files
CREATE POLICY "User Delete Own Files" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1] AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

-- 3. Verify policies were created
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
