-- Check Your Current Storage Setup
-- This will show us what buckets exist and their configuration

-- 1. Check what storage buckets you have
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY name;

-- 2. Check if you have any files uploaded
SELECT 
  bucket_id,
  name,
  owner,
  created_at,
  metadata
FROM storage.objects
LIMIT 10;

-- 3. Check your current user and role
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 4. Check if you have any existing policies
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
