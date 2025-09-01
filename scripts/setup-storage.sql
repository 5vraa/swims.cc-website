-- Setup Storage Buckets for File Uploads
-- Run this in your Supabase SQL editor to ensure storage is properly configured

-- 1. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 52428800, '["image/*"]'),
  ('backgrounds', 'backgrounds', true, 52428800, '["image/*"]'),
  ('music', 'music', true, 104857600, '["audio/*"]'),
  ('uploads', 'uploads', true, 104857600, '["image/*", "audio/*", "video/*"]')
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for public access
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
  ));

-- 3. Create storage policies for authenticated uploads
CREATE POLICY IF NOT EXISTS "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

-- 4. Create storage policies for user file management
CREATE POLICY IF NOT EXISTS "User Update Own Files" ON storage.objects
  FOR UPDATE USING (
    auth.uid() = owner AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

CREATE POLICY IF NOT EXISTS "User Delete Own Files" ON storage.objects
  FOR DELETE USING (
    auth.uid() = owner AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

-- 5. Verify buckets were created
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
ORDER BY name;

-- 6. Show storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
