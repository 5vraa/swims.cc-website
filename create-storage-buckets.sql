-- Create Storage Buckets via SQL
-- Run this in your Supabase SQL editor

-- 1. Create avatars bucket for profile pictures
SELECT storage.create_bucket(
  'avatars',
  options := '{
    "public": true,
    "allowedMimeTypes": ["image/*"],
    "fileSizeLimit": 52428800
  }'::jsonb
);

-- 2. Create music bucket for audio files
SELECT storage.create_bucket(
  'music',
  options := '{
    "public": true,
    "allowedMimeTypes": ["audio/*"],
    "fileSizeLimit": 104857600
  }'::jsonb
);

-- 3. Create backgrounds bucket for profile background images
SELECT storage.create_bucket(
  'backgrounds',
  options := '{
    "public": true,
    "allowedMimeTypes": ["image/*"],
    "fileSizeLimit": 52428800
  }'::jsonb
);

-- 4. Create general uploads bucket as fallback
SELECT storage.create_bucket(
  'uploads',
  options := '{
    "public": true,
    "allowedMimeTypes": ["image/*", "audio/*", "video/*"],
    "fileSizeLimit": 104857600
  }'::jsonb
);

-- 5. Verify buckets were created
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 6. Set up storage policies for public access
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
